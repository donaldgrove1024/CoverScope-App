import { UserProfile } from '../types';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr_donald_grove',
    name: 'Donald Grove',
    email: 'donaldgrove1@gmail.com',
    phone: '(555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    propertyAddress: '1244 Maplewood Lane',
    cityStateZip: 'Dallas, TX 75001',
    warrantyProvider: 'American Home Shield (ShieldGold)',
    memberId: 'AHS-884920-TX',
    planTier: 'premium',
    createdAt: '2024-01-15',
    emailVerified: true,
    twoFactorEnabled: false,
  },
  {
    id: 'usr_sarah_jenkins',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '(555) 876-5432',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    propertyAddress: '782 Highland Park Dr',
    cityStateZip: 'Austin, TX 78701',
    warrantyProvider: 'First American Home Warranty',
    memberId: 'FAHW-449102-TX',
    planTier: 'basic',
    createdAt: '2024-03-20',
    emailVerified: true,
    twoFactorEnabled: false,
  },
];
