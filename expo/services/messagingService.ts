/**
 * VelozOS shared messaging service — Fleet app foundation.
 *
 * Shared platform Firestore collections (no new collections are created here):
 *   - conversations             — conversation metadata
 *   - conversationParticipants  — per-user access rows (who may see a thread)
 *   - messages                  — individual chat messages inside a thread
 *
 * Conversation ID pattern (deterministic, matches HQ):
 *   `<type>-<entityId>`
 *     fleet      -> fleet-fleetId
 *     driver     -> driver-driverId
 *     shipment   -> shipment-shipmentId
 *     emergency  -> emergency-incidentId
 *     dispatch   -> dispatch-<dispatchId>
 *     support    -> support-<ticketId>
 *     organization -> organization-<orgId>
 *
 * This is foundation only — no UI, no tab wiring, no button wiring yet.
 * Every Firestore call is guarded against a null db (Firebase not configured)
 * so the Fleet app remains fully functional in mock/preview builds.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  setDoc,
  addDoc,
  serverTimestamp,
  and,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { getFleetDb } from "@/services/firebase";

// ─────────────────────────────────────────────
// Types — Fleet messaging identity / scope
// ─────────────────────────────────────────────

/** Conversation types supported by the Fleet app. */
export type FleetConversationType =
  | "fleet"
  | "driver"
  | "shipment"
  | "dispatch"
  | "emergency"
  | "support"
  | "organization";

/** Lightweight identity model carried by an authenticated Fleet user. */
export interface FleetMessagingScope {
  userId: string;
  role: string;
  tenantId: string;
  organizationId: string;
  fleetId: string;
}

export interface Conversation {
  id: string;
  type: FleetConversationType;
  entityId: string;
  title: string;
  tenantId: string;
  organizationId?: string;
  fleetId?: string;
  driverId?: string;
  shipmentId?: string;
  incidentId?: string;
  createdAt?: unknown;
  lastMessageAt?: unknown;
  lastMessagePreview?: string;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  role: string;
  tenantId: string;
  organizationId?: string;
  fleetId?: string;
  addedAt?: unknown;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  body: string;
  createdAt?: unknown;
  read?: boolean;
}

// ─────────────────────────────────────────────
// Conversation ID helpers
// ─────────────────────────────────────────────

/**
 * Deterministic conversation id, matching the HQ pattern: `type-entityId`.
 */
export function buildConversationId(
  type: FleetConversationType,
  entityId: string,
): string {
  return `${type}-${entityId}`;
}

// ─────────────────────────────────────────────
// Access control
// ─────────────────────────────────────────────

/**
 * Determine whether a Fleet user may access a given conversation.
 *
 * Access is GRANTED only when the conversation is tied to the caller's
 * tenant AND at least one of the following is true:
 *   - it belongs to their fleet
 *   - it belongs to their organization
 *   - it involves an assigned driver
 *   - it involves an assigned shipment
 *   - it is an emergency incident on one of their assets
 *   - there is an explicit participant row for this user
 *
 * Access is DENIED otherwise — including cross-tenant, vendor, shipper, or
 * unrelated tenant conversations. A missing/null tenantId is always denied.
 */
export function canAccessConversation(
  scope: FleetMessagingScope,
  conversation: Pick<
    Conversation,
    | "tenantId"
    | "organizationId"
    | "fleetId"
    | "driverId"
    | "shipmentId"
    | "incidentId"
  >,
  participant?: ConversationParticipant | null,
): boolean {
  // Hard gate — tenant must always match.
  if (!scope.tenantId || conversation.tenantId !== scope.tenantId) {
    return false;
  }

  // Explicit participant row always grants (still inside the tenant gate).
  if (participant && participant.userId === scope.userId) {
    return true;
  }

  // Same organization.
  if (
    conversation.organizationId &&
    conversation.organizationId === scope.organizationId
  ) {
    return true;
  }

  // Same fleet.
  if (conversation.fleetId && conversation.fleetId === scope.fleetId) {
    return true;
  }

  // Driver threads are allowed only if the driver is explicitly linked to
  // this fleet (the caller is responsible for verifying assignment before
  // requesting access; here we accept any driver thread within the fleet).
  if (conversation.driverId && conversation.fleetId === scope.fleetId) {
    return true;
  }

  // Shipment threads within the same fleet.
  if (conversation.shipmentId && conversation.fleetId === scope.fleetId) {
    return true;
  }

  // Emergency incidents tied to this fleet.
  if (conversation.incidentId && conversation.fleetId === scope.fleetId) {
    return true;
  }

  return false;
}

