// Veloz Maintenance AI — Fleet Safety & Compliance Reporting System (V1, Phase 1)
// Formal transportation incident reporting. AI-ready data model.
// One incidents collection, category-specific payload under `details`.
// Mock/demo data only — no Firestore writes yet.

import type { StatusKey } from "./colors";

/** Incident severity — drives operational color + triage priority. */
export type IncidentSeverity = "critical" | "major" | "minor";

/** Workflow states for an incident's lifecycle / management review. */
export type IncidentStatus = "open" | "in_review" | "resolved";

/** The five formal report categories supported by Fleet Safety & Compliance. */
export type IncidentCategory =
  | "driver_employee"
  | "safety"
  | "accident"
  | "cargo_damage"
  | "complaint";

export type IncidentEquipmentKind = "truck" | "trailer";

/** A single entry on an incident's activity / review timeline. */
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
  /** Human-facing reference code, e.g. SCR-2041. */
  code: string;
  /** Formal report category. */
  category: IncidentCategory;
  /** Category-specific classification, e.g. "Driver injury". */
  subtype: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;

  // Shared meta — Step 2
  /** Driver / employee involved. */
  driver: string;
  truckId?: string;
  truckName?: string;
  trailerId?: string;
  trailerName?: string;
  loadNumber?: string;
  /** Date the incident occurred. */
  date: string; // ISO date
  time?: string;
  location: string;
  mileage?: number;

  /** Primary equipment for list/detail display (derived). */
  equipmentKind: IncidentEquipmentKind;
  equipmentName: string;

  // Narrative — Step 4
  correctiveAction?: string;
  witnesses?: string;

  /** Category-specific fields keyed by field def `key`. */
  details: Record<string, string>;

  reportedBy: string;
  reportedAt: string; // ISO date
  /** Future Firestore Storage refs — placeholder count for Phase 1. */
  photos: number;
  /** Chronological activity log driving the detail timeline. */
  timeline?: IncidentEvent[];
  /** Resolution note captured on management sign-off. */
  resolutionNote?: string;
  resolvedAt?: string;
};

export const INCIDENT_CATEGORIES: IncidentCategory[] = [
  "driver_employee",
  "safety",
  "accident",
  "cargo_damage",
  "complaint",
];

export const INCIDENT_CATEGORY_META: Record<
  IncidentCategory,
  { label: string; short: string; description: string; subtypes: string[] }
> = {
  driver_employee: {
    label: "Driver / Employee Incident",
    short: "Driver / Employee",
    description: "Injury, illness, training, workplace or conduct events involving a driver or employee.",
    subtypes: [
      "Driver injury",
      "Driver illness",
      "Training incident",
      "Workplace incident",
      "Employee misconduct",
      "Driver stranded",
      "Emergency response follow-up",
    ],
  },
  safety: {
    label: "Safety Incident",
    short: "Safety",
    description: "Equipment failure, mechanical, DOT, unsafe condition, near miss or compliance issue.",
    subtypes: [
      "Equipment failure",
      "Tire failure",
      "Mechanical breakdown",
      "DOT violation",
      "Unsafe condition",
      "Near miss",
      "Compliance issue",
    ],
  },
  accident: {
    label: "Accident Report",
    short: "Accident",
    description: "Vehicle accident, collision, property damage, police response or insurance claim.",
    subtypes: ["Vehicle accident", "Collision", "Property damage", "Police response", "Insurance claim"],
  },
  cargo_damage: {
    label: "Cargo Damage Report",
    short: "Cargo Damage",
    description: "Vehicle or freight damage, securement failure, or customer cargo claim.",
    subtypes: ["Vehicle damage", "Freight damage", "Securement failure", "Customer cargo claim"],
  },
  complaint: {
    label: "Customer Complaint",
    short: "Complaint",
    description: "Delivery, driver, communication or service complaints from a customer.",
    subtypes: ["Delivery complaint", "Driver complaint", "Communication complaint", "Service complaint"],
  },
};

/** A category-specific field rendered in Step 3 and the review/detail screens. */
export type IncidentFieldDef = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
};

