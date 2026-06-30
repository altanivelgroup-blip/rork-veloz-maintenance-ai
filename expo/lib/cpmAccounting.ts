import type { FuelTransaction, RepairRecord, Truck, Trailer } from "@/constants/mockData";

// ══════════════════════════════════════════════
// Complete Operating CPM Blueprint
// ══════════════════════════════════════════════

export type TimeframeKey = "7d" | "30d" | "90d";

export const timeframeDays: Record<TimeframeKey, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const timeframeLabels: Record<TimeframeKey, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
};

export type CPMBreakdown = {
  fuelCpm: number;
  driverPayCpm: number;
  maintenanceCpm: number;
  operatingCpm: number;
  totalFuelSpend: number;
  totalDriverPay: number;
  totalMaintenanceCost: number;
  totalMilesDriven: number;
  timeframe: TimeframeKey;
};

type DriverPayEstimate = {
  truckId: string;
  driverPayPerMile: number;
};

/** Estimated driver pay rates (dollars per mile) — configurable */
const DRIVER_PAY_RATES: DriverPayEstimate[] = [
  { truckId: "t1", driverPayPerMile: 0.65 },
  { truckId: "t2", driverPayPerMile: 0.68 },
  { truckId: "t3", driverPayPerMile: 0.62 },
  { truckId: "t4", driverPayPerMile: 0.72 },
  { truckId: "t5", driverPayPerMile: 0.64 },
];

/**
 * Calculate the complete Operating CPM for a single truck.
 *
 * Operating CPM = Fuel CPM + Driver Pay CPM + Maintenance CPM
 *
 * @param truckId - The truck to compute CPM for
 * @param timeframe - 7d | 30d | 90d
 * @param transactions - All fuel transactions
 * @param repairRecords - All repair records
 * @param mileageAtStart - Starting odometer for the timeframe (or use transactions)
 */
export function calcTruckCPM(
  truckId: string,
  timeframe: TimeframeKey,
  transactions: FuelTransaction[],
  repairRecords: RepairRecord[],
  mileageAtStart?: number,
): CPMBreakdown {
  const now = Date.now();
  const cutoffMs = now - timeframeDays[timeframe] * 24 * 60 * 60 * 1000;
  const cutoffISO = new Date(cutoffMs).toISOString();

  // ── Fuel CPM ──
  const truckFills = transactions
    .filter((t) => t.assetId === truckId && t.fuelType === "diesel" && t.authTimestamp >= cutoffISO)
    .sort((a, b) => new Date(a.authTimestamp).getTime() - new Date(b.authTimestamp).getTime());

  let totalFuelSpend = 0;
  let fuelMiles = 0;

  for (let i = 1; i < truckFills.length; i++) {
    totalFuelSpend += truckFills[i].totalAmount;
    const miles = truckFills[i].odometerAtFill - truckFills[i - 1].odometerAtFill;
    if (miles > 0 && miles < 5000) fuelMiles += miles;
  }

  // Use the greater of fill-derived miles or the odometer delta
  let totalMilesDriven = fuelMiles;
  if (truckFills.length >= 2 && mileageAtStart != null) {
    const lastOdo = truckFills[truckFills.length - 1].odometerAtFill;
    const odoDelta = lastOdo - mileageAtStart;
    if (odoDelta > 0) totalMilesDriven = Math.max(totalMilesDriven, odoDelta);
  }

  const fuelCpm = totalMilesDriven > 0 ? Math.round((totalFuelSpend / totalMilesDriven) * 1000) / 1000 : 0;

  // ── Driver Pay CPM ──
  const payRate = DRIVER_PAY_RATES.find((r) => r.truckId === truckId)?.driverPayPerMile ?? 0.65;
  const totalDriverPay = Math.round(totalMilesDriven * payRate * 100) / 100;
  const driverPayCpm = totalMilesDriven > 0 ? Math.round(payRate * 1000) / 1000 : 0;

  // ── Maintenance CPM ──
  const truckRepairs = repairRecords.filter(
    (r) => r.assetId === truckId && r.completionDate >= cutoffISO,
  );
  const totalMaintenanceCost = truckRepairs.reduce((sum, r) => sum + r.totalCost, 0);
  const maintenanceCpm = totalMilesDriven > 0
    ? Math.round((totalMaintenanceCost / totalMilesDriven) * 1000) / 1000
    : 0;

  const operatingCpm = Math.round((fuelCpm + driverPayCpm + maintenanceCpm) * 1000) / 1000;

  return {
    fuelCpm,
    driverPayCpm,
    maintenanceCpm,
    operatingCpm,
    totalFuelSpend: Math.round(totalFuelSpend * 100) / 100,
    totalDriverPay,
    totalMaintenanceCost: Math.round(totalMaintenanceCost * 100) / 100,
    totalMilesDriven,
    timeframe,
  };
}

