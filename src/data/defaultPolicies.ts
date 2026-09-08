import { WarrantyPolicy } from '../types';

export const DEFAULT_POLICIES: WarrantyPolicy[] = [
  {
    id: 'ahs-gold',
    name: 'American Home Shield - ShieldGold',
    provider: 'American Home Shield (AHS)',
    planTier: 'ShieldGold™',
    type: 'home',
    tradeServiceCallFee: 100,
    annualAggregateCap: 25000,
    perItemLimit: 2000,
    hvacLimit: 5000,
    applianceLimit: 2000,
    plumbingLimit: 1500,
    wearAndTearCovered: true,
    secondaryDamageCovered: false,
    codeViolationCoverageDollar: 0,
    refrigerantCoverage: false,
    coverageItems: [
      { name: 'Heating & Air Conditioning (HVAC)', category: 'HVAC', isCovered: true, limitDollar: 5000, conditions: 'Mechanical failures from normal wear and tear. Up to $5,000 per contract term.' },
      { name: 'Plumbing System & Stoppages', category: 'Plumbing', isCovered: true, limitDollar: 1500, conditions: 'Interior leaks, breaks, valves, and clogs up to 100 ft from access point.' },
      { name: 'Water Heater', category: 'Plumbing', isCovered: true, limitDollar: 1500, conditions: 'Tank and tankless units, heating elements, burner assemblies, thermostats.' },
      { name: 'Electrical System', category: 'Electrical', isCovered: true, limitDollar: 2000, conditions: 'Main panel, subpanels, breakers, interior wiring, switches, outlets.' },
      { name: 'Refrigerator with Ice Maker', category: 'Appliances', isCovered: true, limitDollar: 2000, conditions: 'Compressor, coils, thermostat, defrost timer, ice maker components.' },
      { name: 'Dishwasher', category: 'Appliances', isCovered: true, limitDollar: 2000, conditions: 'Pumps, motors, spray arms, heating elements, control boards.' },
      { name: 'Oven / Range / Cooktop', category: 'Appliances', isCovered: true, limitDollar: 2000, conditions: 'Heating elements, burner valves, igniters, electronic control boards.' },
      { name: 'Built-in Microwave', category: 'Appliances', isCovered: true, limitDollar: 2000, conditions: 'Magnetron, touchpad, transformer, interlock switches.' },
      { name: 'Clothes Washer & Dryer', category: 'Laundry', isCovered: true, limitDollar: 2000, conditions: 'Motors, agitators, drums, heating elements, control panels.' },
      { name: 'Garbage Disposal', category: 'Appliances', isCovered: true, limitDollar: 500, conditions: 'Motor, casing, internal grinding components.' },
      { name: 'Ceiling & Exhaust Fans', category: 'Electrical', isCovered: true, limitDollar: 500, conditions: 'Motors, switches, bearings.' },
      { name: 'Roof Leak Repair', category: 'Structural', isCovered: false, conditions: 'Not included in ShieldGold (Requires ShieldPlatinum upgrade).' },
      { name: 'Code Violations & Permits', category: 'Compliance', isCovered: false, conditions: 'Not covered under ShieldGold.' }
    ],
    commonExclusions: [
      'Secondary or consequential water damage to floors, drywall, or cabinets',
      'Pre-existing known defects prior to the 30-day waiting period',
      'Corrosion, rust, scale build-up, and chemical damage',
      'Cosmetic defects, knobs, handles, door seals, shelves, and interior light bulbs',
      'Commercial grade equipment or non-standard luxury modifications',
      'Improper installation or unpermitted DIY alterations'
    ],
    contractClauses: [
      {
        section: 'Section 2.1 - Covered Breakdowns',
        title: 'Normal Wear and Tear Requirement',
        description: 'Coverage applies exclusively to operational failures resulting from normal wear and tear during regular residential use.'
      },
      {
        section: 'Section 4.3 - Service Trade Call Fee',
        title: 'Mandatory Non-Refundable Dispatch Fee',
        description: 'The homeowner agrees to pay the designated Trade Service Call Fee ($100) per trade category upon technician dispatch, regardless of coverage determination.'
      },
      {
        section: 'Section 6.D - Consequential Damage Exclusion',
        title: 'No Secondary Property Damage Coverage',
        description: 'AHS will repair or replace the failed covered component only. AHS is expressly not liable for water damage, mold remediation, floor warping, or drywall repair resulting from a plumbing or appliance leak.'
      },
      {
        section: 'Section 7.2 - Pre-Existing Conditions',
        title: '30-Day Inception Exclusions',
        description: 'Failures that occurred, showed signs of deterioration, or were documented prior to the effective coverage start date are strictly excluded.'
      },
      {
        section: 'Section 9.1 - Dollar Limits on Mechanical HVAC',
        title: '$5,000 Annual Aggregate Limit for Heating and Cooling',
        description: 'Maximum payout for diagnosis, repair, or replacement of heating and A/C equipment is capped at $5,000 per agreement term.'
      }
    ],
    notes: 'Standard Gold tier coverage with $100 service fee. Strong for mechanical failures, but secondary water damage is strictly excluded.'
  },
  {
    id: 'ahs-platinum',
    name: 'American Home Shield - ShieldPlatinum',
    provider: 'American Home Shield (AHS)',
    planTier: 'ShieldPlatinum™',
    type: 'home',
    tradeServiceCallFee: 100,
    annualAggregateCap: 50000,
    perItemLimit: 4000,
    hvacLimit: 5000,
    applianceLimit: 4000,
    plumbingLimit: 3000,
    wearAndTearCovered: true,
    secondaryDamageCovered: false,
    codeViolationCoverageDollar: 250,
    refrigerantCoverage: true,
    coverageItems: [
      { name: 'Heating & Air Conditioning (HVAC)', category: 'HVAC', isCovered: true, limitDollar: 5000, conditions: 'Unlimited refrigerant recapture & refill included. Free annual A/C tune-up.' },
      { name: 'Plumbing System & Line Stoppages', category: 'Plumbing', isCovered: true, limitDollar: 3000, conditions: 'Includes enhanced pipe restoration limits and faucet/showerhead replacements.' },
      { name: 'Water Heater', category: 'Plumbing', isCovered: true, limitDollar: 2000, conditions: 'Full repair or replacement coverage.' },
      { name: 'Electrical System', category: 'Electrical', isCovered: true, limitDollar: 3000, conditions: 'Main panel, circuits, breakers, wiring, fixtures.' },
      { name: 'Kitchen & Laundry Appliances', category: 'Appliances', isCovered: true, limitDollar: 4000, conditions: 'Higher $4,000 per appliance limit for premium brands (Sub-Zero, Viking, Bosch).' },
      { name: 'Roof Leak Repair', category: 'Structural', isCovered: true, limitDollar: 1000, conditions: 'Up to $1,000 for asphalt shingle or rolled roof leak repairs.' },
      { name: 'Code Violations & Permits', category: 'Compliance', isCovered: true, limitDollar: 250, conditions: 'Up to $250 for necessary municipal permits and code upgrades.' }
    ],
    commonExclusions: [
      'Secondary water damage to subflooring, walls, and personal property',
      'Pre-existing known breakdowns',
      'Acts of God, lightning, flood, or earthquake damage',
      'Routine cosmetic blemishes'
    ],
    contractClauses: [
      {
        section: 'Section 3.1 - Enhanced Appliance Caps',
        title: '$4,000 Appliance Replacement Limit',
        description: 'ShieldPlatinum extends standard appliance limits to $4,000 per covered appliance.'
      },
      {
        section: 'Section 5.2 - Refrigerant Coverage',
        title: '100% Unlimited Refrigerant Inclusion',
        description: 'Covers R-410A / R-22 evacuation and recapture costs without per-pound deductibles.'
      },
      {
        section: 'Section 8.0 - Roof Leak Protection Rider',
        title: 'Roof Patching & Sealing ($1,000 Cap)',
        description: 'Covers roof repairs over occupied living areas up to $1,000 per term.'
      }
    ]
  },
  {
    id: 'ahs-silver',
    name: 'American Home Shield - ShieldSilver',
    provider: 'American Home Shield (AHS)',
    planTier: 'ShieldSilver™',
    type: 'home',
    tradeServiceCallFee: 125,
    annualAggregateCap: 15000,
    perItemLimit: 2000,
    hvacLimit: 5000,
    applianceLimit: 0,
    plumbingLimit: 1500,
    wearAndTearCovered: true,
    secondaryDamageCovered: false,
    codeViolationCoverageDollar: 0,
    refrigerantCoverage: false,
    coverageItems: [
      { name: 'Heating & Air Conditioning (HVAC)', category: 'HVAC', isCovered: true, limitDollar: 5000, conditions: 'Normal wear & tear mechanical failures only.' },
      { name: 'Plumbing System', category: 'Plumbing', isCovered: true, limitDollar: 1500, conditions: 'Interior supply and drain lines.' },
      { name: 'Water Heater', category: 'Plumbing', isCovered: true, limitDollar: 1500, conditions: 'Electric and gas tanks.' },
      { name: 'Electrical System', category: 'Electrical', isCovered: true, limitDollar: 2000, conditions: 'Panels, breakers, switches.' },
      { name: 'Kitchen & Laundry Appliances', category: 'Appliances', isCovered: false, conditions: 'NOT COVERED under ShieldSilver plan.' }
    ],
    commonExclusions: [
      'All major kitchen appliances (Refrigerator, Dishwasher, Oven, Microwave)',
      'All laundry appliances (Washer, Dryer)',
      'Secondary water damage',
      'Roof leaks and code violations'
    ],
    contractClauses: [
      {
        section: 'Section 1.1 - Scope of Silver Systems Coverage',
        title: 'Built-in Structural Systems Only',
        description: 'ShieldSilver covers core home infrastructure (HVAC, plumbing, electrical) but completely excludes portable and built-in kitchen/laundry appliances.'
      }
    ]
  },
  {
    id: 'carshield-diamond',
    name: 'CarShield - Diamond Powertrain & Comprehensive',
    provider: 'CarShield / American Auto Shield',
    planTier: 'Diamond Plan',
    type: 'vehicle',
    tradeServiceCallFee: 100,
    annualAggregateCap: 10000,
    perItemLimit: 5000,
    wearAndTearCovered: true,
    secondaryDamageCovered: false,
    codeViolationCoverageDollar: 0,
    refrigerantCoverage: true,
    coverageItems: [
      { name: 'Engine Assembly & Internal Components', category: 'Engine', isCovered: true, limitDollar: 5000, conditions: 'Cylinder block, pistons, crankshaft, camshaft, oil pump, valves, timing chain.' },
      { name: 'Transmission (Automatic & Manual)', category: 'Transmission', isCovered: true, limitDollar: 5000, conditions: 'Case, torque converter, valve body, clutch packs, shift solenoids.' },
      { name: 'Drive Axle & Transfer Case', category: 'Drivetrain', isCovered: true, limitDollar: 3500, conditions: 'Differential gears, CV joints, drive shafts, U-joints.' },
      { name: 'Air Conditioning & Heating', category: 'HVAC', isCovered: true, limitDollar: 2500, conditions: 'Compressor, condenser, evaporator core, blower motor, accumulator.' },
      { name: 'Electrical Systems', category: 'Electrical', isCovered: true, limitDollar: 2500, conditions: 'Alternator, starter motor, wiper motors, power window actuators.' },
      { name: 'Brake System Components', category: 'Brakes', isCovered: true, limitDollar: 1500, conditions: 'Master cylinder, ABS module, calipers. Excludes brake pads and rotors.' },
      { name: 'Brake Pads, Rotors & Shoes', category: 'Wear Items', isCovered: false, conditions: 'Normal friction wear items are strictly excluded.' },
      { name: 'Clutch Disc & Flywheel (Manual)', category: 'Wear Items', isCovered: false, conditions: 'Friction wear parts excluded.' },
      { name: 'Tires & Alignment', category: 'Tires', isCovered: false, conditions: 'Routine maintenance and wear items excluded.' }
    ],
    commonExclusions: [
      'Normal maintenance (oil changes, spark plugs, filters, brake pads, wiper blades)',
      'Pre-existing mechanical failures or overheating damage caused by continued operation',
      'Aftermarket performance modifications, non-OEM turbo/tunes, or lift kits exceeding 3 inches',
      'Fluid leaks where mechanical breakdown of the sealing component has not occurred',
      'Rust, salt corrosion, weather exposure, collision or road hazard damage'
    ],
    contractClauses: [
      {
        section: 'Section B - Covered Components',
        title: 'Breakdown of Internally Lubricated Parts',
        description: 'Covers sudden and accidental mechanical failure of listed internal lubricated components during standard vehicle operation.'
      },
      {
        section: 'Section D.1 - Overheating & Negligence Exclusion',
        title: 'Failure to Stop Operating Vehicle',
        description: 'Claims will be denied if damage is caused by continuing to drive the vehicle after the temperature gauge rises, warning light illuminates, or oil pressure drops.'
      },
      {
        section: 'Section F.4 - Maintenance Log Requirement',
        title: 'Proof of Oil Changes & Manufacturer Service',
        description: 'Customer must provide receipts demonstrating timely oil and filter changes within manufacturer specified mileage intervals.'
      }
    ],
    notes: 'Comprehensive vehicle service contract with $100 deductible. Strict on maintenance records and driving with overheating.'
  },
  {
    id: 'first-american-eagle',
    name: 'First American Home Warranty - Eagle Premier',
    provider: 'First American Home Warranty',
    planTier: 'Eagle Premier™',
    type: 'home',
    tradeServiceCallFee: 85,
    annualAggregateCap: 30000,
    perItemLimit: 3500,
    hvacLimit: 4000,
    applianceLimit: 3500,
    plumbingLimit: 2000,
    wearAndTearCovered: true,
    secondaryDamageCovered: false,
    codeViolationCoverageDollar: 500,
    refrigerantCoverage: true,
    coverageItems: [
      { name: 'Heating & Air Conditioning', category: 'HVAC', isCovered: true, limitDollar: 4000, conditions: 'Complete system mechanical repairs.' },
      { name: 'Kitchen Appliances', category: 'Appliances', isCovered: true, limitDollar: 3500, conditions: 'Includes refrigerator with ice maker, cooktop, dishwasher, oven, trash compactor.' },
      { name: 'Washer & Dryer', category: 'Laundry', isCovered: true, limitDollar: 3500, conditions: 'Full repair and replacement.' },
      { name: 'Plumbing & Water Heater', category: 'Plumbing', isCovered: true, limitDollar: 2000, conditions: 'Includes water heater expansion tanks and pressure regulators.' },
      { name: 'Garage Door Openers', category: 'Mechanical', isCovered: true, limitDollar: 1000, conditions: 'Motor, drive chain/screw, sensors.' }
    ],
    commonExclusions: [
      'Secondary water or mold damage to home structures',
      'Pre-existing conditions documented in home inspection',
      'Corrosion and rust',
      'Solar heating systems'
    ],
    contractClauses: [
      {
        section: 'Section 3.4 - First American First-Call Guarantee',
        title: '$85 Service Call Fee',
        description: 'Flat $85 fee per service trade. 30-day recall guarantee on workmanship.'
      }
    ]
  }
];
