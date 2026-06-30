import type { StatusKey } from "./colors";

// ══════════════════════════════════════════════
// Equipment Subtypes — High-Fidelity Asset Profiles
// ══════════════════════════════════════════════

export type TruckSubtype = "daycab" | "sleeper" | "heavy_duty";
export type TrailerSubtype =
  | "1car_enclosed"
  | "2car_open"
  | "2car_enclosed"
  | "3car_wedge"
  | "4car_wedge"
  | "5car_quickloader"
  | "9car_stinger";

export const truckSubtypeMeta: Record<TruckSubtype, { label: string; axleLabel: string }> = {
  daycab: { label: "Day Cab Tractor", axleLabel: "Single / Tandem Rear" },
  sleeper: { label: "Sleeper Berth", axleLabel: "Tandem Rear" },
  heavy_duty: { label: "Heavy Duty Rig", axleLabel: "Dual Tandem Rear" },
};

export const trailerSubtypeMeta: Record<TrailerSubtype, { label: string; axles: number; deckLabel: string }> = {
  "1car_enclosed": { label: "1-Car Enclosed", axles: 2, deckLabel: "Single enclosed bay" },
  "2car_open": { label: "2-Car Open Deck", axles: 2, deckLabel: "Flat deck, dual ramp" },
  "2car_enclosed": { label: "2-Car Enclosed", axles: 2, deckLabel: "Tandem enclosed bays" },
  "3car_wedge": { label: "3-Car Wedge", axles: 3, deckLabel: "Stacked wedge deck" },
  "4car_wedge": { label: "4-Car Wedge", axles: 3, deckLabel: "Extended wedge deck" },
  "5car_quickloader": { label: "5-Car Quick-Loader", axles: 4, deckLabel: "Multi-level hydraulic" },
  "9car_stinger": { label: "9-Car Stinger-Steer", axles: 5, deckLabel: "Double-deck articulating" },
};

// ══════════════════════════════════════════════
// Road-Ready Status — Multi-Tier Safety Metric
// ══════════════════════════════════════════════

export type RoadReadyStatus = "road_ready" | "restricted_use" | "out_of_service";

export const roadReadyMeta: Record<RoadReadyStatus, { label: string; color: string; soft: string; badge: string }> = {
  road_ready: { label: "Road Ready", color: "#22D399", soft: "rgba(34,211,153,0.14)", badge: "CLEARED" },
  restricted_use: {
    label: "Restricted Use",
    color: "#FFB547",
    soft: "rgba(255,181,71,0.14)",
    badge: "LOCAL ONLY",
  },
  out_of_service: {
    label: "Out of Service",
    color: "#FF5470",
    soft: "rgba(255,84,112,0.14)",
    badge: "DEAD-RED",
  },
};

// ══════════════════════════════════════════════
// Availability Matrix — Dispatch-Ready States
// ══════════════════════════════════════════════

export type AvailabilityState = "available" | "assigned" | "in_shop" | "staged";

export const availabilityMeta: Record<AvailabilityState, { label: string; color: string; icon: string }> = {
  available: { label: "Available", color: "#22D399", icon: "yard" },
  assigned: { label: "Assigned / In-Transit", color: "#5EE7FF", icon: "route" },
  in_shop: { label: "In Shop", color: "#FFB547", icon: "wrench" },
  staged: { label: "Staged", color: "#7CC4FF", icon: "clock" },
};

// ══════════════════════════════════════════════
// Inspection Sync — Compliance Tracking
// ══════════════════════════════════════════════

export const INSPECTION_EXPIRY_HOURS = 24;

export function getInspectionStatus(lastInspectionAt?: string): { expired: boolean; hoursAgo: number; label: string; color: string } {
  if (!lastInspectionAt) return { expired: true, hoursAgo: Infinity, label: "Never inspected", color: "#FF5470" };
  const now = Date.now();
  const then = new Date(lastInspectionAt).getTime();
  const hoursAgo = (now - then) / (1000 * 60 * 60);
  const expired = hoursAgo > INSPECTION_EXPIRY_HOURS;
  if (hoursAgo < 1) return { expired: false, hoursAgo, label: "Inspected < 1 hr ago", color: "#22D399" };
  if (hoursAgo < 6) return { expired: false, hoursAgo, label: `Inspected ${Math.floor(hoursAgo)}h ago`, color: "#22D399" };
  if (!expired) return { expired: false, hoursAgo, label: `Inspected ${Math.floor(hoursAgo)}h ago`, color: "#FFB547" };
  return { expired: true, hoursAgo, label: "Inspection Expired", color: "#FF5470" };
}

export type ServiceEvent = {
  id: string;
  date: string;
  mileage?: number;
  type: string;
  notes?: string;
  cost?: number;
  severity?: "info" | "warn" | "fail";
};

export type AIInsight = {
  id: string;
  severity: "info" | "warn" | "fail";
  title: string;
  detail: string;
};