/** Step 3 fields shown only for the selected report category. */
export const CATEGORY_FIELDS: Record<IncidentCategory, IncidentFieldDef[]> = {
  driver_employee: [
    { key: "injuryDetail", label: "Injury / Illness Detail", placeholder: "e.g. Lower back strain securing cargo" },
    { key: "bodyPart", label: "Body Part Affected", placeholder: "e.g. Lower back" },
    { key: "medicalAttention", label: "Medical Attention", placeholder: "e.g. On-site first aid / ER visit / None" },
    { key: "daysAffected", label: "Days Unable to Work", placeholder: "e.g. 0" },
  ],
  safety: [
    { key: "equipmentInvolved", label: "Equipment Involved", placeholder: "e.g. Front steer tire, brake system" },
    { key: "hazard", label: "Hazard / Condition", placeholder: "e.g. Blown steer tire at highway speed" },
    { key: "dotRecordable", label: "DOT Recordable", placeholder: "e.g. Yes / No" },
    { key: "rootCause", label: "Suspected Root Cause", placeholder: "e.g. Tire age past service limit" },
  ],
  accident: [
    { key: "otherParties", label: "Other Parties Involved", placeholder: "e.g. Sedan, 1 occupant" },
    { key: "policeReport", label: "Police Report Number", placeholder: "e.g. TX-2026-44821" },
    { key: "insuranceClaim", label: "Insurance Claim Number", placeholder: "e.g. CLM-77120 (optional)" },
    { key: "injuries", label: "Injuries Reported", placeholder: "e.g. None / Minor / Description" },
    { key: "damageEstimate", label: "Estimated Damage", placeholder: "e.g. $4,200" },
  ],
  cargo_damage: [
    { key: "shipmentNumber", label: "Shipment / Order Number", placeholder: "e.g. SHP-90214" },
    { key: "customer", label: "Customer", placeholder: "e.g. Lone Star Auto Group" },
    { key: "cargoDescription", label: "Cargo Description", placeholder: "e.g. 2024 SUV, white" },
    { key: "damageDescription", label: "Damage Description", placeholder: "e.g. Scratch on rear quarter panel", multiline: true },
    { key: "claimAmount", label: "Estimated Claim Amount", placeholder: "e.g. $1,800" },
  ],
  complaint: [
    { key: "customer", label: "Customer", placeholder: "e.g. Premier Motors" },
    { key: "shipmentNumber", label: "Shipment / Order Reference", placeholder: "e.g. SHP-90188 (optional)" },
    { key: "complaintSource", label: "Complaint Channel", placeholder: "e.g. Phone call / Email" },
    { key: "complaintDetail", label: "Complaint Detail", placeholder: "What the customer reported...", multiline: true },
  ],
};

export const INCIDENT_SEVERITY_META: Record<
  IncidentSeverity,
  { label: string; status: StatusKey }
> = {
  critical: { label: "Critical", status: "out" },
  major: { label: "Major", status: "attention" },
  minor: { label: "Minor", status: "operational" },
};

export const INCIDENT_STATUS_META: Record<IncidentStatus, { label: string }> = {
  open: { label: "Open" },
  in_review: { label: "In Review" },
  resolved: { label: "Resolved" },
};

/** Demo roster of drivers / employees for the report picker. */
export const DRIVERS: string[] = [
  "J. Carter",
  "M. Reyes",
  "S. Patel",
  "D. Nguyen",
  "R. Alvarez",
];

/** Person types for a Driver / Employee Incident — any worker, not just drivers. */
export const PERSON_TYPES: string[] = [
  "Driver",
  "Trainee",
  "Dispatcher",
  "Mechanic",
  "Yard worker",
  "Office staff",
  "Cleaning staff",
  "Other employee",
];

