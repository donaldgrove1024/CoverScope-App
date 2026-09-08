import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  FileText,
  History,
  Wrench,
  ChevronDown,
  Home,
  Crown,
  Zap,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  ShieldCheck,
  Building2,
  CalendarCheck,
  HelpCircle,
} from 'lucide-react';
import { WarrantyPolicy, SubscriptionPlanTier, UserProfile } from '../types';

export type AppNavTab = 'triage' | 'report' | 'vault' | 'inventory' | 'maintenance' | 'rental' | 'history';

interface HeaderProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  activePolicy: WarrantyPolicy;
  onOpenPolicyModal: () => void;
  hasRecentReport: boolean;
  currentPlan: SubscriptionPlanTier;
  onOpenPricingModal: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: (mode?: 'signin' | 'signup' | 'profile') => void;
  onLogout: () => void;
  onOpenOnboardingModal?: () => void;
  pendingPreventiveCount?: number;
  openRentalTicketCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activePolicy,
  onOpenPolicyModal,
  hasRecentReport,
  currentPlan,
  onOpenPricingModal,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenOnboardingModal,
  pendingPreventiveCount,
  openRentalTicketCount,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('triage')}>
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">CoverScope™</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  AI Warranty Advisor
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Instant Voice & Photo Triage • Know If It's Covered Before Paying $100+ Dispatch Fees
              </p>
            </div>
          </div>

          {/* User Auth, Plan Badge & Policy Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Membership Plan Pill */}
            <button
              id="plan-badge-btn"
              onClick={onOpenPricingModal}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                currentPlan === 'premium'
                  ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Manage CoverScope Membership Plan"
            >
              {currentPlan === 'premium' ? (
                <Crown className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span className="capitalize">{currentPlan} Plan</span>
              {currentPlan === 'basic' && (
                <span className="text-[10px] text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded-md font-bold">
                  Upgrade
                </span>
              )}
            </button>

            {/* Policy Selector Pill */}
            <button
              id="active-policy-selector-btn"
              onClick={onOpenPolicyModal}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 transition shadow-sm group cursor-pointer"
              title="Click to switch or configure active warranty policy"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="max-w-[100px] sm:max-w-[150px] truncate font-medium text-slate-900">
                {activePolicy.planTier || activePolicy.name}
              </span>
              <span className="hidden md:inline text-slate-500">(${activePolicy.tradeServiceCallFee} fee)</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
            </button>

            {/* How It Works Button */}
            {onOpenOnboardingModal && (
              <button
                type="button"
                id="header-how-it-works-btn"
                onClick={onOpenOnboardingModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer"
                title="How CoverScope Works"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>How It Works</span>
              </button>
            )}

            {/* User Account / Sign In / Sign Up Controls */}
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer group shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[85px] sm:max-w-[120px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuthModal('profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Account Profile & Home</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenPricingModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left transition"
                    >
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>Subscription ({currentUser.planTier})</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenPolicyModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Manage Warranty Policy</span>
                    </button>

                    {onOpenOnboardingModal && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenOnboardingModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left transition"
                      >
                        <HelpCircle className="w-4 h-4 text-blue-500" />
                        <span>How CoverScope Works</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="header-sign-in-btn"
                  onClick={() => onOpenAuthModal('signin')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  id="header-sign-up-btn"
                  onClick={() => onOpenAuthModal('signup')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up Free</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-100 py-1.5 overflow-x-auto scrollbar-none">
          <button
            id="nav-tab-triage"
            onClick={() => setActiveTab('triage')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'triage'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Advisor</span>
          </button>


          <button
            id="nav-tab-report"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap relative ${
              activeTab === 'report'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : hasRecentReport
                ? 'text-slate-800 hover:bg-slate-100/70'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Coverage Breakdown</span>
            {hasRecentReport && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute top-1.5 right-1.5" />
            )}
          </button>

          <button
            id="nav-tab-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home Inventory</span>
          </button>

          <button
            id="nav-tab-vault"
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'vault'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Policy Vault</span>
          </button>

          <button
            id="nav-tab-maintenance"
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap relative ${
              activeTab === 'maintenance'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>Preventive Care</span>
            {pendingPreventiveCount && pendingPreventiveCount > 0 ? (
              <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-amber-500 text-white">
                {pendingPreventiveCount}
              </span>
            ) : null}
          </button>

          <button
            id="nav-tab-rental"
            onClick={() => setActiveTab('rental')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap relative ${
              activeTab === 'rental'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Rental Mode</span>
            {openRentalTicketCount && openRentalTicketCount > 0 ? (
              <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-indigo-600 text-white">
                {openRentalTicketCount}
              </span>
            ) : null}
          </button>

          <button
            id="nav-tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Saved Claims</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

