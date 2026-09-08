import { HomeWarrantyAccount } from '../types';

export const DEFAULT_HOME_WARRANTY_ACCOUNT: HomeWarrantyAccount = {
  providerId: 'ahs-gold',
  providerName: 'American Home Shield (ShieldGold)',
  memberId: 'AHS-884920-TX',
  policyNumber: 'POL-2024-998124',
  accountHolderName: 'Donald Grove',
  propertyAddress: '1244 Maplewood Lane, Dallas, TX 75001',
  phone: '(555) 234-5678',
  email: 'donaldgrove1@gmail.com',
  status: 'CONNECTED',
  autonomousDispatchEnabled: true, // User can have the request autonomous with no popup asking for approval or verification
  verifiedDate: 'Active & Verified',
};
