import { TriageVerdict, WarrantyPolicy } from '../types';

export function generateClientSideTriageVerdict(params: {
  policy: WarrantyPolicy;
  symptomDescription: string;
  category?: string;
  applianceOrPart?: string;
  make?: string;
  model?: string;
  manufacturerYear?: string;
  approxAgeYears?: number | string;
  preExistingSuspected?: boolean;
  rustOrCorrosionVisible?: boolean;
  waterLeakPresent?: boolean;
  diyAttempted?: boolean;
  clarifyingAnswers?: Record<string, string>;
  imagePreviewUrl?: string | null;
}): TriageVerdict {
  const {
    policy,
    symptomDescription = '',
    category = 'General',
    applianceOrPart = 'Appliance',
    make = '',
    model = '',
    preExistingSuspected = false,
    rustOrCorrosionVisible = false,
    waterLeakPresent = false,
    diyAttempted = false,
    imagePreviewUrl,
  } = params;

  const tradeFee = Number(policy.tradeServiceCallFee) || 100;
  const policyName = policy.name || 'Home Warranty Plan';
  const descLower = (symptomDescription + ' ' + applianceOrPart + ' ' + category).toLowerCase();

  const isHVAC =
    descLower.includes('ac') ||
    descLower.includes('air') ||
    descLower.includes('cooling') ||
    descLower.includes('furnace') ||
    descLower.includes('hvac') ||
    descLower.includes('heat');
  const isWaterHeater =
    descLower.includes('water heater') ||
    descLower.includes('hot water') ||
    descLower.includes('tank') ||
    descLower.includes('t&p') ||
    descLower.includes('pilot');
  const isFridge = descLower.includes('fridge') || descLower.includes('refrigerator') || descLower.includes('freezer');
  const isDishwasher = descLower.includes('dishwasher') || descLower.includes('dish washer');
  const isWasherDryer = descLower.includes('washer') || descLower.includes('dryer') || descLower.includes('laundry');
  const isPlumbing =
    !isWaterHeater &&
    (descLower.includes('plumb') ||
      descLower.includes('leak') ||
      descLower.includes('drain') ||
      descLower.includes('disposal') ||
      descLower.includes('toilet') ||
      descLower.includes('pipe'));

  let detectedName = applianceOrPart || 'Major Residential System';
  if (isHVAC) detectedName = 'Central HVAC / Air Conditioner';
  else if (isWaterHeater) detectedName = 'Residential Water Heater';
  else if (isFridge) detectedName = 'Kitchen Refrigerator';
  else if (isDishwasher) detectedName = 'Built-in Dishwasher';
  else if (isWasherDryer) detectedName = 'Washer / Dryer';
  else if (isPlumbing) detectedName = 'Plumbing System';

  let status: 'LIKELY_COVERED' | 'LIKELY_DENIED' | 'AMBIGUOUS' = 'LIKELY_COVERED';
  let confidenceScore = 88;
  let failureMode = 'Standard Mechanical Wear & Tear';
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let repMin = 350;
  let repMax = 850;
  let replaceCost = 2200;

  if (isHVAC) {
    repMin = 450;
    repMax = 1800;
    replaceCost = 6500;
    severity = 'high';
    failureMode =
      descLower.includes('fan') || descLower.includes('hum')
        ? 'Capacitor / Contactor Electrical Failure'
        : 'Refrigerant Coil or Compressor Failure';
  } else if (isWaterHeater) {
    repMin = 300;
    repMax = 950;
    replaceCost = 1800;
    failureMode =
      descLower.includes('bottom') || descLower.includes('rupture')
        ? 'Internal Tank Seam Mechanical Breakdown'
        : 'Heating Element or T&P Valve Malfunction';
  } else if (isFridge) {
    repMin = 280;
    repMax = 650;
    replaceCost = 1600;
    failureMode = 'Defrost Thermostat / Compressor Relay Malfunction';
  } else if (isDishwasher) {
    repMin = 220;
    repMax = 500;
    replaceCost = 900;
    failureMode = 'Drain Pump Impeller / Solenoid Valve Failure';
  }

  // Exclusion Triggers
  if (rustOrCorrosionVisible) {
    status = 'LIKELY_DENIED';
    confidenceScore = 92;
  } else if (preExistingSuspected) {
    status = 'LIKELY_DENIED';
    confidenceScore = 85;
  } else if (diyAttempted) {
    status = 'AMBIGUOUS';
    confidenceScore = 72;
  }

  const headline =
    status === 'LIKELY_COVERED'
      ? `LIKELY COVERED: Mechanical failure on ${detectedName} is eligible under ${policyName}.`
      : status === 'LIKELY_DENIED'
      ? `LIKELY DENIED: High risk of denial under ${policyName} contract exclusions. Avoid paying non-refundable $${tradeFee} fee.`
      : `AMBIGUOUS: Coverage for ${detectedName} requires sub-component diagnostic verification.`;

  const conversationalAdvisorResponse =
    status === 'LIKELY_COVERED'
      ? `Based on your ${policyName} contract, ${detectedName} repairs are covered when failure occurs due to normal mechanical wear and tear. Your $${tradeFee} trade service fee will apply, providing substantial savings against estimated $${repMin}-$${repMax} out-of-pocket costs.`
      : status === 'LIKELY_DENIED'
      ? `Based on your ${policyName} contract, this reported breakdown carries a high risk of denial under standard exclusions (such as surface corrosion, pre-existing clauses, or secondary damage). Requesting a dispatch risks forfeiting your $${tradeFee} non-refundable trade call fee.`
      : `Based on your ${policyName} contract, coverage depends on whether the technician classifies the failure as primary mechanical wear rather than an excluded auxiliary or cosmetic part.`;

  const followUpPrompt =
    status === 'LIKELY_COVERED'
      ? 'Would you like me to submit your service request claim?'
      : 'Would you like me to recommend an approved paid vendor to repair this directly?';

  const clarifyingQuestions = [
    {
      id: 'clarify-1',
      question: `What is the approximate brand or manufacturer of your ${detectedName}?`,
      category: 'MAKE_MODEL' as const,
      quickOptions: ['Whirlpool / Maytag', 'GE / Cafe', 'Carrier / Trane', 'Rheem / Bradford White', 'Samsung / LG'],
      whyItMatters: 'Helps verify OEM parts availability and whether specific brand caps or factory warranty overlaps apply.',
    },
    {
      id: 'clarify-2',
      question: 'Did the failure happen abruptly during normal operation, or has it been degrading over time?',
      category: 'GENERAL' as const,
      quickOptions: ['Abrupt failure during normal use', 'Started making sounds 2 weeks ago', 'Intermittent for several months'],
      whyItMatters: 'Stating an issue has been present for months can trigger the pre-existing condition or neglect auto-denial trap.',
    },
    {
      id: 'clarify-3',
      question: 'Is there any visible rust, chemical corrosion, or water damage to adjacent cabinets/flooring?',
      category: 'SYMPTOM_LOCATION' as const,
      quickOptions: ['No rust, perfectly clean unit', 'Slight surface discoloration', 'Active water damage to flooring'],
      whyItMatters: 'Home warranties strictly exclude secondary consequential damage and frequently deny claims citing rust or corrosion.',
    },
  ];

  const executiveSummary =
    status === 'LIKELY_COVERED'
      ? `Your evaluation indicates that the reported malfunction on your ${detectedName} is classified as a covered mechanical breakdown under ${policyName}. The contract covers primary functional components up to your plan limit ($${policy.applianceLimit || policy.perItemLimit || 2000}). By filing a claim and paying the $${tradeFee} trade call fee, you can expect the warranty carrier to cover the balance of the estimated $${repMin}-$${repMax} repair.`
      : `Your reported symptoms for ${detectedName} have a high probability of being rejected under standard warranty terms. Common denial reasons include external corrosion, prior lack of routine maintenance, or secondary water damage. We recommend obtaining a direct diagnostic from a local licensed technician or utilizing our approved pro network before risking your $${tradeFee} dispatch fee.`;

  const financialAnalysis = {
    tradeCallFee: tradeFee,
    estimatedRepairCostMin: repMin,
    estimatedRepairCostMax: repMax,
    estimatedReplacementCost: replaceCost,
    netBenefitMin: Math.max(0, repMin - tradeFee),
    netBenefitMax: Math.max(0, repMax - tradeFee),
    recommendation: (status === 'LIKELY_COVERED' ? 'SUBMIT_CLAIM' : 'PAY_OUT_OF_POCKET_OR_DIY') as any,
    recommendationReason:
      status === 'LIKELY_COVERED'
        ? `Filing a claim saves an estimated $${repMin - tradeFee} to $${repMax - tradeFee} after the $${tradeFee} trade call fee.`
        : `Paying the $${tradeFee} non-refundable dispatch fee carries a high risk of total loss due to contract exclusions. Direct local repair is more cost-effective.`,
  };

  const citedPolicyClauses = [
    {
      section: 'Section 3.1',
      clauseTitle: 'Mechanical Breakdown & Normal Wear and Tear',
      textExcerpt: 'Coverage covers mechanical components that fail during normal, proper residential operation during the contract term.',
      status: (status === 'LIKELY_COVERED' ? 'INCLUDED' : 'CONDITIONAL') as any,
      impactExplanation: 'Provides the foundational basis for replacement or repair of failed internal components.',
    },
    {
      section: 'Section 8.2',
      clauseTitle: 'Secondary Consequential Damage Exclusion',
      textExcerpt: 'Carrier is not liable for secondary damages to flooring, walls, ceilings, or contents caused by water leaks or mechanical failure.',
      status: 'EXCLUDED' as any,
      impactExplanation: 'Do not request the warranty carrier to remediate drywall or floor damage; report only the primary mechanical failure.',
    },
    {
      section: 'Section 9.4',
      clauseTitle: 'Rust, Corrosion & Pre-Existing Exclusions',
      textExcerpt: 'Items showing evidence of excessive rust, chemical corrosion, sediment accumulation, or pre-existing defects are excluded from coverage.',
      status: (rustOrCorrosionVisible ? 'EXCLUDED' : 'INCLUDED') as any,
      impactExplanation: 'Ensure unit is clean of external debris or superficial rust before technician inspection.',
    },
  ];

  const denialTraps = [
    {
      trapName: 'Pre-Existing Condition Trap',
      riskLevel: (preExistingSuspected ? 'HIGH' : 'MEDIUM') as any,
      explanation: "Saying 'it has been acting up since we bought the house' triggers an automatic claim denial.",
      preventativeAdvice: "State clearly: 'The unit was functioning normally and experienced a sudden mechanical failure during routine operation.'",
    },
    {
      trapName: 'Secondary Water Damage Trap',
      riskLevel: (waterLeakPresent ? 'HIGH' : 'LOW') as any,
      explanation: 'Reporting floor or drywall damage can cause the representative to re-route the ticket as an excluded property loss.',
      preventativeAdvice: 'Focus 100% of your claim report on the appliance failure itself, not surrounding woodwork or flooring.',
    },
    {
      trapName: 'Corrosion and Sediment Trap',
      riskLevel: (rustOrCorrosionVisible ? 'CRITICAL' : 'LOW') as any,
      explanation: "Adjusters may classify internal mechanical wear as 'neglect' if superficial surface corrosion is noted.",
      preventativeAdvice: 'Wipe down any dust, water spots, or mineral scale from the outer cabinet and serial plate prior to technician arrival.',
    },
  ];

  const claimPlaybook = {
    recommendedActionPlan: [
      `Review your ${policyName} policy number and verify the $${tradeFee} trade service fee.`,
      'Take clear photos of the appliance data plate (Model & Serial number) and clean outer cabinet.',
      'Call the warranty dispatch line or file online using the exact script provided below.',
      'Insist on an authorized in-network technician who provides written diagnostic codes.',
    ],
    exactPhoneScript: `Hello, I need to place a service request under my ${policyName} contract. My ${detectedName} experienced a sudden mechanical breakdown during normal residential use and has stopped operating. The power supply and breakers have been verified, and the unit was properly maintained. Please dispatch an authorized technician to diagnose and repair the mechanical failure.`,
    mandatoryKeywordsToUse: [
      'sudden mechanical failure during normal operation',
      'routine residential wear and tear',
      'unit was functioning properly prior to sudden stoppage',
      'primary mechanical component failure',
    ],
    forbiddenPhrasesToAvoid: [
      {
        phrase: 'It has been making noise or leaking for several months',
        why: 'Triggers pre-existing condition and lack of timely maintenance exclusion.',
        replacement: 'The unit stopped operating properly during normal daily use.',
      },
      {
        phrase: 'Water leaked all over my expensive hardwood flooring',
        why: 'Triggers secondary damage investigation and claim redirection.',
        replacement: 'The primary internal component failed and needs mechanical service.',
      },
      {
        phrase: 'I tried taking it apart and replacing some wires myself',
        why: 'Voids warranty under unauthorized DIY tampering clause.',
        replacement: 'I only verified the external power breaker and standard settings.',
      },
    ],
    dispatcherChecklist: [
      'Have Policy Number and property address ready.',
      `Confirm the trade call fee is exactly $${tradeFee}.`,
      'Request technician contact info and estimated arrival window.',
      'Ask for a claim confirmation tracking number before hanging up.',
    ],
  };

  const alternativeSolutions = [
    {
      title: 'Direct Licensed Contractor Repair',
      costEstimate: `$${repMin} - $${repMax}`,
      difficulty: 'PROFESSIONAL' as const,
      description: 'Hire a pre-vetted local technician directly to avoid warranty delays and retain full parts warranty.',
    },
    {
      title: 'Component Reset & DIY Filter / Valve Check',
      costEstimate: '$0 - $45',
      difficulty: 'EASY' as const,
      description: 'Perform a clean breaker power-cycle and inspect intake filters or shutoff valves before scheduling paid visits.',
    },
  ];

  return {
    id: `verdict-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    status,
    confidenceScore,
    headline,
    executiveSummary,
    conversationalAdvisorResponse,
    followUpPrompt,
    clarifyingQuestions,
    detectedAppliance: {
      name: detectedName,
      makeModelEstimated: make ? `${make} ${model || ''}`.trim() : `${detectedName} Residential Unit`,
      failureMode,
      severity,
    },
    financialAnalysis,
    citedPolicyClauses,
    denialTraps,
    claimPlaybook,
    alternativeSolutions,
    inputSnapshot: {
      category: category || 'General',
      applianceOrPart: detectedName,
      symptomDescription: symptomDescription,
      policyName: policyName,
      tradeFee: tradeFee,
      hasImage: Boolean(imagePreviewUrl),
      imagePreviewUrl: imagePreviewUrl,
    },
  };
}
