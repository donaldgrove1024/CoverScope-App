import { FinancialAnalysis, VerdictStatus, WarrantyPolicy } from '../types';

export interface CoverageEvaluationInput {
  policy: WarrantyPolicy;
  category?: string;
  applianceOrPart?: string;
  rustOrCorrosionVisible?: boolean;
  preExistingSuspected?: boolean;
  diyAttempted?: boolean;
  maintenanceRecordsAvailable?: boolean;
}

const SIGNIFICANT_WORD = /[^a-z0-9]+/;

function blobFor(category: string, applianceOrPart: string): string {
  return `${category} ${applianceOrPart}`.toLowerCase();
}

function itemMatchesClaim(
  item: WarrantyPolicy['coverageItems'][number],
  category: string,
  applianceOrPart: string
): boolean {
  const blob = blobFor(category, applianceOrPart);
  const itemCategory = item.category.toLowerCase();
  const itemName = item.name.toLowerCase();

  if (itemCategory === category.toLowerCase()) return true;
  if (blob.includes(itemCategory)) return true;

  return itemName
    .split(SIGNIFICANT_WORD)
    .filter((word) => word.length >= 4)
    .some((word) => blob.includes(word));
}

export function isListedCoveredItem(
  policy: WarrantyPolicy,
  category: string,
  applianceOrPart: string
): boolean {
  const matches = (policy.coverageItems || []).filter((item) =>
    itemMatchesClaim(item, category, applianceOrPart)
  );
  if (matches.length === 0) return false;
  return matches.some((item) => item.isCovered);
}

export function evaluateCoverageStatus(input: CoverageEvaluationInput): VerdictStatus {
  const category = input.category || 'General';
  const applianceOrPart = input.applianceOrPart || 'Appliance';

  if (!isListedCoveredItem(input.policy, category, applianceOrPart)) {
    return 'LIKELY_DENIED';
  }
  if (input.rustOrCorrosionVisible) {
    return 'LIKELY_DENIED';
  }
  if (input.preExistingSuspected) {
    return 'LIKELY_DENIED';
  }
  if (input.maintenanceRecordsAvailable === false) {
    return 'AMBIGUOUS';
  }
  if (input.diyAttempted) {
    return 'AMBIGUOUS';
  }
  return 'LIKELY_COVERED';
}

export function recommendationForStatus(
  status: VerdictStatus
): FinancialAnalysis['recommendation'] {
  if (status === 'LIKELY_COVERED') return 'SUBMIT_CLAIM';
  if (status === 'AMBIGUOUS') return 'SEEK_DIAGNOSTIC_FIRST';
  return 'PAY_OUT_OF_POCKET_OR_DIY';
}