// ─────────────────────────────────────────────
// Firestore plumbing (all guarded against null db)
// ─────────────────────────────────────────────

function requireDb() {
  const db = getFleetDb();
  if (!db) {
    throw new Error(
      "Fleet messaging: Firebase is not configured in this environment. " +
        "Set EXPO_PUBLIC_FIRESTORE_* env vars to enable live messaging.",
    );
  }
  return db;
}

function conversationsCol() {
  return collection(requireDb(), "conversations");
}
function participantsCol() {
  return collection(requireDb(), "conversationParticipants");
}
function messagesCol() {
  return collection(requireDb(), "messages");
}

// ─────────────────────────────────────────────
// ensureConversation
// ─────────────────────────────────────────────

/**
 * Ensure a platform-shared conversation exists, creating it if needed and
 * registering the calling Fleet user as a participant. Returns the
 * deterministic conversation id.
 *
 * Does NOT grant access to anyone else — participants must be added
 * explicitly via `addParticipant` (not exposed in this foundation).
 */
export async function ensureConversation(
  scope: FleetMessagingScope,
  input: {
    type: FleetConversationType;
    entityId: string;
    title: string;
    fleetId?: string;
    driverId?: string;
    shipmentId?: string;
    incidentId?: string;
    organizationId?: string;
  },
): Promise<string> {
  const conversationId = buildConversationId(input.type, input.entityId);
  const db = requireDb();
  const ref = doc(db, "conversations", conversationId);
  const existing = await getDoc(ref);

  if (!existing.exists()) {
    const payload: Conversation = {
      id: conversationId,
      type: input.type,
      entityId: input.entityId,
      title: input.title,
      tenantId: scope.tenantId,
      organizationId: input.organizationId ?? scope.organizationId,
      fleetId: input.fleetId ?? scope.fleetId,
      driverId: input.driverId,
      shipmentId: input.shipmentId,
      incidentId: input.incidentId,
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: "",
    };
    await setDoc(ref, payload as unknown as DocumentData);
  }

  // Register the caller as a participant (idempotent via deterministic doc id).
  const participantId = `${conversationId}::${scope.userId}`;
  const pRef = doc(db, "conversationParticipants", participantId);
  const pExisting = await getDoc(pRef);
  if (!pExisting.exists()) {
    const participant: ConversationParticipant = {
      conversationId,
      userId: scope.userId,
      role: scope.role,
      tenantId: scope.tenantId,
      organizationId: scope.organizationId,
      fleetId: scope.fleetId,
      addedAt: serverTimestamp(),
    };
    await setDoc(pRef, participant as unknown as DocumentData);
  }

  return conversationId;
}

// ─────────────────────────────────────────────
// sendMessage
// ─────────────────────────────────────────────

/**
 * Send a message into a conversation, after verifying the caller has access.
 * Throws if access is denied (so the UI layer can surface a security error
 * rather than silently dropping the message).
 */
export async function sendMessage(
  scope: FleetMessagingScope,
  conversationId: string,
  body: string,
  senderName: string,
): Promise<string> {
  const db = requireDb();
  const ref = doc(db, "conversations", conversationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }
  const conversation = snap.data() as Conversation;

  // Look up an explicit participant row, if present.
  const participantId = `${conversationId}::${scope.userId}`;
  const pSnap = await getDoc(doc(db, "conversationParticipants", participantId));
  const participant = pSnap.exists()
    ? (pSnap.data() as ConversationParticipant)
    : null;

  if (!canAccessConversation(scope, conversation, participant)) {
    throw new Error(
      "Access denied: this conversation is not tied to your fleet, " +
        "organization, assigned drivers, shipments, or emergency incidents.",
    );
  }

  const message: Omit<Message, "id"> = {
    conversationId,
    senderId: scope.userId,
    senderName,
    senderRole: scope.role,
    body,
    createdAt: serverTimestamp(),
    read: false,
  };
  const docRef = await addDoc(messagesCol(), message as unknown as DocumentData);

  // Update lastMessageAt / preview on the conversation row.
  await setDoc(
    ref,
    {
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: body.slice(0, 140),
    },
    { merge: true },
  );

  return docRef.id;
}

// ─────────────────────────────────────────────
// subscribeMessages
// ─────────────────────────────────────────────

/**
 * Subscribe to new messages on a conversation in real time. The subscription
 * verifies access once at attach time; if denied, the callback receives an
 * Error and no listener is opened.
 *
 * Returns an unsubscribe function (Firebase-compatible).
 */
