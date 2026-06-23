// Veloz Maintenance AI — Fleet Incident Report System (V1, Phase 1)
// AI-ready data model. Mock/demo data only — no Firestore writes yet.

import type { StatusKey } from "./colors";

/** Incident severity — drives operational color + triage priority. */
export type IncidentSeverity = "critical" | "major" | "minor";

/** Workflow states for an incident's lifecycle. */
export type IncidentStatus = "open" | "in_review" | "resolved";

/** Operational category of the incident. */
export type IncidentType =
  | "breakdown"
  | "tire"
  | "brakes"
  | "electrical"
  | "accident"
  | "mechanical"
  | "compliance"
  | "other";

export type IncidentEquipmentKind = "truck" | "trailer";

/** A single entry on an incident's activity timeline. */
export type IncidentEvent = {
  id: string;
  /** Workflow state this event represents, or a free-form action. */
  kind: "reported" | "in_review" | "resolved" | "note";
  label: string;
  detail?: string;
  by: string;
  at: string; // ISO date
};

export type Incident = {
  id: string;
  /** Human-facing reference code, e.g. INC-2041. */
  code: string;
  title: string;
  summary: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  equipmentKind: IncidentEquipmentKind;
  /** Links to a truck/trailer id in mockData (integration deferred to a later phase). */
  equipmentId: string;
  equipmentName: string;
  location: string;
  mileage?: number;
  reportedBy: string;
  reportedAt: string; // ISO date
  /** Future Firestore Storage refs — placeholder count for Phase 1. */
  photos: number;
  /** Chronological activity log driving the detail timeline. */
  timeline?: IncidentEvent[];
  /** Resolution note captured when the incident is closed out. */
  resolutionNote?: string;
  resolvedAt?: string;
};

export const INCIDENT_TYPE_LABEL: Record<IncidentType, string> = {
  breakdown: "Breakdown",
  tire: "Tire",
  brakes: "Brakes",
  electrical: "Electrical",
  accident: "Accident",
  mechanical: "Mechanical",
  compliance: "Compliance",
  other: "Other",
};

export const INCIDENT_SEVERITY_META: Record<
  IncidentSeverity,
  { label: string; status: StatusKey }
> = {
  critical: { label: "Critical", status: "out" },
  major: { label: "Major", status: "attention" },
  minor: { label: "Minor", status: "operational" },
};

export const INCIDENT_STATUS_META: Record<
  IncidentStatus,
  { label: string }
> = {
  open: { label: "Open" },
  in_review: { label: "In Review" },
  resolved: { label: "Resolved" },
};