export type Truck = {
  id: string;
  nickname: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  subtype: TruckSubtype;
  mileage: number;
  fuelType: "Diesel" | "Gas";
  avgMpg: number;
  cdl: "CDL" | "Non-CDL";
  vin: string;
  plate: string;
  state: string;
  emptyWeight: number;
  gvwr: number;
  assignedTrailerId?: string;
  status: StatusKey;
  roadReadyStatus: RoadReadyStatus;
  availability: AvailabilityState;
  lastInspectionAt?: string;
  lastInspectionResult?: "pass" | "fail" | "flagged";
  health: number;
  insights: AIInsight[];
  modules: {
    engine: { oilDueIn: number; defLevel: number; coolant: StatusKey; belts: StatusKey };
    transmission: { fluidDueIn: number; serviceInterval: number };
    brakes: { padPct: number; rotorPct: number; fluid: StatusKey };
    tires: { wearPct: number; ageMonths: number; lastRotation: number; blowouts: number };
    suspension: { airbags: StatusKey; shocks: StatusKey };
    electrical: { batteryVolts: number; alternator: StatusKey; trailerWiring: StatusKey };
    compliance: { dotDue: string; insuranceDue: string; registrationDue: string };
  };
  history: ServiceEvent[];
};

export type Trailer = {
  id: string;
  nickname: string;
  year: number;
  make: string;
  model: string;
  type: string;
  subtype: TrailerSubtype;
  enclosed: boolean;
  emptyWeight: number;
  gvwr: number;
  axles: number;
  length: number;
  carCapacity: number;
  assignedTruckId?: string;
  status: StatusKey;
  roadReadyStatus: RoadReadyStatus;
  availability: AvailabilityState;
  lastInspectionAt?: string;
  lastInspectionResult?: "pass" | "fail" | "flagged";
  health: number;
  insights: AIInsight[];
  modules: {
    bearings: { lastServiceMiles: number; intervalMiles: number };
    brakes: { wearPct: number; lastAdjust: string };
    tires: { treadPct: number; ageMonths: number; blowouts: number };
    lighting: { brake: StatusKey; marker: StatusKey; wiring: StatusKey };
    straps: { goodCount: number; replaceSoon: number; replaceDate: string };
    ramps: { operational: StatusKey; cableWearPct: number };
    deck: { rust: StatusKey; cracking: StatusKey; welds: StatusKey };
  };
  history: ServiceEvent[];
};