export const INCIDENTS: Incident[] = [
  {
    id: "inc1",
    code: "SCR-2048",
    category: "accident",
    subtype: "Collision",
    title: "Merge collision on I-20 W",
    summary:
      "Veloz 04 was clipped by a merging sedan near Abilene. No injuries. Police responded and filed a report. Unit driveable, minor body damage to driver-side fender.",
    severity: "critical",
    status: "open",
    driver: "J. Carter",
    truckId: "t4",
    truckName: "Veloz 04",
    trailerId: "tr3",
    trailerName: "Enclosed 28",
    loadNumber: "SHP-90241",
    date: "2026-05-18",
    time: "14:20",
    location: "I-20 W · Abilene, TX",
    mileage: 287950,
    equipmentKind: "truck",
    equipmentName: "Veloz 04",
    correctiveAction: "Driver completed roadside documentation. Body shop estimate scheduled.",
    witnesses: "Highway patrol unit 22; one passing motorist (statement on file).",
    details: {
      otherParties: "Gray sedan, 1 occupant, no injuries",
      policeReport: "TX-2026-44821",
      insuranceClaim: "CLM-77120",
      injuries: "None reported",
      damageEstimate: "$4,200",
    },
    reportedBy: "J. Carter",
    reportedAt: "2026-05-18",
    photos: 3,
    timeline: [
      { id: "e1", kind: "reported", label: "Report filed", detail: "Driver filed accident report after police cleared the scene.", by: "J. Carter", at: "2026-05-18" },
      { id: "e2", kind: "note", label: "Insurance notified", detail: "Claim CLM-77120 opened with carrier.", by: "Dispatch", at: "2026-05-18" },
    ],
  },
  {
    id: "inc2",
    code: "SCR-2047",
    category: "safety",
    subtype: "Tire failure",
    title: "Rear inner tire blowout at speed",
    summary:
      "Driver-side rear inner tire failed at highway speed. No injuries. Spare installed roadside. Flagged as a safety incident pending root-cause review of tire age.",
    severity: "major",
    status: "in_review",
    driver: "M. Reyes",
    truckId: "t2",
    truckName: "Veloz 02",
    loadNumber: "SHP-90233",
    date: "2026-05-16",
    time: "09:05",
    location: "US-287 N · Wichita Falls, TX",
    mileage: 211200,
    equipmentKind: "truck",
    equipmentName: "Veloz 02",
    correctiveAction: "Replacement set quoted. Tire age audit added to pre-trip checklist.",
    witnesses: "None",
    details: {
      equipmentInvolved: "Rear inner drive tire (driver side)",
      hazard: "Tread separation at highway speed",
      dotRecordable: "No",
      rootCause: "Tire age past service limit",
    },
    reportedBy: "M. Reyes",
    reportedAt: "2026-05-16",
    photos: 4,
    timeline: [
      { id: "e1", kind: "reported", label: "Report filed", detail: "Inner tire blew at highway speed, no injuries.", by: "M. Reyes", at: "2026-05-16" },
      { id: "e2", kind: "in_review", label: "Moved to review", detail: "Root-cause and tire vendor quote requested.", by: "Safety", at: "2026-05-17" },
    ],
  },
  {
    id: "inc3",
    code: "SCR-2045",
    category: "driver_employee",
    subtype: "Driver injury",
    title: "Lower back strain during loading",
    summary:
      "Driver reported lower back strain while securing a vehicle on the trailer. On-site first aid applied. No ER visit. Light duty recommended for two days.",
    severity: "major",
    status: "open",
    driver: "S. Patel",
    truckId: "t3",
    truckName: "Veloz 03",
    trailerId: "tr3",
    trailerName: "Enclosed 28",
    date: "2026-05-15",
    time: "07:40",
    location: "Veloz Yard · Fort Worth, TX",
    equipmentKind: "trailer",
    equipmentName: "Enclosed 28",
    correctiveAction: "Refresher on lifting technique scheduled. Light duty assignment for 2 days.",
    witnesses: "Yard lead on duty",
    details: {
      injuryDetail: "Lower back strain securing cargo",
      bodyPart: "Lower back",
      medicalAttention: "On-site first aid",
      daysAffected: "2",
    },
    reportedBy: "S. Patel",
    reportedAt: "2026-05-15",
    photos: 0,
  },
  {
    id: "inc4",
    code: "SCR-2042",
    category: "safety",
    subtype: "Unsafe condition",
    title: "Soft brake pedal reported",
    summary:
      "Driver noted spongy brake feel and low reservoir. Unit placed Out of Service pending caliper inspection. Filed as a safety incident for compliance tracking.",
    severity: "critical",
    status: "in_review",
    driver: "J. Carter",
    truckId: "t4",
    truckName: "Veloz 04",
    date: "2026-05-14",
    time: "16:10",
    location: "Veloz Yard · Fort Worth, TX",
    mileage: 287900,
    equipmentKind: "truck",
    equipmentName: "Veloz 04",
    correctiveAction: "Unit placed Out of Service. Caliper inspection scheduled.",
    witnesses: "None",
    details: {
      equipmentInvolved: "Front brake system",
      hazard: "Reduced braking performance",
      dotRecordable: "Yes",
      rootCause: "Suspected caliper / fluid loss",
    },
    reportedBy: "J. Carter",
    reportedAt: "2026-05-14",
    photos: 1,
  },
  {
    id: "inc5",
    code: "SCR-2039",
    category: "cargo_damage",
    subtype: "Vehicle damage",
    title: "Scratch on customer vehicle quarter panel",
    summary:
      "Minor scratch discovered on a customer SUV's rear quarter panel at delivery. Documented with photos. Customer notified, claim under review.",
    severity: "minor",
    status: "open",
    driver: "M. Reyes",
    truckId: "t2",
    truckName: "Veloz 02",
    trailerId: "tr2",
    trailerName: "Gooseneck 36",
    loadNumber: "SHP-90214",
    date: "2026-05-12",
    time: "11:30",
    location: "Delivery · Dallas, TX",
    equipmentKind: "trailer",
    equipmentName: "Gooseneck 36",
    correctiveAction: "Securement re-check added. Customer claim opened for review.",
    witnesses: "Receiving customer present at delivery",
    details: {
      shipmentNumber: "SHP-90214",
      customer: "Lone Star Auto Group",
      cargoDescription: "2024 SUV, white",
      damageDescription: "Light scratch on rear driver-side quarter panel",
      claimAmount: "$1,800",
    },
    reportedBy: "M. Reyes",
    reportedAt: "2026-05-12",
    photos: 2,
  },
  {
    id: "inc6",
    code: "SCR-2034",
    category: "safety",
    subtype: "Compliance issue",
    title: "Registration expired during haul",
    summary:
      "Roadside check flagged lapsed registration. Resolved same day with electronic renewal. No citation issued. Closed after management review.",
    severity: "minor",
    status: "resolved",
    driver: "M. Reyes",
    truckId: "t2",
    truckName: "Veloz 02",
    date: "2026-05-04",
    time: "13:15",
    location: "I-40 · Amarillo, TX",
    mileage: 209800,
    equipmentKind: "truck",
    equipmentName: "Veloz 02",
    correctiveAction: "Registration renewal added to compliance reminder calendar.",
    witnesses: "None",
    details: {
      equipmentInvolved: "Registration / credentials",
      hazard: "Lapsed registration",
      dotRecordable: "No",
      rootCause: "Renewal reminder missed",
    },
    reportedBy: "M. Reyes",
    reportedAt: "2026-05-04",
    photos: 0,
    resolvedAt: "2026-05-04",
    resolutionNote: "Registration renewed electronically same day. No citation issued.",
    timeline: [
      { id: "e1", kind: "reported", label: "Report filed", detail: "Roadside check flagged lapsed registration.", by: "M. Reyes", at: "2026-05-04" },
      { id: "e2", kind: "resolved", label: "Resolved", detail: "Renewed electronically same day.", by: "Admin", at: "2026-05-04" },
    ],
  },
  {
    id: "inc7",
    code: "SCR-2030",
    category: "complaint",
    subtype: "Delivery complaint",
    title: "Customer reported late delivery window",
    summary:
      "Customer reported the vehicle arrived outside the agreed delivery window. Investigated dispatch timeline; weather delay confirmed. Resolved with customer.",
    severity: "minor",
    status: "resolved",
    driver: "S. Patel",
    truckId: "t5",
    truckName: "Veloz 05",
    loadNumber: "SHP-90188",
    date: "2026-04-28",
    time: "18:45",
    location: "Downtown · Dallas, TX",
    equipmentKind: "truck",
    equipmentName: "Veloz 05",
    correctiveAction: "Proactive ETA updates added to dispatch protocol for weather delays.",
    witnesses: "Dispatch records on file",
    details: {
      customer: "Premier Motors",
      shipmentNumber: "SHP-90188",
      complaintSource: "Phone call",
      complaintDetail: "Vehicle arrived ~2 hours past the agreed window.",
    },
    reportedBy: "Dispatch",
    reportedAt: "2026-04-28",
    photos: 0,
    resolvedAt: "2026-04-29",
    resolutionNote: "Weather delay confirmed; customer acknowledged. Process update applied.",
    timeline: [
      { id: "e1", kind: "reported", label: "Complaint logged", detail: "Customer reported late delivery window.", by: "Dispatch", at: "2026-04-28" },
      { id: "e2", kind: "resolved", label: "Resolved", detail: "Weather delay confirmed; customer acknowledged.", by: "Management", at: "2026-04-29" },
    ],
  },
  {
    id: "inc8",
    code: "SCR-2026",
    category: "driver_employee",
    subtype: "Driver stranded",
    title: "Driver stranded after fuel system issue",
    summary:
      "Driver stranded at a fuel stop after a no-start condition. Emergency response coordinated, unit recovered to yard. Driver safe, no injuries.",
    severity: "major",
    status: "resolved",
    driver: "M. Reyes",
    truckId: "t2",
    truckName: "Veloz 02",
    date: "2026-04-20",
    time: "21:00",
    location: "Pilot · Weatherford, TX",
    equipmentKind: "truck",
    equipmentName: "Veloz 02",
    correctiveAction: "Roadside assistance protocol reviewed. Driver debriefed.",
    witnesses: "Fuel stop attendant",
    details: {
      injuryDetail: "No injury — stranded only",
      bodyPart: "N/A",
      medicalAttention: "None",
      daysAffected: "0",
    },
    reportedBy: "M. Reyes",
    reportedAt: "2026-04-20",
    photos: 0,
    resolvedAt: "2026-04-21",
    resolutionNote: "Unit recovered to yard overnight. Driver safe and reassigned.",
    timeline: [
      { id: "e1", kind: "reported", label: "Report filed", detail: "Driver stranded after no-start condition.", by: "M. Reyes", at: "2026-04-20" },
      { id: "e2", kind: "resolved", label: "Resolved", detail: "Unit recovered, driver safe.", by: "Dispatch", at: "2026-04-21" },
    ],
  },
];