/**
 * Calculate fleet-wide aggregate CPM across all trucks.
 */
export function calcFleetCPM(
  timeframe: TimeframeKey,
  transactions: FuelTransaction[],
  repairRecords: RepairRecord[],
  trucks: Truck[],
): CPMBreakdown & { perTruck: CPMBreakdown[] } {
  const perTruck = trucks.map((t) =>
    calcTruckCPM(t.id, timeframe, transactions, repairRecords, undefined),
  );

  const totalFuelSpend = perTruck.reduce((s, c) => s + c.totalFuelSpend, 0);
  const totalDriverPay = perTruck.reduce((s, c) => s + c.totalDriverPay, 0);
  const totalMaintenanceCost = perTruck.reduce((s, c) => s + c.totalMaintenanceCost, 0);
  const totalMilesDriven = perTruck.reduce((s, c) => s + c.totalMilesDriven, 0);

  const fuelCpm = totalMilesDriven > 0 ? Math.round((totalFuelSpend / totalMilesDriven) * 1000) / 1000 : 0;
  const driverPayCpm = totalMilesDriven > 0 ? Math.round((totalDriverPay / totalMilesDriven) * 1000) / 1000 : 0;
  const maintenanceCpm = totalMilesDriven > 0 ? Math.round((totalMaintenanceCost / totalMilesDriven) * 1000) / 1000 : 0;
  const operatingCpm = Math.round((fuelCpm + driverPayCpm + maintenanceCpm) * 1000) / 1000;

  return {
    fuelCpm,
    driverPayCpm,
    maintenanceCpm,
    operatingCpm,
    totalFuelSpend: Math.round(totalFuelSpend * 100) / 100,
    totalDriverPay: Math.round(totalDriverPay * 100) / 100,
    totalMaintenanceCost: Math.round(totalMaintenanceCost * 100) / 100,
    totalMilesDriven,
    timeframe,
    perTruck,
  };
}

/**
 * Get the proportional share percentages for the stacked bar visualization.
 */
export function getCPMProportions(breakdown: CPMBreakdown): {
  fuelPct: number;
  driverPayPct: number;
  maintenancePct: number;
} {
  const total = breakdown.operatingCpm;
  if (total <= 0) return { fuelPct: 33, driverPayPct: 34, maintenancePct: 33 };
  return {
    fuelPct: Math.round((breakdown.fuelCpm / total) * 100),
    driverPayPct: Math.round((breakdown.driverPayCpm / total) * 100),
    maintenancePct: Math.round((breakdown.maintenanceCpm / total) * 100),
  };
}

/**
 * Predict annualized operating cost per truck given current CPM.
 */
export function annualizeCPM(breakdown: CPMBreakdown, estimatedAnnualMiles: number = 80000): {
  annualFuelCost: number;
  annualDriverPay: number;
  annualMaintenanceCost: number;
  annualTotal: number;
} {
  return {
    annualFuelCost: Math.round(breakdown.fuelCpm * estimatedAnnualMiles * 100) / 100,
    annualDriverPay: Math.round(breakdown.driverPayCpm * estimatedAnnualMiles * 100) / 100,
    annualMaintenanceCost: Math.round(breakdown.maintenanceCpm * estimatedAnnualMiles * 100) / 100,
    annualTotal: Math.round(breakdown.operatingCpm * estimatedAnnualMiles * 100) / 100,
  };
}