export const TRUCKS: Truck[] = [
  {
    id: "t1",
    nickname: "Veloz 01",
    year: 2022,
    make: "Ram",
    model: "3500",
    trim: "Dually Laramie",
    subtype: "daycab" as TruckSubtype,
    mileage: 148220,
    fuelType: "Diesel",
    avgMpg: 9.8,
    cdl: "Non-CDL",
    vin: "3C63R3HL•••••2294",
    plate: "VLZ-3501",
    state: "TX",
    emptyWeight: 8500,
    gvwr: 14000,
    assignedTrailerId: "tr1",
    status: "operational",
    roadReadyStatus: "road_ready" as RoadReadyStatus,
    availability: "assigned" as AvailabilityState,
    lastInspectionAt: "2026-06-30T06:14:00Z",
    lastInspectionResult: "pass",
    health: 92,
    insights: [
      { id: "i1", severity: "info", title: "Engine operating normally", detail: "No fault codes in 30 days." },
      { id: "i2", severity: "warn", title: "Fuel efficiency dropped 6%", detail: "Avg MPG fell from 10.4 to 9.8 over last 1,200 mi." },
      { id: "i3", severity: "warn", title: "Oil overdue by 800 miles", detail: "Recommended at 145,000. Schedule full synthetic." },
    ],
    modules: {
      engine: { oilDueIn: -800, defLevel: 64, coolant: "operational", belts: "operational" },
      transmission: { fluidDueIn: 12500, serviceInterval: 40000 },
      brakes: { padPct: 58, rotorPct: 72, fluid: "operational" },
      tires: { wearPct: 64, ageMonths: 18, lastRotation: 142000, blowouts: 0 },
      suspension: { airbags: "operational", shocks: "attention" },
      electrical: { batteryVolts: 12.6, alternator: "operational", trailerWiring: "operational" },
      compliance: { dotDue: "2026-09-12", insuranceDue: "2026-07-30", registrationDue: "2026-11-04" },
    },
    history: [
      { id: "s1", date: "2026-04-12", mileage: 145200, type: "Tire rotation", notes: "Cross-rotated, set to 80 psi", cost: 60 },
      { id: "s2", date: "2026-02-02", mileage: 138900, type: "DEF refill", cost: 42 },
      { id: "s3", date: "2025-12-18", mileage: 132500, type: "Full synthetic oil + filter", notes: "5W-40, OEM filter", cost: 220 },
      { id: "s4", date: "2025-10-04", mileage: 124100, type: "DOT Inspection — Passed", severity: "info" },
    ],
  },
  {
    id: "t2",
    nickname: "Veloz 02",
    year: 2020,
    make: "Ford",
    model: "F-450",
    trim: "Platinum",
    subtype: "daycab" as TruckSubtype,
    mileage: 211800,
    fuelType: "Diesel",
    avgMpg: 10.2,
    cdl: "Non-CDL",
    vin: "1FT8W4DT•••••0117",
    plate: "VLZ-4502",
    state: "TX",
    emptyWeight: 8800,
    gvwr: 14000,
    assignedTrailerId: "tr2",
    status: "attention",
    roadReadyStatus: "restricted_use" as RoadReadyStatus,
    availability: "assigned" as AvailabilityState,
    lastInspectionAt: "2026-06-29T14:30:00Z",
    lastInspectionResult: "pass",
    health: 74,
    insights: [
      { id: "i1", severity: "warn", title: "Fuel efficiency dropped 8%", detail: "Headwinds on I-40 corridor impacting MPG." },
      { id: "i2", severity: "fail", title: "Tire wear increasing rapidly", detail: "Front-left at 28% tread. Replace within 2,000 mi." },
      { id: "i3", severity: "info", title: "Brake pads healthy", detail: "Rear pads at 71%." },
    ],
    modules: {
      engine: { oilDueIn: 1800, defLevel: 41, coolant: "operational", belts: "attention" },
      transmission: { fluidDueIn: 4200, serviceInterval: 40000 },
      brakes: { padPct: 71, rotorPct: 65, fluid: "operational" },
      tires: { wearPct: 28, ageMonths: 26, lastRotation: 204000, blowouts: 1 },
      suspension: { airbags: "attention", shocks: "operational" },
      electrical: { batteryVolts: 12.3, alternator: "operational", trailerWiring: "attention" },
      compliance: { dotDue: "2026-06-22", insuranceDue: "2026-08-12", registrationDue: "2026-05-30" },
    },
    history: [
      { id: "s1", date: "2026-04-28", mileage: 210400, type: "Front brake pad inspection", severity: "warn" },
      { id: "s2", date: "2026-03-09", mileage: 204000, type: "Tire rotation", cost: 60 },
      { id: "s3", date: "2026-01-15", mileage: 195000, type: "Transmission flush", cost: 380 },
    ],
  },
  {
    id: "t3",
    nickname: "Veloz 03",
    year: 2024,
    make: "Chevrolet",
    model: "Silverado 3500HD",
    trim: "High Country",
    subtype: "daycab" as TruckSubtype,
    mileage: 38400,
    fuelType: "Diesel",
    avgMpg: 11.4,
    cdl: "Non-CDL",
    vin: "1GC4YVE7•••••8821",
    plate: "VLZ-3503",
    state: "TX",
    emptyWeight: 8200,
    gvwr: 13500,
    status: "operational",
    roadReadyStatus: "road_ready" as RoadReadyStatus,
    availability: "available" as AvailabilityState,
    lastInspectionAt: "2026-06-29T08:00:00Z",
    lastInspectionResult: "pass",
    health: 98,
    insights: [
      { id: "i1", severity: "info", title: "Operating at peak efficiency", detail: "MPG trending +3% above baseline." },
      { id: "i2", severity: "info", title: "All systems nominal", detail: "No predicted services within 5,000 mi." },
    ],
    modules: {
      engine: { oilDueIn: 4200, defLevel: 88, coolant: "operational", belts: "operational" },
      transmission: { fluidDueIn: 28000, serviceInterval: 40000 },
      brakes: { padPct: 94, rotorPct: 96, fluid: "operational" },
      tires: { wearPct: 92, ageMonths: 6, lastRotation: 32000, blowouts: 0 },
      suspension: { airbags: "operational", shocks: "operational" },
      electrical: { batteryVolts: 12.8, alternator: "operational", trailerWiring: "operational" },
      compliance: { dotDue: "2026-12-30", insuranceDue: "2026-12-15", registrationDue: "2027-02-10" },
    },
    history: [
      { id: "s1", date: "2026-04-02", mileage: 36000, type: "Oil + filter", cost: 195 },
      { id: "s2", date: "2026-01-10", mileage: 24000, type: "Tire rotation", cost: 0, notes: "Dealer warranty" },
    ],
  },
  {
    id: "t4",
    nickname: "Veloz 04",
    year: 2019,
    make: "Ford",
    model: "F-550",
    trim: "XLT",
    subtype: "heavy_duty" as TruckSubtype,
    mileage: 288150,
    fuelType: "Diesel",
    avgMpg: 8.6,
    cdl: "Non-CDL",
    vin: "1FDUF5HT•••••4490",
    plate: "VLZ-5504",
    state: "TX",
    emptyWeight: 9500,
    gvwr: 19500,
    assignedTrailerId: "tr3",
    status: "out",
    roadReadyStatus: "out_of_service" as RoadReadyStatus,
    availability: "in_shop" as AvailabilityState,
    lastInspectionAt: "2026-06-28T07:45:00Z",
    lastInspectionResult: "fail",
    health: 41,
    insights: [
      { id: "i1", severity: "fail", title: "Coolant system flagged", detail: "Temp spike detected at 218°F on last run. Inspect water pump." },
      { id: "i2", severity: "fail", title: "Brake fluid low", detail: "Reservoir below MIN. Possible caliper leak." },
      { id: "i3", severity: "warn", title: "DEF refill required", detail: "DEF at 8%. Refill within 200 mi." },
    ],
    modules: {
      engine: { oilDueIn: -2100, defLevel: 8, coolant: "out", belts: "attention" },
      transmission: { fluidDueIn: 1200, serviceInterval: 40000 },
      brakes: { padPct: 22, rotorPct: 30, fluid: "out" },
      tires: { wearPct: 41, ageMonths: 38, lastRotation: 280000, blowouts: 2 },
      suspension: { airbags: "attention", shocks: "attention" },
      electrical: { batteryVolts: 11.9, alternator: "attention", trailerWiring: "operational" },
      compliance: { dotDue: "2026-05-30", insuranceDue: "2026-06-10", registrationDue: "2026-08-22" },
    },
    history: [
      { id: "s1", date: "2026-05-08", mileage: 287900, type: "Coolant temp alert", severity: "fail" },
      { id: "s2", date: "2026-04-22", mileage: 286100, type: "Tire blowout — rear inner", severity: "fail", cost: 410 },
      { id: "s3", date: "2026-03-15", mileage: 281000, type: "Oil service", cost: 240 },
    ],
  },
  {
    id: "t5",
    nickname: "Veloz 05",
    year: 2023,
    make: "GMC",
    model: "Sierra 3500HD",
    trim: "Denali Ultimate",
    subtype: "sleeper" as TruckSubtype,
    mileage: 67900,
    fuelType: "Diesel",
    avgMpg: 11.0,
    cdl: "Non-CDL",
    vin: "1GT49WEY•••••7702",
    plate: "VLZ-3505",
    state: "TX",
    emptyWeight: 8600,
    gvwr: 14000,
    status: "operational",
    roadReadyStatus: "road_ready" as RoadReadyStatus,
    availability: "available" as AvailabilityState,
    lastInspectionAt: "2026-06-30T05:30:00Z",
    lastInspectionResult: "pass",
    health: 89,
    insights: [
      { id: "i1", severity: "info", title: "Healthy operational profile", detail: "Last 30 days zero incidents." },
      { id: "i2", severity: "warn", title: "High-wind routes impacting MPG", detail: "West TX corridor reducing efficiency by ~4%." },
    ],
    modules: {
      engine: { oilDueIn: 2100, defLevel: 72, coolant: "operational", belts: "operational" },
      transmission: { fluidDueIn: 18000, serviceInterval: 40000 },
      brakes: { padPct: 82, rotorPct: 88, fluid: "operational" },
      tires: { wearPct: 78, ageMonths: 12, lastRotation: 60000, blowouts: 0 },
      suspension: { airbags: "operational", shocks: "operational" },
      electrical: { batteryVolts: 12.7, alternator: "operational", trailerWiring: "operational" },
      compliance: { dotDue: "2026-10-04", insuranceDue: "2026-09-22", registrationDue: "2027-01-15" },
    },
    history: [
      { id: "s1", date: "2026-04-19", mileage: 66000, type: "Tire rotation + alignment", cost: 140 },
      { id: "s2", date: "2026-02-08", mileage: 58200, type: "Oil + filter", cost: 210 },
    ],
  },
];

