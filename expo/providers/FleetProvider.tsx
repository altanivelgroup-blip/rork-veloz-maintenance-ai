import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo, useState } from "react";
import { TRUCKS, TRAILERS, INSPECTIONS, FLEET_AI, type Truck, type Trailer, type Inspection } from "@/constants/mockData";
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
    getTruck,
    getTrailer,
    fleetHealth,
    counts,
    allInsights,
    ai: FLEET_AI,
  };
});
