export interface PresetScenario {
  id: string;
  title: string;
  category: string;
  applianceOrPart: string;
  recommendedPolicyId: string;
  symptomDescription: string;
  approxAgeYears: number;
  preExistingSuspected: boolean;
  rustOrCorrosionVisible: boolean;
  maintenanceRecordsAvailable: boolean;
  diyAttempted: boolean;
  waterLeakPresent: boolean;
  tag: 'Likely Covered' | 'Likely Denied' | 'High Risk Trap';
  badgeColor: 'emerald' | 'rose' | 'amber';
  imagePlaceholderSvg: string;
  estimatedFee: number;
  expectedOutcome: string;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'ac-compressor',
    title: 'AC Outdoor Condenser Humming & Blowing Warm Air',
    category: 'HVAC',
    applianceOrPart: 'Lennox 3.5-Ton Central AC Condenser',
    recommendedPolicyId: 'ahs-gold',
    symptomDescription: 'Our central air conditioning system suddenly started blowing warm ambient air yesterday afternoon. The outdoor condenser fan is spinning and making a loud buzzing/humming sound, but the compressor fails to start up. Thermostat set to 68°F.',
    approxAgeYears: 7,
    preExistingSuspected: false,
    rustOrCorrosionVisible: false,
    maintenanceRecordsAvailable: true,
    diyAttempted: false,
    waterLeakPresent: false,
    tag: 'Likely Covered',
    badgeColor: 'emerald',
    estimatedFee: 100,
    expectedOutcome: 'High value claim ($650 - $1,800 replacement/hard start capacitor). Recommend submitting claim immediately with proper phrasing.',
    imagePlaceholderSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><rect x="80" y="50" width="240" height="200" rx="12" fill="%23334155" stroke="%23475569" stroke-width="4"/><circle cx="200" cy="150" r="60" fill="%230f172a" stroke="%2364748b" stroke-width="3"/><path d="M200 90 L200 210 M140 150 L260 150 M157 107 L243 193 M157 193 L243 107" stroke="%2394a3b8" stroke-width="6" stroke-linecap="round"/><rect x="270" y="70" width="35" height="50" rx="4" fill="%23475569"/><text x="200" y="275" font-family="sans-serif" font-size="14" fill="%2394a3b8" text-anchor="middle">Lennox Outdoor Condenser Unit</text></svg>'
  },
  {
    id: 'fridge-ice-leak',
    title: 'Refrigerator Ice Maker Jammed & Dripping Water',
    category: 'Appliances',
    applianceOrPart: 'Whirlpool French-Door Refrigerator Ice Maker',
    recommendedPolicyId: 'ahs-gold',
    symptomDescription: 'The in-door ice maker stopped ejecting ice cubes 2 days ago and has an intermittent clicking sound. Water has begun dripping from the dispenser chute into the vegetable drawer below. No secondary floor damage yet.',
    approxAgeYears: 5,
    preExistingSuspected: false,
    rustOrCorrosionVisible: false,
    maintenanceRecordsAvailable: true,
    diyAttempted: false,
    waterLeakPresent: true,
    tag: 'Likely Covered',
    badgeColor: 'emerald',
    estimatedFee: 100,
    expectedOutcome: 'Covered mechanical ice maker modular assembly ($320 - $480 repair). Critical trap: Do not claim secondary spoiled food or mold to avoid claim audit delays.',
    imagePlaceholderSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230f172a"/><rect x="100" y="30" width="200" height="240" rx="8" fill="%231e293b" stroke="%23475569" stroke-width="3"/><line x1="200" y1="30" x2="200" y2="180" stroke="%2364748b" stroke-width="2"/><rect x="120" y="60" width="50" height="70" rx="4" fill="%23334155" stroke="%230284c7" stroke-width="2"/><circle cx="145" cy="115" r="4" fill="%2338bdf8"/><path d="M145 119 Q145 140 145 145" stroke="%2338bdf8" stroke-width="2" stroke-dasharray="2,2"/><text x="200" y="285" font-family="sans-serif" font-size="13" fill="%2394a3b8" text-anchor="middle">Whirlpool French-Door Ice Dispenser</text></svg>'
  },
  {
    id: 'water-heater-rust',
    title: 'Water Heater Rusting Tank Puddle vs Heating Element',
    category: 'Plumbing',
    applianceOrPart: 'Rheem 50-Gal Gas Water Heater',
    recommendedPolicyId: 'ahs-gold',
    symptomDescription: 'Noticed a slow pool of rust-tinted water accumulating around the base seam of our 12-year-old water heater tank. Burner still lights, but there is visible heavy orange corrosion flaking off the bottom perimeter.',
    approxAgeYears: 12,
    preExistingSuspected: false,
    rustOrCorrosionVisible: true,
    maintenanceRecordsAvailable: false,
    diyAttempted: false,
    waterLeakPresent: true,
    tag: 'High Risk Trap',
    badgeColor: 'rose',
    estimatedFee: 100,
    expectedOutcome: 'High risk of DENIAL under standard Section 7 (Corrosion & Rust Exclusion). Dispatch fee ($100) likely wasted if diagnosed as tank corrosion.',
    imagePlaceholderSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%2318181b"/><rect x="130" y="40" width="140" height="210" rx="20" fill="%2327272a" stroke="%2352525b" stroke-width="3"/><path d="M130 220 Q200 245 270 220 L270 250 L130 250 Z" fill="%239a3412" opacity="0.8"/><ellipse cx="200" cy="265" rx="80" ry="15" fill="%237c2d12" opacity="0.5"/><text x="200" y="290" font-family="sans-serif" font-size="13" fill="%23fb923c" text-anchor="middle">Rheem Tank with Heavy Base Corrosion</text></svg>'
  },
  {
    id: 'vehicle-transmission',
    title: 'Car Transmission Slipping Between 2nd & 3rd Gear',
    category: 'Transmission',
    applianceOrPart: 'Ford F-150 6-Speed Automatic Transmission',
    recommendedPolicyId: 'carshield-diamond',
    symptomDescription: 'When accelerating up a hill, the RPM revs up from 2200 to 3800 RPM before clunking into 3rd gear. Check Engine light illuminated yesterday with code P0730 (Incorrect Gear Ratio). No modifications or towing.',
    approxAgeYears: 6,
    preExistingSuspected: false,
    rustOrCorrosionVisible: false,
    maintenanceRecordsAvailable: true,
    diyAttempted: false,
    waterLeakPresent: false,
    tag: 'Likely Covered',
    badgeColor: 'emerald',
    estimatedFee: 100,
    expectedOutcome: 'Covered under CarShield Diamond ($2,800 - $4,200 transmission repair/replacement). Ensure transmission fluid service receipts are uploaded.',
    imagePlaceholderSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%2309090b"/><path d="M80 180 L140 120 L260 120 L320 180 L300 220 L100 220 Z" fill="%2318181b" stroke="%233f3f46" stroke-width="3"/><circle cx="160" cy="170" r="28" fill="%2327272a" stroke="%23ef4444" stroke-width="3" stroke-dasharray="4,4"/><circle cx="240" cy="170" r="36" fill="%2327272a" stroke="%2371717a" stroke-width="3"/><text x="200" y="270" font-family="sans-serif" font-size="14" fill="%23ef4444" text-anchor="middle">OBD-II Code: P0730 Transmission Slip</text></svg>'
  },
  {
    id: 'dishwasher-drain',
    title: 'Dishwasher E24 Error & Standing Dirty Water',
    category: 'Appliances',
    applianceOrPart: 'Bosch 500 Series Dishwasher',
    recommendedPolicyId: 'ahs-gold',
    symptomDescription: 'The wash cycle stops with 15 minutes remaining, beeping with error code E24 on the display. When opened, 2 inches of soapy water remains in the tub basin. The drain impeller was cleaned by hand but motor makes high-pitched hum.',
    approxAgeYears: 4,
    preExistingSuspected: false,
    rustOrCorrosionVisible: false,
    maintenanceRecordsAvailable: true,
    diyAttempted: true,
    waterLeakPresent: false,
    tag: 'Likely Covered',
    badgeColor: 'emerald',
    estimatedFee: 100,
    expectedOutcome: 'Covered drain pump mechanical motor burnout ($280 - $390). Strategy: Emphasize mechanical motor seizure rather than a foreign debris blockage.',
    imagePlaceholderSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><rect x="110" y="40" width="180" height="220" rx="10" fill="%230f172a" stroke="%23334155" stroke-width="3"/><rect x="130" y="60" width="140" height="30" rx="4" fill="%231e293b"/><text x="200" y="80" font-family="monospace" font-size="14" fill="%23ef4444" text-anchor="middle">ERROR: E24</text><path d="M120 200 Q200 215 280 200 L280 240 L120 240 Z" fill="%230369a1" opacity="0.7"/><text x="200" y="280" font-family="sans-serif" font-size="13" fill="%2394a3b8" text-anchor="middle">Bosch Dishwasher Sump Basin</text></svg>'
  },
  {
    id: 'silver-appliance-trap',
    title: 'Kitchen Oven Not Heating under ShieldSilver Plan',
    category: 'Appliances',
    applianceOrPart: 'GE Profile Convection Range / Oven',
    recommendedPolicyId: 'ahs-silver',
    symptomDescription: 'The bottom baking element no longer glows or heats up. Top stovetop burners work normally. We have the AHS ShieldSilver plan.',
    approxAgeYears: 6,
    preExistingSuspected: false,
    rustOrCorrosionVisible: false,
    maintenanceRecordsAvailable: false,
    diyAttempted: false,
    waterLeakPresent: false,
    tag: 'Likely Denied',
    badgeColor: 'rose',
    estimatedFee: 125,
    expectedOutcome: 'GUARANTEED DENIAL: ShieldSilver plan only covers systems (HVAC/Plumbing/Electrical) and excludes appliances! Saves the user a $125 dispatch fee.',
    imagePlaceholderSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231c1917"/><rect x="110" y="40" width="180" height="220" rx="8" fill="%23292524" stroke="%2344403c" stroke-width="3"/><rect x="130" y="100" width="140" height="120" rx="4" fill="%230c0a09" stroke="%2378716c" stroke-width="2"/><path d="M150 190 Q200 170 250 190" stroke="%2357534e" stroke-width="4" stroke-linecap="round"/><text x="200" y="280" font-family="sans-serif" font-size="13" fill="%23f87171" text-anchor="middle">ShieldSilver Plan Excludes Ovens</text></svg>'
  }
];