export const INCIDENTS: Incident[] = [
  {
    id: "inc1",
    code: "INC-2048",
    title: "Coolant temperature spike on I-20",
    summary:
      "Engine temp climbed to 218°F near Abilene. Driver pulled off, let cool, limped to yard. Suspected water pump.",
    type: "breakdown",
    severity: "critical",
    status: "open",
    equipmentKind: "truck",
    equipmentId: "t4",
    equipmentName: "Veloz 04",
    location: "I-20 W · Abilene, TX",
    mileage: 287950,
    reportedBy: "J. Carter",
    reportedAt: "2026-05-18",
    photos: 3,
    timeline: [
      { id: "e1", kind: "reported", label: "Incident reported", detail: "Driver pulled off near Abilene after temp warning.", by: "J. Carter", at: "2026-05-18" },
      { id: "e2", kind: "note", label: "Towed to yard", detail: "Unit flat-bedded to Fort Worth yard overnight.", by: "Dispatch", at: "2026-05-18" },
    ],
  },
  {
    id: "inc2",
    code: "INC-2047",
    title: "Rear inner tire blowout",
    summary:
      "Driver-side rear inner tire blew at highway speed. No injuries. Spare installed roadside, unit returned to service pending replacement.",
    type: "tire",
    severity: "major",
    status: "in_review",
    equipmentKind: "truck",
    equipmentId: "t2",
    equipmentName: "Veloz 02",
    location: "US-287 N · Wichita Falls, TX",
    mileage: 211200,
    reportedBy: "M. Reyes",
    reportedAt: "2026-05-16",
    photos: 4,
    timeline: [
      { id: "e1", kind: "reported", label: "Incident reported", detail: "Inner tire blew at highway speed, no injuries.", by: "M. Reyes", at: "2026-05-16" },
      { id: "e2", kind: "in_review", label: "Moved to review", detail: "Tire vendor quote requested for replacement set.", by: "Maintenance", at: "2026-05-17" },
    ],
  },
  {
    id: "inc3",
    code: "INC-2045",
    title: "Trailer marker light failure",
    summary:
      "Rear driver-side marker light non-functional during pre-trip. Flagged before dispatch. Wiring inspection requested.",
    type: "electrical",
    severity: "major",
    status: "open",
    equipmentKind: "trailer",
    equipmentId: "tr3",
    equipmentName: "Enclosed 28",
    location: "Veloz Yard · Fort Worth, TX",
    reportedBy: "S. Patel",
    reportedAt: "2026-05-15",
    photos: 2,
  },
  {
    id: "inc4",
    code: "INC-2042",
    title: "Soft brake pedal reported",
    summary:
      "Driver noted spongy brake feel and low reservoir. Unit placed Out of Service pending caliper inspection.",
    type: "brakes",
    severity: "critical",
    status: "in_review",
    equipmentKind: "truck",
    equipmentId: "t4",
    equipmentName: "Veloz 04",
    location: "Veloz Yard · Fort Worth, TX",
    mileage: 287900,
    reportedBy: "J. Carter",
    reportedAt: "2026-05-14",
    photos: 1,
  },
  {
    id: "inc5",
    code: "INC-2039",
    title: "Winch cable fraying near drum",
    summary:
      "Post-trip inspection found fraying on the winch cable close to the drum. Tagged for replacement before next haul.",
    type: "mechanical",
    severity: "minor",
    status: "open",
    equipmentKind: "trailer",
    equipmentId: "tr2",
    equipmentName: "Gooseneck 36",
    location: "Veloz Yard · Fort Worth, TX",
    reportedBy: "M. Reyes",
    reportedAt: "2026-05-12",
    photos: 2,
  },
  {
    id: "inc6",
    code: "INC-2034",
    title: "Registration expired during haul",
    summary:
      "Roadside check flagged lapsed registration. Resolved same day with electronic renewal. No citation issued.",
    type: "compliance",
    severity: "minor",
    status: "resolved",
    equipmentKind: "truck",
    equipmentId: "t2",
    equipmentName: "Veloz 02",
    location: "I-40 · Amarillo, TX",
    mileage: 209800,
    reportedBy: "M. Reyes",
    reportedAt: "2026-05-04",
    photos: 0,
    resolvedAt: "2026-05-04",
    resolutionNote: "Registration renewed electronically same day. No citation issued.",
    timeline: [
      { id: "e1", kind: "reported", label: "Incident reported", detail: "Roadside check flagged lapsed registration.", by: "M. Reyes", at: "2026-05-04" },
      { id: "e2", kind: "resolved", label: "Resolved", detail: "Renewed electronically same day.", by: "Admin", at: "2026-05-04" },
    ],
  },
  {
    id: "inc7",
    code: "INC-2030",
    title: "Minor curb strike — no damage",
    summary:
      "Front passenger wheel clipped a curb during a tight delivery turn. Visual inspection clear, alignment check scheduled.",
    type: "accident",
    severity: "minor",
    status: "resolved",
    equipmentKind: "truck",
    equipmentId: "t5",
    equipmentName: "Veloz 05",
    location: "Downtown · Dallas, TX",
    mileage: 67400,
    reportedBy: "S. Patel",
    reportedAt: "2026-04-28",
    photos: 1,
  },
  {
    id: "inc8",
    code: "INC-2026",
    title: "Bearing running warm",
    summary:
      "Driver-side hub warm to touch at fuel stop. Repacked at yard, cleared for service. Monitoring on next runs.",
    type: "mechanical",
    severity: "major",
    status: "resolved",
    equipmentKind: "trailer",
    equipmentId: "tr2",
    equipmentName: "Gooseneck 36",
    location: "Pilot · Weatherford, TX",
    reportedBy: "M. Reyes",
    reportedAt: "2026-04-20",
    photos: 0,
  },
];

/** Inputs needed to build a brand-new incident from the report flow. */
export type NewIncidentInput = {
  title: string;
  summary: string;
  type: IncidentType;
  severity: IncidentSeverity;
  equipmentKind: IncidentEquipmentKind;
  equipmentId: string;
  equipmentName: string;
  location: string;
  mileage?: number;
  reportedBy: string;
  photos: number;
};

/** Build a fully-formed Incident (with an opening timeline event) from report input. */
export function buildIncident(input: NewIncidentInput, seq: number): Incident {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `inc-${Date.now()}`,
    code: `INC-${2048 + seq}`,
    title: input.title,
    summary: input.summary,
    type: input.type,
    severity: input.severity,
    status: "open",
    equipmentKind: input.equipmentKind,
    equipmentId: input.equipmentId,
    equipmentName: input.equipmentName,
    location: input.location,
    mileage: input.mileage,
    reportedBy: input.reportedBy,
    reportedAt: today,
    photos: input.photos,
    timeline: [
      {
        id: `e-${Date.now()}`,
        kind: "reported",
        label: "Incident reported",
        detail: input.summary,
        by: input.reportedBy,
        at: today,
      },
    ],
  };
}

/** Lightweight rollup for the Incident Center header. Pure helper, AI-ready. */
export function incidentStats(incidents: Incident[]) {
  return {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "open").length,
    inReview: incidents.filter((i) => i.status === "in_review").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
    critical: incidents.filter((i) => i.severity === "critical").length,
  };
}
