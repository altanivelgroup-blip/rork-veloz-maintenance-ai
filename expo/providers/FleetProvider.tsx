import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo, useState } from "react";

import {
  TRUCKS, TRAILERS, INSPECTIONS, FLEET_AI, DRIVERS,
  FUEL_TRANSACTIONS,
  getInspectionStatus, INSPECTION_EXPIRY_HOURS,
  calcServiceUrgency, checkWarrantyCoverage,
  calcRollingMPG, checkMPGDegradation, calcFuelCPM, fuelAnalytics, getMPGBaseline,
  type Truck, type Trailer, type Inspection, type Driver,
  type AvailabilityState, type RoadReadyStatus,
  type EquipmentSession, type SessionHistoryEntry,
  type SessionModification, type CargoItem,
  type RepairRecord, type RepairLineItem,
  type ServiceScheduleConfig, type ServiceUrgency, type PMLevel,
  type WarrantyProfile, type MaintenanceLockState,
  type FuelTransaction, type FuelFraudFlag,
  type ActiveCoupling, type InspectionVaultEntry,
  type OperationalIncident, type OperationalIncidentSeverity,
  type OperationalResolutionStatus,
} from "@/constants/mockData";
import {
  calcTruckCPM,
  calcFleetCPM,
  getCPMProportions,
  type CPMBreakdown,
  type TimeframeKey,
} from "@/lib/cpmAccounting";
import {
  INCIDENTS,
  buildIncident,
  incidentStats,
  type Incident,
  type IncidentEvent,
  type IncidentStatus,
  type NewIncidentInput,
} from "@/constants/incidentData";