export const TRAILERS: Trailer[] = [
  {
    id: "tr1",
    nickname: "Wedge 40",
    year: 2023,
    make: "Kaufman",
    model: "Wedge 40",
    type: "3-Car Wedge",
    subtype: "3car_wedge" as TrailerSubtype,
    enclosed: false,
    emptyWeight: 6800,
    gvwr: 24000,
    axles: 3,
    length: 40,
    carCapacity: 3,
    assignedTruckId: "t1",
    status: "operational",
    roadReadyStatus: "road_ready" as RoadReadyStatus,
    availability: "assigned" as AvailabilityState,
    lastInspectionAt: "2026-06-29T16:00:00Z",
    lastInspectionResult: "pass",
    health: 87,
    insights: [
      { id: "i1", severity: "info", title: "Trailer road ready", detail: "All systems within service window." },
      { id: "i2", severity: "warn", title: "Tire replacement due soon", detail: "Tread at 38% — replace within 3,000 mi." },
    ],
    modules: {
      bearings: { lastServiceMiles: 12000, intervalMiles: 12000 },
      brakes: { wearPct: 64, lastAdjust: "2026-03-02" },
      tires: { treadPct: 38, ageMonths: 14, blowouts: 0 },
      lighting: { brake: "operational", marker: "operational", wiring: "operational" },
      straps: { goodCount: 8, replaceSoon: 2, replaceDate: "2026-06-01" },
      ramps: { operational: "operational", cableWearPct: 78 },
      deck: { rust: "operational", cracking: "operational", welds: "operational" },
    },
    history: [
      { id: "s1", date: "2026-03-02", mileage: 12000, type: "Brake adjustment", cost: 180 },
      { id: "s2", date: "2026-01-12", mileage: 8400, type: "Strap rotation + 2 replaced", cost: 95 },
    ],
  },
  {
    id: "tr2",
    nickname: "Gooseneck 36",
    year: 2021,
    make: "PJ Trailers",
    model: "GN 36",
    type: "Gooseneck Flatbed",
    subtype: "2car_open" as TrailerSubtype,
    enclosed: false,
    emptyWeight: 5200,
    gvwr: 22000,
    axles: 2,
    length: 36,
    carCapacity: 2,
    assignedTruckId: "t2",
    status: "attention",
    roadReadyStatus: "restricted_use" as RoadReadyStatus,
    availability: "assigned" as AvailabilityState,
    lastInspectionAt: "2026-06-28T12:00:00Z",
    lastInspectionResult: "flagged",
    health: 68,
    insights: [
      { id: "i1", severity: "warn", title: "Bearing service overdue", detail: "Last service 13,800 mi ago — interval 12,000 mi." },
      { id: "i2", severity: "warn", title: "Winch cable wear high", detail: "Visual wear at 62%. Replace before next haul." },
    ],
    modules: {
      bearings: { lastServiceMiles: 13800, intervalMiles: 12000 },
      brakes: { wearPct: 52, lastAdjust: "2025-11-18" },
      tires: { treadPct: 54, ageMonths: 22, blowouts: 1 },
      lighting: { brake: "operational", marker: "attention", wiring: "operational" },
      straps: { goodCount: 6, replaceSoon: 4, replaceDate: "2026-05-25" },
      ramps: { operational: "operational", cableWearPct: 38 },
      deck: { rust: "attention", cracking: "operational", welds: "operational" },
    },
    history: [
      { id: "s1", date: "2026-04-04", mileage: 13200, type: "Lighting inspection", severity: "warn" },
      { id: "s2", date: "2025-09-10", mileage: 6400, type: "Bearings repacked", cost: 260 },
    ],
  },
  {
    id: "tr3",
    nickname: "Enclosed 28",
    year: 2022,
    make: "Continental Cargo",
    model: "Auto Hauler 28",
    type: "Enclosed Hauler",
    subtype: "1car_enclosed" as TrailerSubtype,
    enclosed: true,
    emptyWeight: 4500,
    gvwr: 14000,
    axles: 2,
    length: 28,
    carCapacity: 1,
    assignedTruckId: "t4",
    status: "out",
    roadReadyStatus: "out_of_service" as RoadReadyStatus,
    availability: "in_shop" as AvailabilityState,
    lastInspectionAt: "2026-06-27T09:00:00Z",
    lastInspectionResult: "fail",
    health: 36,
    insights: [
      { id: "i1", severity: "fail", title: "Brake wear unsafe", detail: "Brake shoes at 14%. Do not dispatch." },
      { id: "i2", severity: "fail", title: "Marker light failure", detail: "Rear driver-side marker non-functional." },
    ],
    modules: {
      bearings: { lastServiceMiles: 9000, intervalMiles: 12000 },
      brakes: { wearPct: 14, lastAdjust: "2025-08-02" },
      tires: { treadPct: 48, ageMonths: 30, blowouts: 0 },
      lighting: { brake: "operational", marker: "out", wiring: "attention" },
      straps: { goodCount: 4, replaceSoon: 3, replaceDate: "2026-05-20" },
      ramps: { operational: "attention", cableWearPct: 55 },
      deck: { rust: "attention", cracking: "attention", welds: "operational" },
    },
    history: [
      { id: "s1", date: "2026-05-10", mileage: 9000, type: "Brake inspection flagged unsafe", severity: "fail" },
      { id: "s2", date: "2025-12-04", mileage: 5400, type: "Strap replacement", cost: 110 },
    ],
  },
  {
    id: "tr4",
    nickname: "Skid Hauler",
    year: 2024,
    make: "Big Tex",
    model: "22GN",
    type: "Tilt Deck",
    subtype: "2car_open" as TrailerSubtype,
    enclosed: false,
    emptyWeight: 4200,
    gvwr: 23900,
    axles: 2,
    length: 24,
    carCapacity: 2,
    status: "operational",
    roadReadyStatus: "road_ready" as RoadReadyStatus,
    availability: "available" as AvailabilityState,
    lastInspectionAt: "2026-06-30T04:45:00Z",
    lastInspectionResult: "pass",
    health: 94,
    insights: [
      { id: "i1", severity: "info", title: "New trailer in service", detail: "All systems within break-in window." },
    ],
    modules: {
      bearings: { lastServiceMiles: 0, intervalMiles: 12000 },
      brakes: { wearPct: 96, lastAdjust: "2026-04-22" },
      tires: { treadPct: 95, ageMonths: 3, blowouts: 0 },
      lighting: { brake: "operational", marker: "operational", wiring: "operational" },
      straps: { goodCount: 10, replaceSoon: 0, replaceDate: "2027-04-01" },
      ramps: { operational: "operational", cableWearPct: 12 },
      deck: { rust: "operational", cracking: "operational", welds: "operational" },
    },
    history: [
      { id: "s1", date: "2026-04-22", mileage: 2200, type: "Pre-delivery inspection passed", severity: "info" },
    ],
  },
];

