import { VerdictStatus } from '../src/types';

export const SCENARIO_COUNT = 1000;

export interface MaintenanceScenario {
  scenarioId: number;
  category: string;
  applianceOrPart: string;
  symptomDescription: string;
  rustOrCorrosionVisible: boolean;
  preExistingSuspected: boolean;
  diyAttempted: boolean;
  waterLeakPresent: boolean;
  maintenanceRecordsAvailable: boolean;
  policyId: string;
}

const FIXTURES: Array<
  Pick<MaintenanceScenario, 'category' | 'applianceOrPart' | 'symptomDescription' | 'policyId'>
> = [
  {
    category: 'HVAC',
    applianceOrPart: 'Lennox 3.5-Ton Central AC Condenser',
    symptomDescription: 'Outdoor condenser humming and blowing warm air. Compressor will not start.',
    policyId: 'ahs-gold',
  },
  {
    category: 'Appliances',
    applianceOrPart: 'Whirlpool French-Door Refrigerator Ice Maker',
    symptomDescription: 'Ice maker clicking and dripping water into the vegetable drawer.',
    policyId: 'ahs-gold',
  },
  {
    category: 'Plumbing',
    applianceOrPart: 'Rheem 50-Gal Gas Water Heater',
    symptomDescription: 'No hot water. Pilot lights but burner assembly is not staying lit.',
    policyId: 'ahs-gold',
  },
  {
    category: 'Appliances',
    applianceOrPart: 'Bosch 500 Series Dishwasher',
    symptomDescription: 'E24 error with standing dirty water in the tub after the drain cycle.',
    policyId: 'ahs-gold',
  },
  {
    category: 'Appliances',
    applianceOrPart: 'GE Profile Convection Range Oven',
    symptomDescription: 'Bottom baking element no longer glows or heats. Cooktop burners still work.',
    policyId: 'ahs-silver',
  },
  {
    category: 'Transmission',
    applianceOrPart: 'Ford F-150 6-Speed Automatic Transmission',
    symptomDescription: 'Transmission slipping between 2nd and 3rd gear with OBD-II code P0730.',
    policyId: 'carshield-diamond',
  },
  {
    category: 'Laundry',
    applianceOrPart: 'Maytag Clothes Dryer Heating Element',
    symptomDescription: 'Dryer tumbles but no heat after a sudden stoppage during a normal cycle.',
    policyId: 'ahs-gold',
  },
  {
    category: 'Electrical',
    applianceOrPart: 'Main Electrical Panel Breaker',
    symptomDescription: 'A 20-amp branch breaker trips immediately under normal residential load.',
    policyId: 'ahs-gold',
  },
  {
    category: 'Structural',
    applianceOrPart: 'Roof Shingles Leak Repair',
    symptomDescription: 'Active roof leak over the living room after normal wear of asphalt shingles.',
    policyId: 'ahs-gold',
  },
  {
    category: 'Structural',
    applianceOrPart: 'Roof Shingles Leak Repair',
    symptomDescription: 'Active roof leak over occupied living space. Platinum roof rider may apply.',
    policyId: 'ahs-platinum',
  },
];

const COVERED_CATEGORIES: Record<string, readonly string[]> = {
  'ahs-gold': ['HVAC', 'Plumbing', 'Appliances', 'Electrical', 'Laundry'],
  'ahs-platinum': ['HVAC', 'Plumbing', 'Appliances', 'Electrical', 'Laundry', 'Structural'],
  'ahs-silver': ['HVAC', 'Plumbing', 'Electrical'],
  'carshield-diamond': ['Transmission', 'Engine', 'HVAC', 'Electrical', 'Brakes'],
  'first-american-eagle': ['HVAC', 'Plumbing', 'Appliances', 'Electrical', 'Laundry'],
};

export function expectedCoverageStatus(scenario: MaintenanceScenario): VerdictStatus {
  const coveredCategories = COVERED_CATEGORIES[scenario.policyId] || [];
  if (!coveredCategories.includes(scenario.category)) {
    return 'LIKELY_DENIED';
  }
  if (scenario.rustOrCorrosionVisible) {
    return 'LIKELY_DENIED';
  }
  if (scenario.preExistingSuspected) {
    return 'LIKELY_DENIED';
  }
  if (!scenario.maintenanceRecordsAvailable) {
    return 'AMBIGUOUS';
  }
  if (scenario.diyAttempted) {
    return 'AMBIGUOUS';
  }
  return 'LIKELY_COVERED';
}

export function buildMaintenanceScenarios(count = SCENARIO_COUNT): MaintenanceScenario[] {
  return Array.from({ length: count }, (_, index) => {
    const fixture = FIXTURES[index % FIXTURES.length];
    return {
      scenarioId: index + 1,
      category: fixture.category,
      applianceOrPart: fixture.applianceOrPart,
      symptomDescription: `${fixture.symptomDescription} Scenario ${index + 1}.`,
      rustOrCorrosionVisible: index % 7 === 0,
      preExistingSuspected: index % 11 === 0,
      diyAttempted: index % 13 === 0,
      waterLeakPresent: index % 5 === 0,
      maintenanceRecordsAvailable: index % 3 !== 0,
      policyId: fixture.policyId,
    };
  });
}
