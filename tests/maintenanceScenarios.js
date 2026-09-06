export const SCENARIO_COUNT = 1000;

export const VEHICLE_TYPES = ["sedan", "suv", "truck", "van", "motorcycle"];

export const MAINTENANCE_TYPES = [
  "oil_change",
  "brake_service",
  "tire_rotation",
  "battery_check",
  "air_filter",
  "coolant_flush",
  "transmission_service",
  "alignment",
  "spark_plugs",
  "inspection",
];

export const STATUSES = ["scheduled", "in_progress", "completed", "cancelled"];

export const PRIORITIES = ["low", "medium", "high"];

export function buildMaintenanceScenarios(count = SCENARIO_COUNT) {
  return Array.from({ length: count }, (_, index) => {
    const scenarioId = index + 1;
    return {
      scenarioId,
      vehicleType: VEHICLE_TYPES[index % VEHICLE_TYPES.length],
      maintenanceType: MAINTENANCE_TYPES[index % MAINTENANCE_TYPES.length],
      status: STATUSES[index % STATUSES.length],
      priority: PRIORITIES[index % PRIORITIES.length],
      intervalMiles: 3000 + (index % 24) * 1000,
      estimatedCost: 40 + (index % 60) * 15,
      notes: `CoverScope maintenance scenario ${scenarioId}`,
    };
  });
}