/** Inputs needed to build a brand-new incident from the report flow. */
export type NewIncidentInput = {
  category: IncidentCategory;
  subtype: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  driver: string;
  truckId?: string;
  truckName?: string;
  trailerId?: string;
  trailerName?: string;
  loadNumber?: string;
  date: string;
  time?: string;
  location: string;
  mileage?: number;
  correctiveAction?: string;
  witnesses?: string;
  details: Record<string, string>;
  photos: number;
  reportedBy: string;
};

/** Build a fully-formed Incident (with an opening timeline event) from report input. */
export function buildIncident(input: NewIncidentInput, seq: number): Incident {
  const today = new Date().toISOString().slice(0, 10);
  const equipmentKind: IncidentEquipmentKind = input.truckName ? "truck" : input.trailerName ? "trailer" : "truck";
  const equipmentName = input.truckName ?? input.trailerName ?? input.driver;
  return {
    id: `inc-${Date.now()}`,
    code: `SCR-${2048 + seq}`,
    category: input.category,
    subtype: input.subtype,
    title: input.title,
    summary: input.summary,
    severity: input.severity,
    status: "open",
    driver: input.driver,
    truckId: input.truckId,
    truckName: input.truckName,
    trailerId: input.trailerId,
    trailerName: input.trailerName,
    loadNumber: input.loadNumber,
    date: input.date,
    time: input.time,
    location: input.location,
    mileage: input.mileage,
    equipmentKind,
    equipmentName,
    correctiveAction: input.correctiveAction,
    witnesses: input.witnesses,
    details: input.details,
    reportedBy: input.reportedBy,
    reportedAt: today,
    photos: input.photos,
    timeline: [
      {
        id: `e-${Date.now()}`,
        kind: "reported",
        label: "Report filed",
        detail: input.summary,
        by: input.reportedBy,
        at: today,
      },
    ],
  };
}

/** Lightweight rollup for the Safety & Compliance header. Pure helper, AI-ready. */
export function incidentStats(incidents: Incident[]) {
  return {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "open").length,
    inReview: incidents.filter((i) => i.status === "in_review").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
    critical: incidents.filter((i) => i.severity === "critical").length,
  };
}
