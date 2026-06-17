import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo, useState } from "react";
import { TRUCKS, TRAILERS, INSPECTIONS, FLEET_AI, type Truck, type Trailer, type Inspection } from "@/constants/mockData";

export const [FleetProvider, useFleet] = createContextHook(() => {
  const [trucks, setTrucks] = useState<Truck[]>(TRUCKS);
  const [trailers, setTrailers] = useState<Trailer[]>(TRAILERS);
  const [inspections, setInspections] = useState<Inspection[]>(INSPECTIONS);

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

  return {
    trucks,
    trailers,
    inspections,
    setTrucks,
    setTrailers,
    addInspection,
    getTruck,
    getTrailer,
    fleetHealth,
    counts,
    allInsights,
    ai: FLEET_AI,
  };
});
