/**
 * Default Fleet messaging scope for the authenticated fleet operator using
 * this app. In production this would come from the session/auth context; for
 * now it is a deterministic identity tied to the VelozOS demo tenant/fleet.
 *
 * Kept separate from messagingService.ts so the service stays pure and
 * testable — the UI layer pulls identity from here.
 */
import type { FleetMessagingScope } from "@/services/messagingService";

export const FLEET_SCOPE: FleetMessagingScope = {
  userId: "fleet-op-01",
  role: "fleet_operator",
  tenantId: "veloz-tenant-01",
  organizationId: "veloz-org-01",
  fleetId: "veloz-fleet-01",
};

/** Display name used as senderName on outgoing messages. */
export const FLEET_SENDER_NAME = "Fleet Dispatch";