export function subscribeMessages(
  scope: FleetMessagingScope,
  conversationId: string,
  onMessages: (messages: Message[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  let unsubscribe: Unsubscribe = () => {};

  (async () => {
    try {
      const db = requireDb();
      const ref = doc(db, "conversations", conversationId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        onError?.(new Error(`Conversation not found: ${conversationId}`));
        return;
      }
      const conversation = snap.data() as Conversation;

      const participantId = `${conversationId}::${scope.userId}`;
      const pSnap = await getDoc(
        doc(db, "conversationParticipants", participantId),
      );
      const participant = pSnap.exists()
        ? (pSnap.data() as ConversationParticipant)
        : null;

      if (!canAccessConversation(scope, conversation, participant)) {
        onError?.(
          new Error(
            "Access denied: this conversation is outside your fleet scope.",
          ),
        );
        return;
      }

      const q = query(messagesCol(), where("conversationId", "==", conversationId));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Message, "id">),
          })) as Message[];
          messages.sort((a, b) => {
            const aT = (a.createdAt as { seconds?: number })?.seconds ?? 0;
            const bT = (b.createdAt as { seconds?: number })?.seconds ?? 0;
            return aT - bT;
          });
          onMessages(messages);
        },
        (err) => onError?.(err as Error),
      );
    } catch (err) {
      onError?.(err as Error);
    }
  })();

  return () => unsubscribe();
}

// ─────────────────────────────────────────────
// subscribeParticipants
// ─────────────────────────────────────────────

/**
 * Subscribe to the participant list of a conversation in real time, after
 * verifying access. Returns an unsubscribe function.
 */
export function subscribeParticipants(
  scope: FleetMessagingScope,
  conversationId: string,
  onParticipants: (participants: ConversationParticipant[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  let unsubscribe: Unsubscribe = () => {};

  (async () => {
    try {
      const db = requireDb();
      const ref = doc(db, "conversations", conversationId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        onError?.(new Error(`Conversation not found: ${conversationId}`));
        return;
      }
      const conversation = snap.data() as Conversation;

      const participantId = `${conversationId}::${scope.userId}`;
      const pSnap = await getDoc(
        doc(db, "conversationParticipants", participantId),
      );
      const participant = pSnap.exists()
        ? (pSnap.data() as ConversationParticipant)
        : null;

      if (!canAccessConversation(scope, conversation, participant)) {
        onError?.(
          new Error(
            "Access denied: this conversation is outside your fleet scope.",
          ),
        );
        return;
      }

      const q = query(
        participantsCol(),
        where("conversationId", "==", conversationId),
      );
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const participants = snapshot.docs.map(
            (d) => d.data() as ConversationParticipant,
          );
          onParticipants(participants);
        },
        (err) => onError?.(err as Error),
      );
    } catch (err) {
      onError?.(err as Error);
    }
  })();

  return () => unsubscribe();
}

// ─────────────────────────────────────────────
// Convenience: list conversations visible to a Fleet user
// ─────────────────────────────────────────────

/**
 * List all conversations a Fleet user is permitted to see, by combining an
 * explicit participant lookup with a tenant + fleet scoped query. Kept here so
 * future UI work has a ready entry point — not wired into any screen yet.
 */
export async function listAccessibleConversations(
  scope: FleetMessagingScope,
): Promise<Conversation[]> {
  const db = requireDb();

  // Explicit participant rows for this user (any conversation they were added to).
  const pQ = query(participantsCol(), where("userId", "==", scope.userId));
  const pSnap = await getDocs(pQ);
  const explicitIds = new Set(
    pSnap.docs.map((d) => (d.data() as ConversationParticipant).conversationId),
  );

  // Tenant + fleet scoped conversations.
  const cQ = query(
    conversationsCol(),
    and(
      where("tenantId", "==", scope.tenantId),
      where("fleetId", "==", scope.fleetId),
    ),
  );
  const cSnap = await getDocs(cQ);
  const fleetConvos = cSnap.docs.map((d) => d.data() as Conversation);

  // Pull any conversations the user has an explicit participant row for but
  // that aren't scoped to this fleet (e.g. cross-org shipment threads) —
  // access still goes through canAccessConversation, so this is safe.
  const extras: Conversation[] = [];
  for (const id of explicitIds) {
    if (fleetConvos.some((c) => c.id === id)) continue;
    const cSnap = await getDoc(doc(db, "conversations", id));
    if (cSnap.exists()) {
      const convo = cSnap.data() as Conversation;
      if (canAccessConversation(scope, convo, null)) {
        extras.push(convo);
      }
    }
  }

  return [...fleetConvos, ...extras];
}