export type Inspection = {
  id: string;
  date: string;
  type: "pre-trip" | "post-trip";
  equipmentKind: "truck" | "trailer";
  equipmentId: string;
  mileage?: number;
  driver: string;
  result: "pass" | "fail" | "flagged";
  items: { id: string; label: string; ok: boolean; note?: string }[];
  notes?: string;
  photos: number;
};

export const INSPECTIONS: Inspection[] = [
  {
    id: "ins1",
    date: "2026-05-18",
    type: "pre-trip",
    equipmentKind: "truck",
    equipmentId: "t1",
    mileage: 148220,
    driver: "M. Reyes",
    result: "pass",
    items: [
      { id: "tires", label: "Tires", ok: true },
      { id: "lights", label: "Lights", ok: true },
      { id: "brakes", label: "Brakes", ok: true },
      { id: "mirrors", label: "Mirrors", ok: true },
      { id: "leaks", label: "Leaks", ok: true },
      { id: "windshield", label: "Windshield", ok: true },
    ],
    photos: 2,
  },
  {
    id: "ins2",
    date: "2026-05-17",
    type: "pre-trip",
    equipmentKind: "truck",
    equipmentId: "t4",
    mileage: 287900,
    driver: "J. Carter",
    result: "fail",
    items: [
      { id: "tires", label: "Tires", ok: true },
      { id: "lights", label: "Lights", ok: true },
      { id: "brakes", label: "Brakes", ok: false, note: "Soft pedal, low reservoir" },
      { id: "mirrors", label: "Mirrors", ok: true },
      { id: "leaks", label: "Leaks", ok: false, note: "Coolant drip under reservoir" },
      { id: "windshield", label: "Windshield", ok: true },
    ],
    notes: "Equipment placed Out of Service pending repair.",
    photos: 4,
  },
  {
    id: "ins3",
    date: "2026-05-16",
    type: "post-trip",
    equipmentKind: "trailer",
    equipmentId: "tr2",
    driver: "M. Reyes",
    result: "flagged",
    items: [
      { id: "straps", label: "Straps", ok: true },
      { id: "bearings", label: "Bearings", ok: false, note: "Warm hub on driver side" },
      { id: "ramps", label: "Ramps", ok: true },
      { id: "brakes", label: "Brakes", ok: true },
      { id: "tires", label: "Tires", ok: true },
      { id: "winch", label: "Winch", ok: false, note: "Cable fraying near drum" },
      { id: "lights", label: "Lights", ok: true },
    ],
    photos: 3,
  },
  {
    id: "ins4",
    date: "2026-05-15",
    type: "pre-trip",
    equipmentKind: "truck",
    equipmentId: "t3",
    mileage: 38100,
    driver: "S. Patel",
    result: "pass",
    items: [
      { id: "tires", label: "Tires", ok: true },
      { id: "lights", label: "Lights", ok: true },
      { id: "brakes", label: "Brakes", ok: true },
      { id: "mirrors", label: "Mirrors", ok: true },
      { id: "leaks", label: "Leaks", ok: true },
      { id: "windshield", label: "Windshield", ok: true },
    ],
    photos: 1,
  },
  {
    id: "ins5",
    date: "2026-05-14",
    type: "post-trip",
    equipmentKind: "trailer",
    equipmentId: "tr1",
    driver: "M. Reyes",
    result: "pass",
    items: [
      { id: "straps", label: "Straps", ok: true },
      { id: "bearings", label: "Bearings", ok: true },
      { id: "ramps", label: "Ramps", ok: true },
      { id: "brakes", label: "Brakes", ok: true },
      { id: "tires", label: "Tires", ok: true },
      { id: "winch", label: "Winch", ok: true },
      { id: "lights", label: "Lights", ok: true },
    ],
    photos: 2,
  },
];