export const [FleetProvider, useFleet] = createContextHook(() => {
  const [trucks, setTrucks] = useState<Truck[]>(TRUCKS);
  const [trailers, setTrailers] = useState<Trailer[]>(TRAILERS);
  const [inspections, setInspections] = useState<Inspection[]>(INSPECTIONS);
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [fuelTransactions] = useState<FuelTransaction[]>(FUEL_TRANSACTIONS);

  // ══════════════════════════════════════════════
  // Operations — Couplings, Vault, Operational Incidents
  // ══════════════════════════════════════════════

  const [couplings] = useState<ActiveCoupling[]>([
    {
      couplingId: "coup-001", truckId: "t1", truckName: "Veloz 01",
      trailerId: "tr1", trailerName: "Wedge 40",
      operatorId: "d1", operatorName: "Maria Reyes",
      state: "coupled", cargoCount: 3, cargoSealId: "SEAL-88421-D",
      startLocation: "Houston Terminal B", createdAt: "2026-06-30T06:20:00Z",
    },
    {
      couplingId: "coup-002", truckId: "t2", truckName: "Veloz 02",
      trailerId: "tr2", trailerName: "Gooseneck 36",
      operatorId: "d2", operatorName: "James Carter",
      state: "coupled", cargoCount: 2, cargoSealId: "SEAL-88422-E",
      startLocation: "Dallas Hub A", createdAt: "2026-06-29T14:40:00Z",
    },
    {
      couplingId: "coup-003", truckId: "t3", truckName: "Veloz 03",
      state: "bobtail", cargoCount: 0,
      startLocation: "Austin Yard", createdAt: "2026-06-30T09:00:00Z",
    },
  ]);

  const [vaultEntries] = useState<InspectionVaultEntry[]>([
    {
      id: "vault-001", date: "2026-06-30T06:14:00Z", truckId: "t1", truckName: "Veloz 01",
      trailerId: "tr1", trailerName: "Wedge 40", driver: "Maria Reyes",
      truckResult: "pass", trailerResult: "pass", cargoSealVerified: true,
      cargoSealId: "SEAL-88421-D", photos: 4, timeOnTaskSeconds: 312,
      notes: "Full pre-trip checklist complete. All systems nominal.",
    },
    {
      id: "vault-002", date: "2026-06-29T14:30:00Z", truckId: "t2", truckName: "Veloz 02",
      trailerId: "tr2", trailerName: "Gooseneck 36", driver: "James Carter",
      truckResult: "pass", trailerResult: "flagged", cargoSealVerified: true,
      cargoSealId: "SEAL-88422-E", photos: 3, timeOnTaskSeconds: 285,
      notes: "Trailer marker light flagged — intermittent. Monitor next trip.",
    },
    {
      id: "vault-003", date: "2026-06-29T08:00:00Z", truckId: "t3", truckName: "Veloz 03",
      driver: "Sanjay Patel", truckResult: "pass", cargoSealVerified: false,
      photos: 2, timeOnTaskSeconds: 198, notes: "Bobtail pre-trip — no trailer to inspect.",
    },
    {
      id: "vault-004", date: "2026-06-28T12:00:00Z", truckId: "t2", truckName: "Veloz 02",
      trailerId: "tr2", trailerName: "Gooseneck 36", driver: "James Carter",
      truckResult: "pass", trailerResult: "pass", cargoSealVerified: true,
      cargoSealId: "SEAL-88420-C", photos: 4, timeOnTaskSeconds: 340,
    },
    {
      id: "vault-005", date: "2026-06-28T07:45:00Z", truckId: "t4", truckName: "Veloz 04",
      trailerId: "tr3", trailerName: "Enclosed 28", driver: "Derrick Thompson",
      truckResult: "fail", trailerResult: "fail", cargoSealVerified: false,
      photos: 6, timeOnTaskSeconds: 420,
      notes: "Truck: coolant system alert + brake fluid low. Trailer: brake shoes at 14%, marker out. Both OOS.",
    },
    {
      id: "vault-006", date: "2026-06-27T09:00:00Z", truckId: "t4", truckName: "Veloz 04",
      trailerId: "tr3", trailerName: "Enclosed 28", driver: "Derrick Thompson",
      truckResult: "pass", trailerResult: "fail", cargoSealVerified: false,
      photos: 3, timeOnTaskSeconds: 356,
    },
    {
      id: "vault-007", date: "2026-06-27T06:00:00Z", truckId: "t1", truckName: "Veloz 01",
      trailerId: "tr4", trailerName: "Skid Hauler", driver: "Maria Reyes",
      truckResult: "pass", trailerResult: "pass", cargoSealVerified: true,
      cargoSealId: "SEAL-88418-A", photos: 4, timeOnTaskSeconds: 298,
    },
  ]);

  const [operationalIncidents] = useState<OperationalIncident[]>([
    {
      incidentId: "opi-001", sessionId: "sesh-001", operatorId: "d1",
      operatorName: "Maria Reyes", truckId: "t1", truckName: "Veloz 01",
      trailerId: "tr1", trailerName: "Wedge 40",
      timestamp: "2026-06-30T10:42:00Z", gpsLocation: "I-10 E, MM 742 · Houston, TX",
      severityTier: "critical_sos", resolutionStatus: "open",
      title: "Cargo SOS — Vehicle shift on trailer deck",
      description: "Driver reports load shifted on wedge deck after evasive maneuver. One vehicle partially off track. Requesting roadside assist and re-secure crew. No injuries.",
      affectedCargoVins: ["1G1ZD5ST•••••4401", "5XXGT4L3•••••8922"],
      documentRefs: [{ type: "police_report", ref: "TXHP-2026-44891" }],
      dispatcherNotes: [
        { by: "Dispatch", at: "2026-06-30T10:45:00Z", text: "Roadside assist dispatched — ETA 25 min. Highway patrol unit 18 on scene." },
        { by: "Safety", at: "2026-06-30T10:50:00Z", text: "Cargo re-secure crew notified. Reviewing deck strap inventory on Wedge 40." },
      ],
    },
    {
      incidentId: "opi-002", sessionId: "sesh-002", operatorId: "d2",
      operatorName: "James Carter", truckId: "t2", truckName: "Veloz 02",
      timestamp: "2026-06-30T08:15:00Z", gpsLocation: "I-35 N, MM 418 · Dallas, TX",
      severityTier: "mechanical_failure", resolutionStatus: "in_progress",
      title: "Transmission overheat warning — limped to shoulder",
      description: "Transmission temp warning at 245°F. Driver pulled over safely. No cargo damage. Suspect transmission cooler line issue. Tow dispatched.",
      affectedCargoVins: [], documentRefs: [],
      dispatcherNotes: [
        { by: "Dispatch", at: "2026-06-30T08:20:00Z", text: "Tow dispatched — ETA 40 min. Driver safe." },
        { by: "Maintenance", at: "2026-06-30T08:35:00Z", text: "WO-2026-0630 opened. Suspect cooler line — referencing AAMCO service." },
      ],
    },
    {
      incidentId: "opi-003", sessionId: "sesh-098", operatorId: "d1",
      operatorName: "Maria Reyes", truckId: "t1", truckName: "Veloz 01",
      trailerId: "tr1", trailerName: "Wedge 40",
      timestamp: "2026-06-29T15:30:00Z", gpsLocation: "US-281 S · San Antonio, TX",
      severityTier: "cargo_damage_claim", resolutionStatus: "open",
      title: "Customer cargo claim — scratch on BMW 330i quarter panel",
      description: "Customer at delivery noted light scratch on rear quarter panel of 2024 BMW 330i. Documented with photos. Insurance claim filed.",
      affectedCargoVins: ["WBA8E3G5•••••1122"],
      documentRefs: [{ type: "insurance_claim", ref: "CLM-77145" }, { type: "photo", ref: "damage-bmw-330i-01.jpg" }],
      dispatcherNotes: [
        { by: "Dispatch", at: "2026-06-29T15:45:00Z", text: "Photos submitted. Insurance notified. Customer to provide repair estimate." },
      ],
    },
    {
      incidentId: "opi-004",
      truckId: "t4", truckName: "Veloz 04", trailerId: "tr3", trailerName: "Enclosed 28",
      timestamp: "2026-06-28T13:10:00Z", gpsLocation: "Veloz Yard · Fort Worth, TX",
      severityTier: "mechanical_failure", resolutionStatus: "resolved",
      title: "Pre-trip inspection failure — Veloz 04 coolant system",
      description: "Morning pre-trip flagged coolant temperature spike at 218°F and low brake fluid reservoir. Unit placed Out of Service.",
      affectedCargoVins: [], documentRefs: [],
      dispatcherNotes: [
        { by: "Dispatch", at: "2026-06-28T13:15:00Z", text: "Veloz 04 grounded. Veloz 03 assigned as alternate." },
        { by: "Maintenance", at: "2026-06-28T14:00:00Z", text: "Confirmed water pump failure and caliper leak. Both repairs in progress. ETA 48h." },
      ],
      correctiveAction: "Water pump + caliper replacement. Full cooling system flush.",
      resolvedAt: "2026-06-30T09:00:00Z", resolvedBy: "Carlos Ortiz",
    },
    {
      incidentId: "opi-005",
      timestamp: "2026-06-27T11:20:00Z", gpsLocation: "I-20 W, MM 312 · Abilene, TX",
      severityTier: "low_delay", resolutionStatus: "resolved",
      title: "Traffic delay — 45 min due to construction",
      description: "I-20 lane closure for bridge work caused 45-minute delay en route to Lubbock. Customer notified of revised ETA. No equipment or cargo issues.",
      affectedCargoVins: [], documentRefs: [],
      dispatcherNotes: [
        { by: "Dispatch", at: "2026-06-27T11:25:00Z", text: "Customer Premier Motors notified of revised 14:30 ETA." },
      ],
      correctiveAction: "Alternative routing added for future Lubbock runs during construction window.",
      resolvedAt: "2026-06-27T14:30:00Z", resolvedBy: "Dispatch",
    },
  ]);

  const getTruck = useCallback((id: string) => trucks.find((t) => t.id === id), [trucks]);
  const getTrailer = useCallback((id: string) => trailers.find((t) => t.id === id), [trailers]);

  const fleetHealth = useMemo(() => {
    const all = [...trucks.map((t) => t.health), ...trailers.map((t) => t.health)];
    if (all.length === 0) return 0;
    return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
  }, [trucks, trailers]);

  const counts = useMemo(() => {
    const eq = [...trucks, ...trailers];
    return {
      operational: eq.filter((e) => e.status === "operational").length,
      attention: eq.filter((e) => e.status === "attention").length,
      out: eq.filter((e) => e.status === "out").length,
      trucksOp: trucks.filter((t) => t.status === "operational").length,
      trailersOp: trailers.filter((t) => t.status === "operational").length,
      trucksOut: trucks.filter((t) => t.status === "out").length,
      trailersOut: trailers.filter((t) => t.status === "out").length,
    };
  }, [trucks, trailers]);

  const allInsights = useMemo(() => {
    const items: { id: string; equipment: string; severity: "info" | "warn" | "fail"; title: string; detail: string }[] = [];
    trucks.forEach((t) => t.insights.forEach((i) => items.push({ id: `${t.id}-${i.id}`, equipment: t.nickname, severity: i.severity, title: i.title, detail: i.detail })));
    trailers.forEach((t) => t.insights.forEach((i) => items.push({ id: `${t.id}-${i.id}`, equipment: t.nickname, severity: i.severity, title: i.title, detail: i.detail })));
    const order = { fail: 0, warn: 1, info: 2 } as const;
    return items.sort((a, b) => order[a.severity] - order[b.severity]);
  }, [trucks, trailers]);

  const addInspection = useCallback((insp: Inspection) => {
    setInspections((prev) => [insp, ...prev]);
  }, []);

  const getIncident = useCallback((id: string) => incidents.find((i) => i.id === id), [incidents]);

  const addIncident = useCallback((input: NewIncidentInput) => {
    const incident = buildIncident(input, incidents.length);
    setIncidents((prev) => [incident, ...prev]);
    return incident;
  }, [incidents.length]);

  const incidentsByEquipment = useCallback(
    (equipmentId: string) => incidents.filter((i) => i.truckId === equipmentId || i.trailerId === equipmentId),
    [incidents],
  );

  const updateIncidentStatus = useCallback(
    (id: string, status: IncidentStatus, note?: string) => {
      const today = new Date().toISOString().slice(0, 10);
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id !== id) return inc;
          const event: IncidentEvent = {
            id: `e-${Date.now()}`,
            kind: status === "open" ? "note" : status,
            label:
              status === "resolved"
                ? "Marked resolved"
                : status === "in_review"
                  ? "Moved to review"
                  : "Re-opened",
            detail: note,
            by: "You",
            at: today,
          };
          return {
            ...inc,
            status,
            resolutionNote: status === "resolved" ? note ?? inc.resolutionNote : inc.resolutionNote,
            resolvedAt: status === "resolved" ? today : inc.resolvedAt,
            timeline: [...(inc.timeline ?? []), event],
          };
        }),
      );
    },
    [],
  );

  const incidentSummary = useMemo(() => incidentStats(incidents), [incidents]);

  // ══════════════════════════════════════════════
  // Operations — Availability & Inspection
  // ══════════════════════════════════════════════

  const availabilityCounts = useMemo(() => {
    const tally = (items: (Truck | Trailer)[], state: AvailabilityState) =>
      items.filter((e) => e.availability === state).length;
    const all = [...trucks, ...trailers];
    return {
      available: tally(all, "available"),
      assigned: tally(all, "assigned"),
      inShop: tally(all, "in_shop"),
      staged: tally(all, "staged"),
      total: all.length,
    };
  }, [trucks, trailers]);

  const expiredInspections = useMemo(() => {
    const expired: { id: string; name: string; kind: "truck" | "trailer"; hoursAgo: number }[] = [];
    trucks.forEach((t) => {
      const status = getInspectionStatus(t.lastInspectionAt);
      if (status.expired) expired.push({ id: t.id, name: t.nickname, kind: "truck", hoursAgo: status.hoursAgo });
    });
    trailers.forEach((t) => {
      const status = getInspectionStatus(t.lastInspectionAt);
      if (status.expired) expired.push({ id: t.id, name: t.nickname, kind: "trailer", hoursAgo: status.hoursAgo });
    });
    return expired;
  }, [trucks, trailers]);

  // ══════════════════════════════════════════════
  // Operations — Coupling Matrix
  // ══════════════════════════════════════════════

  /** Get the coupling for a given truck */
  const getCouplingForTruck = useCallback(
    (truckId: string): ActiveCoupling | undefined => couplings.find((c) => c.truckId === truckId),
    [couplings],
  );

  /** Bobtail count: active trucks with no trailer */
  const bobtailCount = useMemo(
    () => couplings.filter((c) => c.state === "bobtail").length,
    [couplings],
  );

  /** Availability ticker for the operations grid */
  const operationsTicker = useMemo(() => {
    const coupledTrucks = couplings.filter((c) => c.state === "coupled");
    const bobtails = couplings.filter((c) => c.state === "bobtail");
    const availableTrailers = trailers.filter(
      (t) => t.availability === "available" && !couplings.some((c) => c.trailerId === t.id),
    );
    const grounded = [...trucks, ...trailers].filter((e) => e.roadReadyStatus === "out_of_service");
    return {
      inTransit: coupledTrucks.length,
      availableBobtail: bobtails.length + trucks.filter((t) => t.availability === "available" && !couplings.some((c) => c.truckId === t.id)).length,
      availableTrailers: availableTrailers.length,
      grounded: grounded.length,
      totalCouplings: couplings.length,
    };
  }, [couplings, trucks, trailers]);

  // ══════════════════════════════════════════════
  // Operations — Inspection Vault
  // ══════════════════════════════════════════════

  /** 30-day inspection history for any truck-trailer pair */
  const getInspectionVault = useCallback(
    (truckId?: string, trailerId?: string): InspectionVaultEntry[] => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoff = thirtyDaysAgo.toISOString();
      return vaultEntries
        .filter((e) => {
          if (truckId && e.truckId !== truckId) return false;
          if (trailerId && e.trailerId !== trailerId) return false;
          return e.date >= cutoff;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    [vaultEntries],
  );

  // ══════════════════════════════════════════════
  // Operations — Triage Queue (prioritized feed)
  // ══════════════════════════════════════════════

  const triageQueue = useMemo(() => {
    return [...operationalIncidents]
      .filter((i) => i.resolutionStatus !== "resolved")
      .sort((a, b) => {
        const priorityA = { critical_sos: 0, cargo_damage_claim: 1, mechanical_failure: 2, low_delay: 3 }[a.severityTier];
        const priorityB = { critical_sos: 0, cargo_damage_claim: 1, mechanical_failure: 2, low_delay: 3 }[b.severityTier];
        if (priorityA !== priorityB) return priorityA - priorityB;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [operationalIncidents]);

  /** Asset Incident History — all ops incidents for a specific equipment ID */
  const getAssetIncidentHistory = useCallback(
    (assetId: string): OperationalIncident[] => {
      return operationalIncidents.filter(
        (i) => i.truckId === assetId || i.trailerId === assetId,
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    [operationalIncidents],
  );

  // ══════════════════════════════════════════════
  // Live Equipment Sessions — Asset Relationship Engine
  // ══════════════════════════════════════════════

  const [sessions, setSessions] = useState<EquipmentSession[]>([
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
  ]);

  const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>([
    {
      id: "hist-001", sessionId: "sesh-098", operatorId: "d1", operatorName: "Maria Reyes",
      truckId: "t1", truckName: "Veloz 01", trailerId: "tr1", trailerName: "Wedge 40",
      cargoCount: 3, cargoSnapshot: [],
      startTime: "2026-06-29T06:15:00Z", endTime: "2026-06-29T18:42:00Z",
      totalDurationHours: 12.45, startOdometer: 147880, endOdometer: 148100, milesDriven: 220,
      startLocation: "Houston Terminal B", endLocation: "San Antonio Drop Lot",
      swapCount: 0, completedBy: "Maria Reyes",
    },
    {
      id: "hist-002", sessionId: "sesh-097", operatorId: "d2", operatorName: "James Carter",
      truckId: "t2", truckName: "Veloz 02", trailerId: "tr2", trailerName: "Gooseneck 36",
      cargoCount: 2, cargoSnapshot: [],
      startTime: "2026-06-28T05:50:00Z", endTime: "2026-06-28T17:10:00Z",
      totalDurationHours: 11.33, startOdometer: 211600, endOdometer: 211730, milesDriven: 130,
      startLocation: "Dallas Hub A", endLocation: "Fort Worth Depot",
      swapCount: 0, completedBy: "James Carter",
    },
    {
      id: "hist-003", sessionId: "sesh-096", operatorId: "d1", operatorName: "Maria Reyes",
      truckId: "t1", truckName: "Veloz 01", trailerId: "tr4", trailerName: "Skid Hauler",
      cargoCount: 2, cargoSnapshot: [],
      startTime: "2026-06-27T06:00:00Z", endTime: "2026-06-27T19:30:00Z",
      totalDurationHours: 13.5, startOdometer: 147500, endOdometer: 147860, milesDriven: 360,
      startLocation: "Houston Terminal B", endLocation: "Austin Yard",
      swapCount: 1, completedBy: "Maria Reyes",
    },
    {
      id: "hist-004", sessionId: "sesh-095", operatorId: "d3", operatorName: "Sanjay Patel",
      truckId: "t3", truckName: "Veloz 03", trailerId: "tr1", trailerName: "Wedge 40",
      cargoCount: 3, cargoSnapshot: [],
      startTime: "2026-06-27T07:10:00Z", endTime: "2026-06-27T20:15:00Z",
      totalDurationHours: 13.08, startOdometer: 38000, endOdometer: 38350, milesDriven: 350,
      startLocation: "Austin Yard", endLocation: "Houston Terminal B",
      swapCount: 0, completedBy: "Sanjay Patel",
    },
    {
      id: "hist-005", sessionId: "sesh-094", operatorId: "d2", operatorName: "James Carter",
      truckId: "t2", truckName: "Veloz 02",
      cargoCount: 0, cargoSnapshot: [],
      startTime: "2026-06-25T08:00:00Z", endTime: "2026-06-25T16:30:00Z",
      totalDurationHours: 8.5, startOdometer: 211000, endOdometer: 211550, milesDriven: 550,
      startLocation: "Dallas Hub A", endLocation: "Dallas Hub A",
      swapCount: 0, completedBy: "James Carter",
    },
    {
      id: "hist-006", sessionId: "sesh-093", operatorId: "d4", operatorName: "Derrick Thompson",
      truckId: "t5", truckName: "Veloz 05", trailerId: "tr4", trailerName: "Skid Hauler",
      cargoCount: 2, cargoSnapshot: [],
      startTime: "2026-06-24T06:30:00Z", endTime: "2026-06-24T18:45:00Z",
      totalDurationHours: 12.25, startOdometer: 67500, endOdometer: 67880, milesDriven: 380,
      startLocation: "Austin Yard", endLocation: "San Antonio Drop Lot",
      swapCount: 0, completedBy: "Derrick Thompson",
    },
  ]);

  const activeSessions = useMemo(() => sessions.filter((s) => s.status === "active"), [sessions]);

  const getCurrentOperator = useCallback(
    (equipmentId: string): Driver | null => {
      const session = activeSessions.find(
        (s) => s.truckId === equipmentId || s.trailerId === equipmentId,
      );
      if (!session) return null;
      return DRIVERS.find((d) => d.id === session.operatorId) ?? null;
    },
    [activeSessions],
  );

  const sessionConflictCheck = useCallback(
    (operatorId: string, truckId: string, trailerId?: string): { ok: true } | { ok: false; conflict: string } => {
      const opConflict = activeSessions.find((s) => s.operatorId === operatorId);
      if (opConflict) return { ok: false, conflict: `Driver already in active session ${opConflict.sessionId}.` };
      const trkConflict = activeSessions.find((s) => s.truckId === truckId);
      if (trkConflict) return { ok: false, conflict: `Truck already in active session ${trkConflict.sessionId}.` };
      if (trailerId) {
        const trlConflict = activeSessions.find((s) => s.trailerId === trailerId);
        if (trlConflict) return { ok: false, conflict: `Trailer already in active session ${trlConflict.sessionId}.` };
      }
      return { ok: true };
    },
    [activeSessions],
  );

  const createSession = useCallback(
    (params: {
      operatorId: string;
      truckId: string;
      trailerId?: string;
      cargoManifest?: CargoItem[];
      startLocation?: string;
    }): { ok: true; session: EquipmentSession } | { ok: false; error: string } => {
      const driver = DRIVERS.find((d) => d.id === params.operatorId);
      const truck = trucks.find((t) => t.id === params.truckId);
      if (!driver) return { ok: false, error: "Driver not found." };
      if (!truck) return { ok: false, error: "Truck not found." };

      if (truck.roadReadyStatus === "out_of_service") {
        return { ok: false, error: "Cannot create session: truck is Out of Service (Dead-Red)." };
      }
      const checkMaintenanceLock = (eqId: string, kind: string): string | null => {
        const eq = [...trucks, ...trailers].find((e) => e.id === eqId);
        if (!eq?.serviceSchedules) return null;
        const mileage = ("mileage" in eq ? (eq as Truck).mileage : 0);
        for (const s of eq.serviceSchedules) {
          const r = calcServiceUrgency(s, mileage);
          if (r.urgency === "critical_lockout") {
            return `${kind} locked out: ${s.label} expired — mandatory safety clearance required. Contact Fleet Maintenance immediately.`;
          }
        }
        return null;
      };
      const truckLock = checkMaintenanceLock(params.truckId, "Truck");
      if (truckLock) return { ok: false, error: `Dispatch Blocked: ${truckLock}` };
      if (params.trailerId) {
        const trailer = trailers.find((t) => t.id === params.trailerId);
        if (trailer?.roadReadyStatus === "out_of_service") {
          return { ok: false, error: "Cannot create session: trailer is Out of Service (Dead-Red)." };
        }
        const trailerLock = checkMaintenanceLock(params.trailerId, "Trailer");
        if (trailerLock) return { ok: false, error: `Dispatch Blocked: ${trailerLock}` };
      }

      const conflict = sessionConflictCheck(params.operatorId, params.truckId, params.trailerId);
      if (!conflict.ok) return { ok: false, error: `Concurrency Exception: ${conflict.conflict}` };

      const now = new Date().toISOString();
      const session: EquipmentSession = {
        sessionId: `sesh-${String(sessions.length + 1).padStart(3, "0")}`,
        operatorId: params.operatorId,
        operatorName: driver.name,
        truckId: params.truckId,
        trailerId: params.trailerId,
        cargoManifest: params.cargoManifest ?? [],
        status: "active",
        startOdometer: truck.mileage,
        startLocation: params.startLocation,
        createdAt: now,
        updatedAt: now,
        modifications: [],
      };

      setSessions((prev) => [session, ...prev]);
      setTrucks((prev) => prev.map((t) => (t.id === params.truckId ? { ...t, availability: "assigned" as AvailabilityState } : t)));
      if (params.trailerId) {
        setTrailers((prev) =>
          prev.map((t) => (t.id === params.trailerId ? { ...t, availability: "assigned" as AvailabilityState, assignedTruckId: params.truckId } : t)),
        );
      }
      return { ok: true, session };
    },
    [trucks, trailers, sessions, sessionConflictCheck],
  );

  const modifySessionTrailer = useCallback(
    (sessionId: string, newTrailerId: string, reason?: string): { ok: true } | { ok: false; error: string } => {
      const session = sessions.find((s) => s.sessionId === sessionId);
      if (!session || session.status !== "active") return { ok: false, error: "Session not found or not active." };
      const newTrailer = trailers.find((t) => t.id === newTrailerId);
      if (!newTrailer) return { ok: false, error: "Trailer not found." };
      if (newTrailer.roadReadyStatus === "out_of_service") {
        return { ok: false, error: "Cannot swap: trailer is Out of Service." };
      }
      const trlConflict = activeSessions.find((s) => s.sessionId !== sessionId && s.trailerId === newTrailerId);
      if (trlConflict) return { ok: false, error: `Concurrency Exception: Trailer already active in session ${trlConflict.sessionId}.` };

      const now = new Date().toISOString();
      const mod: SessionModification = {
        id: `mod-${Date.now()}`,
        timestamp: now,
        previousTrailerId: session.trailerId ?? "",
        newTrailerId,
        reason,
      };

      if (session.trailerId) {
        setTrailers((prev) =>
          prev.map((t) => (t.id === session.trailerId ? { ...t, availability: "available" as AvailabilityState, assignedTruckId: undefined } : t)),
        );
      }
      setTrailers((prev) =>
        prev.map((t) => (t.id === newTrailerId ? { ...t, availability: "assigned" as AvailabilityState, assignedTruckId: session.truckId } : t)),
      );
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === sessionId
            ? { ...s, trailerId: newTrailerId, cargoManifest: [], modifications: [...s.modifications, mod], updatedAt: now }
            : s,
        ),
      );
      return { ok: true };
    },
    [sessions, trailers, activeSessions],
  );

  const terminateSession = useCallback(
    (sessionId: string, endLocation?: string): { ok: true; history: SessionHistoryEntry } | { ok: false; error: string } => {
      const session = sessions.find((s) => s.sessionId === sessionId);
      if (!session || session.status !== "active") return { ok: false, error: "Session not found or not active." };
      const truck = trucks.find((t) => t.id === session.truckId);
      if (!truck) return { ok: false, error: "Truck not found in fleet." };

      const now = new Date().toISOString();
      const startTime = new Date(session.createdAt).getTime();
      const endTime = Date.now();
      const totalDurationHours = (endTime - startTime) / (1000 * 60 * 60);
      const endOdometer = truck.mileage;
      const milesDriven = endOdometer - session.startOdometer;

      const historyEntry: SessionHistoryEntry = {
        id: `hist-${String(sessionHistory.length + 1).padStart(3, "0")}`,
        sessionId: session.sessionId,
        operatorId: session.operatorId,
        operatorName: session.operatorName,
        truckId: session.truckId,
        truckName: truck.nickname,
        trailerId: session.trailerId,
        trailerName: session.trailerId ? trailers.find((t) => t.id === session.trailerId)?.nickname : undefined,
        cargoCount: session.cargoManifest.length,
        cargoSnapshot: [...session.cargoManifest],
        startTime: session.createdAt,
        endTime: now,
        totalDurationHours: Math.round(totalDurationHours * 100) / 100,
        startOdometer: session.startOdometer,
        endOdometer,
        milesDriven: Math.max(0, milesDriven),
        startLocation: session.startLocation,
        endLocation: endLocation ?? session.endLocation,
        swapCount: session.modifications.length,
        completedBy: session.operatorName,
      };

      setSessionHistory((prev) => [historyEntry, ...prev]);
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === sessionId
            ? { ...s, status: "completed", completedAt: now, endOdometer, endLocation, updatedAt: now }
            : s,
        ),
      );
      setTrucks((prev) =>
        prev.map((t) =>
          t.id === session.truckId ? { ...t, availability: "available" as AvailabilityState, assignedTrailerId: undefined } : t,
        ),
      );
      if (session.trailerId) {
        setTrailers((prev) =>
          prev.map((t) =>
            t.id === session.trailerId ? { ...t, availability: "available" as AvailabilityState, assignedTruckId: undefined } : t,
          ),
        );
      }
      return { ok: true, history: historyEntry };
    },
    [sessions, sessionHistory, trucks, trailers],
  );

  const getSessionHistoryForAsset = useCallback(
    (assetId: string, since?: string, until?: string): SessionHistoryEntry[] => {
      return sessionHistory.filter((h) => {
        const matches = h.truckId === assetId || h.trailerId === assetId;
        if (!matches) return false;
        if (since && h.startTime < since) return false;
        if (until && h.endTime > until) return false;
        return true;
      });
    },
    [sessionHistory],
  );

  const getOperatorsForAsset = useCallback(
    (assetId: string): string[] => {
      const names = sessionHistory
        .filter((h) => h.truckId === assetId || h.trailerId === assetId)
        .map((h) => h.operatorName);
      return [...new Set(names)];
    },
    [sessionHistory],
  );

  // ══════════════════════════════════════════════
  // Maintenance Engine — Service & Warranty
  // ══════════════════════════════════════════════

  const getRepairRecords = useCallback(
    (assetId: string): RepairRecord[] => {
      const equipment = [...trucks, ...trailers].find((e) => e.id === assetId);
      return equipment?.repairRecords ?? [];
    },
    [trucks, trailers],
  );

  const getServiceUrgency = useCallback(
    (assetId: string): { schedule: ServiceScheduleConfig; urgency: ServiceUrgency; remainingMiles: number; remainingDays: number; nextDue: string }[] => {
      const equipment = [...trucks, ...trailers].find((e) => e.id === assetId);
      if (!equipment?.serviceSchedules) return [];
      const mileage = ("mileage" in equipment ? (equipment as Truck).mileage : (equipment as Trailer).axles > 0 ? 12000 : 0);
      return equipment.serviceSchedules.map((s) => {
        const result = calcServiceUrgency(s, mileage);
        return { ...result, schedule: s, nextDue: result.nextDue };
      });
    },
    [trucks, trailers],
  );

  const getWarrantyCoverage = useCallback(
    (assetId: string, component: string): { covered: boolean; policyNumber?: string; reason?: string } => {
      const equipment = [...trucks, ...trailers].find((e) => e.id === assetId);
      if (!equipment?.warranty) return { covered: false };
      const mileage = ("mileage" in equipment ? (equipment as Truck).mileage : 0);
      return checkWarrantyCoverage(equipment.warranty, component, mileage);
    },
    [trucks, trailers],
  );

  const getMaintenanceLockState = useCallback(
    (assetId: string): MaintenanceLockState => {
      const urgencies = getServiceUrgency(assetId);
      const critical = urgencies.find((u) => u.urgency === "critical_lockout");
      if (critical) {
        return { locked: true, reason: `${critical.schedule.label} expired — mandatory safety clearance required`, triggeringSchedule: critical.schedule.level };
      }
      return { locked: false, reason: "" };
    },
    [getServiceUrgency],
  );

  const maintenanceHealth = useMemo(() => {
    const allEquipment = [...trucks, ...trailers];
    let inShop = 0;
    let serviceDue = 0;
    let outOfService = 0;
    let criticalLockouts = 0;
    const allUrgencies: { assetId: string; assetName: string; assetKind: "truck" | "trailer"; level: PMLevel; label: string; urgency: ServiceUrgency; remainingMiles: number; remainingDays: number }[] = [];

    allEquipment.forEach((eq) => {
      const kind: "truck" | "trailer" = "mileage" in eq ? "truck" : "trailer";
      const urgencies = getServiceUrgency(eq.id);
      urgencies.forEach((u) => {
        if (u.urgency === "critical_lockout") criticalLockouts++;
        if (u.urgency === "overdue") serviceDue++;
        allUrgencies.push({
          assetId: eq.id, assetName: eq.nickname, assetKind: kind,
          level: u.schedule.level, label: u.schedule.label,
          urgency: u.urgency, remainingMiles: u.remainingMiles, remainingDays: u.remainingDays,
        });
      });
      if (eq.roadReadyStatus === "out_of_service") outOfService++;
      if (eq.availability === "in_shop") inShop++;
    });

    serviceDue += allEquipment.filter((e) => e.status === "attention").length;

    return {
      inShop,
      serviceDue: Math.min(serviceDue, allEquipment.length),
      outOfService,
      criticalLockouts,
      totalAssets: allEquipment.length,
      allUrgencies,
    };
  }, [trucks, trailers, getServiceUrgency]);

  const upcomingServices = useMemo(() => {
    return maintenanceHealth.allUrgencies
      .filter((u) => u.urgency !== "current")
      .sort((a, b) => {
        const order: Record<ServiceUrgency, number> = { critical_lockout: 0, overdue: 1, due_soon: 2, current: 3 };
        const ao = order[a.urgency] ?? 9;
        const bo = order[b.urgency] ?? 9;
        if (ao !== bo) return ao - bo;
        return a.remainingDays > 0 ? a.remainingDays - (b.remainingDays > 0 ? b.remainingDays : 999) : -1;
      })
      .slice(0, 10);
  }, [maintenanceHealth]);

  const costPerMileByClass = useMemo(() => {
    const result: { truck: number; trailer: number } = { truck: 0, trailer: 0 };
    const calcForGroup = (items: (Truck | Trailer)[], kind: "truck" | "trailer") => {
      let totalCost = 0;
      let totalMiles = 0;
      items.forEach((eq) => {
        const records = eq.repairRecords ?? [];
        records.forEach((r) => { totalCost += r.totalCost; });
        const m = "mileage" in eq ? (eq as Truck).mileage : 0;
        if (m > 0) totalMiles += m;
      });
      return totalMiles > 0 ? totalCost / totalMiles : 0;
    };
    result.truck = parseFloat(calcForGroup(trucks, "truck").toFixed(3));
    result.trailer = parseFloat(calcForGroup(trailers, "trailer").toFixed(3));
    return result;
  }, [trucks, trailers]);

  // ══════════════════════════════════════════════
  // Fuel Intelligence Engine
  // ══════════════════════════════════════════════

  const fuelSummary = useMemo(() => fuelAnalytics(fuelTransactions), [fuelTransactions]);

  const getFuelTransactions = useCallback(
    (truckId: string): FuelTransaction[] =>
      fuelTransactions.filter((t) => t.assetId === truckId).sort((a, b) => new Date(b.authTimestamp).getTime() - new Date(a.authTimestamp).getTime()),
    [fuelTransactions],
  );

  const getRollingMPG = useCallback(
    (truckId: string) => calcRollingMPG(fuelTransactions, truckId),
    [fuelTransactions],
  );

  const getMPGDegradation = useCallback(
    (truck: Truck, trailerId: string | undefined) => {
      const trailer = trailerId ? trailers.find((t) => t.id === trailerId) : undefined;
      return checkMPGDegradation(truck, trailer, fuelTransactions);
    },
    [fuelTransactions, trailers],
  );

  const getFuelCPM = useCallback(
    (truckId: string) => calcFuelCPM(fuelTransactions, truckId),
    [fuelTransactions],
  );

  const fuelEfficiencyRanking = useMemo(() => {
    return trucks
      .map((truck) => {
        const rolling = calcRollingMPG(fuelTransactions, truck.id);
        const deg = checkMPGDegradation(truck, trailers.find((tr) => tr.assignedTruckId === truck.id), fuelTransactions);
        return {
          truckId: truck.id,
          truckName: truck.nickname,
          make: truck.make,
          model: truck.model,
          subtype: truck.subtype,
          status: truck.status,
          availability: truck.availability,
          currentMpg: rolling.mpg > 0 ? rolling.mpg : truck.avgMpg,
          mpgTrend: rolling.trend,
          fills: rolling.fills,
          degraded: deg.degraded,
          degradationAlert: deg.alert,
          baselineMpg: deg.baselineMpg,
        };
      })
      .sort((a, b) => b.currentMpg - a.currentMpg);
  }, [trucks, trailers, fuelTransactions]);

  const fuelAnomalies = useMemo(
    () => fuelTransactions.filter((t) => t.flagged != null),
    [fuelTransactions],
  );

  // ══════════════════════════════════════════════
  // Fuel Intelligence — CPM Blueprint
  // ══════════════════════════════════════════════

  /** All repair records from trucks + trailers */
  const allRepairRecords = useMemo(() => {
    const records: RepairRecord[] = [];
    trucks.forEach((t) => records.push(...t.repairRecords));
    trailers.forEach((t) => records.push(...t.repairRecords));
    return records;
  }, [trucks, trailers]);

  /** Get CPM breakdown for a single truck over a timeframe */
  const getTruckCPM = useCallback(
    (truckId: string, timeframe: TimeframeKey): CPMBreakdown =>
      calcTruckCPM(truckId, timeframe, fuelTransactions, allRepairRecords),
    [fuelTransactions, allRepairRecords],
  );

  /** Fleet-wide aggregate CPM (computed for 30d by default) */
  const fleetCPM = useMemo(
    () => calcFleetCPM("30d", fuelTransactions, allRepairRecords, trucks),
    [fuelTransactions, allRepairRecords, trucks],
  );

  /** Fleet CPM for a specific timeframe */
  const getFleetCPM = useCallback(
    (timeframe: TimeframeKey) =>
      calcFleetCPM(timeframe, fuelTransactions, allRepairRecords, trucks),
    [fuelTransactions, allRepairRecords, trucks],
  );

  /** Get proportional shares for stacked bar */
  const getCPMShare = useCallback(
    (breakdown: CPMBreakdown) => getCPMProportions(breakdown),
    [],
  );

  // ══════════════════════════════════════════════
  // Orphan Prevention — collision-checked assignment
  // ══════════════════════════════════════════════

  type AssignResult = { ok: true } | { ok: false; error: string };

  const assignTrailerToTruck = useCallback(
    (trailerId: string, truckId: string): AssignResult => {
      const trailer = trailers.find((t) => t.id === trailerId);
      const truck = trucks.find((t) => t.id === truckId);

      if (!trailer) return { ok: false, error: `Trailer ${trailerId} not found.` };
      if (!truck) return { ok: false, error: `Truck ${truckId} not found.` };

      if (trailer.assignedTruckId && trailer.assignedTruckId !== truckId) {
        const currentTruck = trucks.find((t) => t.id === trailer.assignedTruckId);
        const driverName = currentTruck?.nickname ?? "Unknown";
        return {
          ok: false,
          error: `Collision Warning: Trailer ${trailer.nickname} is currently active in-transit with ${driverName}. Complete active trip or execute a Trailer Swap event first.`,
        };
      }

      if (trailer.roadReadyStatus === "out_of_service" || truck.roadReadyStatus === "out_of_service") {
        return { ok: false, error: "Cannot assign: one or both assets are Out of Service (Dead-Red)." };
      }

      setTrailers((prev) =>
        prev.map((t) => (t.id === trailerId ? { ...t, assignedTruckId: truckId, availability: "assigned" as AvailabilityState } : t)),
      );
      setTrucks((prev) =>
        prev.map((t) => (t.id === truckId ? { ...t, assignedTrailerId: trailerId, availability: "assigned" as AvailabilityState } : t)),
      );
      return { ok: true };
    },
    [trucks, trailers],
  );

  const unassignTrailer = useCallback(
    (trailerId: string) => {
      const trailer = trailers.find((t) => t.id === trailerId);
      if (!trailer?.assignedTruckId) return;
      const truckId = trailer.assignedTruckId;
      setTrailers((prev) =>
        prev.map((t) => (t.id === trailerId ? { ...t, assignedTruckId: undefined, availability: "available" as AvailabilityState } : t)),
      );
      setTrucks((prev) =>
        prev.map((t) => (t.id === truckId ? { ...t, assignedTrailerId: undefined } : t)),
      );
    },
    [trailers],
  );

  return {
    trucks,
    trailers,
    inspections,
    incidents,
    incidentSummary,
    setTrucks,
    setTrailers,
    addInspection,
    addIncident,
    updateIncidentStatus,
    getIncident,
    incidentsByEquipment,
    getTruck,
    getTrailer,
    fleetHealth,
    counts,
    allInsights,
    ai: FLEET_AI,
    availabilityCounts,
    expiredInspections,
    assignTrailerToTruck,
    unassignTrailer,
    // Live Sessions
    sessions,
    sessionHistory,
    activeSessions,
    getCurrentOperator,
    createSession,
    modifySessionTrailer,
    terminateSession,
    getSessionHistoryForAsset,
    getOperatorsForAsset,
    // Maintenance Engine
    getRepairRecords,
    getServiceUrgency,
    getWarrantyCoverage,
    getMaintenanceLockState,
    maintenanceHealth,
    upcomingServices,
    costPerMileByClass,
    // Fuel Intelligence Engine
    fuelTransactions,
    fuelSummary,
    getFuelTransactions,
    getRollingMPG,
    getMPGDegradation,
    getFuelCPM,
    fuelEfficiencyRanking,
    fuelAnomalies,
    // CPM Blueprint
    getTruckCPM,
    fleetCPM,
    getFleetCPM,
    getCPMShare,
    // Operations — Couplings, Vault, Triage
    couplings,
    vaultEntries,
    operationalIncidents,
    operationsTicker,
    getCouplingForTruck,
    bobtailCount,
    getInspectionVault,
    triageQueue,
    getAssetIncidentHistory,
  };
});
