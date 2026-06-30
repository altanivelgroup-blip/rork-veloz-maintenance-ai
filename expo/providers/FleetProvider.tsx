import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo, useState } from "react";

import {
  TRUCKS, TRAILERS, INSPECTIONS, FLEET_AI, DRIVERS,
  getInspectionStatus, INSPECTION_EXPIRY_HOURS,
  calcServiceUrgency, checkWarrantyCoverage,
  type Truck, type Trailer, type Inspection, type Driver,
  type AvailabilityState, type RoadReadyStatus,
  type EquipmentSession, type SessionHistoryEntry,
  type SessionModification, type CargoItem,
  type RepairRecord, type RepairLineItem,
  type ServiceScheduleConfig, type ServiceUrgency, type PMLevel,
  type WarrantyProfile, type MaintenanceLockState,
} from "@/constants/mockData";
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
  // Availability Matrix — dispatch-ready summary
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

  // ══════════════════════════════════════════════
  // Inspection expiration sweep — auto-detect expired equipment
  // ══════════════════════════════════════════════

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

  /** Find the active operator for any equipment (truck or trailer) */
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

  /** Conflict check — ensure driver, truck, or trailer doesn't already have an active session */
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

  /** Hook-In — create session when driver completes pre-trip + check-in */
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
      // Inline maintenance lock check (static import, avoids callback ordering)
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
      if (truckLock) {
        return { ok: false, error: `Dispatch Blocked: ${truckLock}` };
      }
      if (params.trailerId) {
        const trailer = trailers.find((t) => t.id === params.trailerId);
        if (trailer?.roadReadyStatus === "out_of_service") {
          return { ok: false, error: "Cannot create session: trailer is Out of Service (Dead-Red)." };
        }
        const trailerLock = checkMaintenanceLock(params.trailerId, "Trailer");
        if (trailerLock) {
          return { ok: false, error: `Dispatch Blocked: ${trailerLock}` };
        }
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
      // Update equipment availability to assigned
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

  /** Swap-Out — atomic trailer swap during active session */
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

      // Release old trailer
      if (session.trailerId) {
        setTrailers((prev) =>
          prev.map((t) => (t.id === session.trailerId ? { ...t, availability: "available" as AvailabilityState, assignedTruckId: undefined } : t)),
        );
      }
      // Assign new trailer
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

  /** Release — terminate session, archive to history, free assets */
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

      // Archive to history
      setSessionHistory((prev) => [historyEntry, ...prev]);

      // Mark session completed
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === sessionId
            ? { ...s, status: "completed", completedAt: now, endOdometer, endLocation, updatedAt: now }
            : s,
        ),
      );

      // Release all assets back to available
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

  /** DOT Compliance — query audit trail for any asset within a date range */
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

  /** Get all operators for a specific asset across all completed sessions (DOT audit) */
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

  /** Get all repair records for a specific truck or trailer */
  const getRepairRecords = useCallback(
    (assetId: string): RepairRecord[] => {
      const equipment = [...trucks, ...trailers].find((e) => e.id === assetId);
      return equipment?.repairRecords ?? [];
    },
    [trucks, trailers],
  );

  /** Calculate all PM service urgencies for a given asset */
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

  /** Check warranty coverage for a component on a given asset */
  const getWarrantyCoverage = useCallback(
    (assetId: string, component: string): { covered: boolean; policyNumber?: string; reason?: string } => {
      const equipment = [...trucks, ...trailers].find((e) => e.id === assetId);
      if (!equipment?.warranty) return { covered: false };
      const mileage = ("mileage" in equipment ? (equipment as Truck).mileage : 0);
      return checkWarrantyCoverage(equipment.warranty, component, mileage);
    },
    [trucks, trailers],
  );

  /** Determine if an asset is under maintenance lockout */
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

  /** Fleet-wide maintenance health analytics */
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

    // Also count assets whose status is "attention" as "service_due"
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

  /** Upcoming services sorted by urgency (most urgent first) */
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

  /** Average maintenance cost per mile per asset class */
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
  // Orphan Prevention — collision-checked assignment
  // ══════════════════════════════════════════════

  type AssignResult = { ok: true } | { ok: false; error: string };

  const assignTrailerToTruck = useCallback(
    (trailerId: string, truckId: string): AssignResult => {
      const trailer = trailers.find((t) => t.id === trailerId);
      const truck = trucks.find((t) => t.id === truckId);

      if (!trailer) return { ok: false, error: `Trailer ${trailerId} not found.` };
      if (!truck) return { ok: false, error: `Truck ${truckId} not found.` };

      // Collision check — trailer already assigned to a different truck?
      if (trailer.assignedTruckId && trailer.assignedTruckId !== truckId) {
        const currentTruck = trucks.find((t) => t.id === trailer.assignedTruckId);
        const driverName = currentTruck?.nickname ?? "Unknown";
        return {
          ok: false,
          error: `Collision Warning: Trailer ${trailer.nickname} is currently active in-transit with ${driverName}. Complete active trip or execute a Trailer Swap event first.`,
        };
      }

      // Out-of-service — hard block
      if (trailer.roadReadyStatus === "out_of_service" || truck.roadReadyStatus === "out_of_service") {
        return { ok: false, error: "Cannot assign: one or both assets are Out of Service (Dead-Red)." };
      }

      // Perform assignment
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
  };
});