// ══════════════════════════════════════════════
// Drivers — Operator Registry
// ══════════════════════════════════════════════

export type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  status: "on_duty" | "off_duty" | "on_break";
  currentSessionId?: string;
};

// ══════════════════════════════════════════════
// Cargo Manifest — Loaded Vehicle Registry
// ══════════════════════════════════════════════

export type CargoItem = {
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  slot: number;
};

// ══════════════════════════════════════════════
// Session Modification — Trailer Swap Event
// ══════════════════════════════════════════════

export type SessionModification = {
  id: string;
  timestamp: string;
  previousTrailerId: string;
  newTrailerId: string;
  reason?: string;
};

// ══════════════════════════════════════════════
// Active Equipment Session — Live Relationship Engine
// ══════════════════════════════════════════════

export type EquipmentSession = {
  sessionId: string;
  operatorId: string;
  operatorName: string;
  truckId: string;
  trailerId?: string;
  cargoManifest: CargoItem[];
  status: "active" | "completed";
  startOdometer: number;
  endOdometer?: number;
  startLocation?: string;
  endLocation?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  modifications: SessionModification[];
};

// ══════════════════════════════════════════════
// Session History — DOT Compliance Audit Trail
// ══════════════════════════════════════════════

export type SessionHistoryEntry = {
  id: string;
  sessionId: string;
  operatorId: string;
  operatorName: string;
  truckId: string;
  truckName: string;
  trailerId?: string;
  trailerName?: string;
  cargoCount: number;
  cargoSnapshot: CargoItem[];
  startTime: string;
  endTime: string;
  totalDurationHours: number;
  startOdometer: number;
  endOdometer: number;
  milesDriven: number;
  startLocation?: string;
  endLocation?: string;
  swapCount: number;
  completedBy: string;
};

