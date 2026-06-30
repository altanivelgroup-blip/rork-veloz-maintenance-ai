/**
 * Shipment & cargo display utilities for the Veloz Fleet app.
 *
 * These are kept in a single module so every screen that displays
 * shipment / load / cargo data uses the same presentation layer.
 * Only add functions here when they are used by more than one file.
 */

/** "Load L-1042" */
export function formatLoadNumber(n: string): string {
  return `Load ${n}`;
}

/** "2021 Ford Mustang · VIN: 1FA..." */
export function formatCargoLine(year: number, make: string, model: string, vin?: string): string {
  let s = `${year} ${make} ${model}`;
  if (vin) s += ` · VIN: ${vin}`;
  return s;
}

/** "5 vehicles" / "1 vehicle" */
export function formatCargoCount(n: number): string {
  return `${n} vehicle${n !== 1 ? "s" : ""}`;
}

/** "Pickup: Atlanta, GA" */
export function formatLocation(label: string, location: string): string {
  return `${label}: ${location}`;
}
