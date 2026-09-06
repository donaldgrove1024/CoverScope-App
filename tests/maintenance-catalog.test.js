import {
  SCENARIO_COUNT,
  buildMaintenanceScenarios,
} from "./maintenanceScenarios.js";

describe("maintenance scenario catalog", () => {
  test("builds 1,000 unique CoverScope maintenance scenarios", () => {
    const scenarios = buildMaintenanceScenarios(SCENARIO_COUNT);
    expect(scenarios).toHaveLength(SCENARIO_COUNT);

    const ids = new Set(scenarios.map((scenario) => scenario.scenarioId));
    expect(ids.size).toBe(SCENARIO_COUNT);
    expect(scenarios[0]).toMatchObject({
      scenarioId: 1,
      vehicleType: "sedan",
      maintenanceType: "oil_change",
    });
    expect(scenarios[999].scenarioId).toBe(1000);
  });
});