export const DRIVERS: Driver[] = [
  { id: "d1", name: "Maria Reyes", licenseNumber: "CDL-487921-TX", phone: "(512) 555-0143", status: "on_duty", currentSessionId: "sesh-001" },
  { id: "d2", name: "James Carter", licenseNumber: "CDL-552109-TX", phone: "(210) 555-0178", status: "on_duty", currentSessionId: "sesh-002" },
  { id: "d3", name: "Sanjay Patel", licenseNumber: "CDL-339874-TX", phone: "(713) 555-0192", status: "off_duty" },
  { id: "d4", name: "Derrick Thompson", licenseNumber: "CDL-771234-TX", phone: "(214) 555-0167", status: "on_break" },
];

const ACTIVE_SESSIONS: EquipmentSession[] = [
  {
    sessionId: "sesh-001",
    operatorId: "d1",
    operatorName: "Maria Reyes",
    truckId: "t1",
    trailerId: "tr1",
    cargoManifest: [
      { vin: "1G1ZD5ST•••••4401", make: "Chevrolet", model: "Malibu", year: 2024, color: "Silver", slot: 1 },
      { vin: "5XXGT4L3•••••8922", make: "Kia", model: "Optima", year: 2023, color: "White", slot: 2 },
      { vin: "2HGFC2F5•••••3310", make: "Honda", model: "Civic", year: 2025, color: "Blue", slot: 3 },
    ],
    status: "active",
    startOdometer: 148160,
    startLocation: "Houston Terminal B",
    createdAt: "2026-06-30T06:20:00Z",
    updatedAt: "2026-06-30T06:20:00Z",
    modifications: [],
  },
  {
    sessionId: "sesh-002",
    operatorId: "d2",
    operatorName: "James Carter",
    truckId: "t2",
    trailerId: "tr2",
    cargoManifest: [
      { vin: "3FA6P0H7•••••5599", make: "Ford", model: "Fusion", year: 2023, color: "Black", slot: 1 },
      { vin: "1N4BL4DV•••••7744", make: "Nissan", model: "Altima", year: 2024, color: "Red", slot: 2 },
    ],
    status: "active",
    startOdometer: 211750,
    startLocation: "Dallas Hub A",
    createdAt: "2026-06-29T14:40:00Z",
    updatedAt: "2026-06-29T14:40:00Z",
    modifications: [],
  },
];

const SESSION_HISTORY: SessionHistoryEntry[] = [
  {
    id: "hist-001",
    sessionId: "sesh-098",
    operatorId: "d1",
    operatorName: "Maria Reyes",
    truckId: "t1",
    truckName: "Veloz 01",
    trailerId: "tr1",
    trailerName: "Wedge 40",
    cargoCount: 3,
    cargoSnapshot: [
      { vin: "WBA8E3G5•••••1122", make: "BMW", model: "330i", year: 2024, color: "Gray", slot: 1 },
      { vin: "WAUBNCF5•••••3314", make: "Audi", model: "A4", year: 2023, color: "Silver", slot: 2 },
      { vin: "JTHBF5C2•••••8877", make: "Lexus", model: "IS 350", year: 2025, color: "White", slot: 3 },
    ],
    startTime: "2026-06-29T06:15:00Z",
    endTime: "2026-06-29T18:42:00Z",
    totalDurationHours: 12.45,
    startOdometer: 147880,
    endOdometer: 148100,
    milesDriven: 220,
    startLocation: "Houston Terminal B",
    endLocation: "San Antonio Drop Lot",
    swapCount: 0,
    completedBy: "Maria Reyes",
  },
  {
    id: "hist-002",
    sessionId: "sesh-097",
    operatorId: "d2",
    operatorName: "James Carter",
    truckId: "t2",
    truckName: "Veloz 02",
    trailerId: "tr2",
    trailerName: "Gooseneck 36",
    cargoCount: 2,
    cargoSnapshot: [
      { vin: "4S3BNAB6•••••2233", make: "Subaru", model: "Legacy", year: 2024, color: "Green", slot: 1 },
      { vin: "JF1VA1E6•••••9944", make: "Subaru", model: "WRX", year: 2023, color: "Blue", slot: 2 },
    ],
    startTime: "2026-06-28T05:50:00Z",
    endTime: "2026-06-28T17:10:00Z",
    totalDurationHours: 11.33,
    startOdometer: 211600,
    endOdometer: 211730,
    milesDriven: 130,
    startLocation: "Dallas Hub A",
    endLocation: "Fort Worth Depot",
    swapCount: 0,
    completedBy: "James Carter",
  },
  {
    id: "hist-003",
    sessionId: "sesh-096",
    operatorId: "d1",
    operatorName: "Maria Reyes",
    truckId: "t1",
    truckName: "Veloz 01",
    trailerId: "tr4",
    trailerName: "Skid Hauler",
    cargoCount: 2,
    cargoSnapshot: [
      { vin: "1HGCV1F3•••••5566", make: "Honda", model: "Accord", year: 2025, color: "Black", slot: 1 },
      { vin: "KMHL64JA•••••9988", make: "Hyundai", model: "Sonata", year: 2024, color: "White", slot: 2 },
    ],
    startTime: "2026-06-27T06:00:00Z",
    endTime: "2026-06-27T19:30:00Z",
    totalDurationHours: 13.5,
    startOdometer: 147500,
    endOdometer: 147860,
    milesDriven: 360,
    startLocation: "Houston Terminal B",
    endLocation: "Austin Yard",
    swapCount: 1,
    completedBy: "Maria Reyes",
  },
  {
    id: "hist-004",
    sessionId: "sesh-095",
    operatorId: "d3",
    operatorName: "Sanjay Patel",
    truckId: "t3",
    truckName: "Veloz 03",
    trailerId: "tr1",
    trailerName: "Wedge 40",
    cargoCount: 3,
    cargoSnapshot: [
      { vin: "1FTEW1E5•••••4455", make: "Ford", model: "F-150", year: 2025, color: "Red", slot: 1 },
      { vin: "3C6UR5FL•••••1123", make: "Ram", model: "2500", year: 2024, color: "White", slot: 2 },
      { vin: "1GT42YE8•••••6678", make: "GMC", model: "Sierra 1500", year: 2025, color: "Black", slot: 3 },
    ],
    startTime: "2026-06-27T07:10:00Z",
    endTime: "2026-06-27T20:15:00Z",
    totalDurationHours: 13.08,
    startOdometer: 38000,
    endOdometer: 38350,
    milesDriven: 350,
    startLocation: "Austin Yard",
    endLocation: "Houston Terminal B",
    swapCount: 0,
    completedBy: "Sanjay Patel",
  },
  {
    id: "hist-005",
    sessionId: "sesh-094",
    operatorId: "d2",
    operatorName: "James Carter",
    truckId: "t2",
    truckName: "Veloz 02",
    cargoCount: 0,
    cargoSnapshot: [],
    startTime: "2026-06-25T08:00:00Z",
    endTime: "2026-06-25T16:30:00Z",
    totalDurationHours: 8.5,
    startOdometer: 211000,
    endOdometer: 211550,
    milesDriven: 550,
    startLocation: "Dallas Hub A",
    endLocation: "Dallas Hub A",
    swapCount: 0,
    completedBy: "James Carter",
  },
  {
    id: "hist-006",
    sessionId: "sesh-093",
    operatorId: "d4",
    operatorName: "Derrick Thompson",
    truckId: "t5",
    truckName: "Veloz 05",
    trailerId: "tr4",
    trailerName: "Skid Hauler",
    cargoCount: 2,
    cargoSnapshot: [
      { vin: "WMWXP7C5•••••3344", make: "MINI", model: "Cooper S", year: 2025, color: "Yellow", slot: 1 },
      { vin: "WBS3R9C5•••••1100", make: "BMW", model: "M3", year: 2024, color: "Green", slot: 2 },
    ],
    startTime: "2026-06-24T06:30:00Z",
    endTime: "2026-06-24T18:45:00Z",
    totalDurationHours: 12.25,
    startOdometer: 67500,
    endOdometer: 67880,
    milesDriven: 380,
    startLocation: "Austin Yard",
    endLocation: "San Antonio Drop Lot",
    swapCount: 0,
    completedBy: "Derrick Thompson",
  },
];

export const FLEET_AI = {
  readiness: 78,
  downtimeRisk: "Low" as "Low" | "Medium" | "High",
  mpgTrend: [10.4, 10.3, 10.2, 10.1, 9.9, 10.0, 10.1, 10.0, 9.9, 10.2, 10.3, 10.1],
  costTrend: [1820, 2100, 1640, 1980, 2240, 1760, 2350, 2090, 1880, 2410, 2680, 1990],
  predictions: [
    { id: "p1", title: "Veloz 04 — Cooling system service", eta: "Within 7 days", severity: "fail" as const },
    { id: "p2", title: "Veloz 02 — Front tire replacement", eta: "Within 2,000 mi", severity: "warn" as const },
    { id: "p3", title: "Wedge 40 — Trailer tire set replacement", eta: "Within 3,000 mi", severity: "warn" as const },
    { id: "p4", title: "Veloz 01 — Oil service (overdue)", eta: "Now", severity: "fail" as const },
    { id: "p5", title: "Gooseneck 36 — Bearing repack", eta: "Now", severity: "warn" as const },
  ],
};
