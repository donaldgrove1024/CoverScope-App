import React, { useState, useEffect } from 'react';
import { Header, AppNavTab } from './components/Header';
import { TriageStudio } from './components/TriageStudio';
import { CoverageReportView } from './components/CoverageReportView';
import { PolicyVaultView } from './components/PolicyVaultView';
import { HistoryView } from './components/HistoryView';
import { HomeInventoryView } from './components/HomeInventoryView';
import { PreventiveMaintenanceView } from './components/PreventiveMaintenanceView';
import { RentalModeView } from './components/RentalModeView';
import { PolicyModal } from './components/PolicyModal';
import { PricingPlansModal } from './components/PricingPlansModal';
import { ContractorReferralModal } from './components/ContractorReferralModal';
import { ShareReferralModal } from './components/ShareReferralModal';
import { AuthModal } from './components/AuthModal';
import { WelcomeOnboardingModal } from './components/WelcomeOnboardingModal';
import {
  WarrantyPolicy,
  TriageVerdict,
  HomeApplianceItem,
  SubscriptionPlanTier,
  UserProfile,
  PreventiveMaintenanceTask,
  RentalPropertySettings,
  RentalMaintenanceTicket,
} from './types';
import { DEFAULT_POLICIES } from './data/defaultPolicies';
import { DEFAULT_INVENTORY } from './data/defaultInventory';
import { DEFAULT_USERS } from './data/defaultUsers';
import { DEFAULT_PREVENTIVE_TASKS } from './data/defaultPreventiveTasks';
import { DEFAULT_RENTAL_SETTINGS, DEFAULT_RENTAL_TICKETS } from './data/defaultRental';
import { Shield, Sparkles, Wrench, FileText, History, Home, CalendarCheck, Building2 } from 'lucide-react';

const ACTIVE_POLICY_STORAGE_KEY = 'coverscope_active_policy';
const HISTORY_STORAGE_KEY = 'coverscope_triage_history';
const INVENTORY_STORAGE_KEY = 'coverscope_home_inventory';
const PLAN_STORAGE_KEY = 'coverscope_subscription_plan';
const AUTH_STORAGE_KEY = 'coverscope_auth_user';
const PREVENTIVE_STORAGE_KEY = 'coverscope_preventive_tasks';
const RENTAL_SETTINGS_STORAGE_KEY = 'coverscope_rental_settings';
const RENTAL_TICKETS_STORAGE_KEY = 'coverscope_rental_tickets';
const ONBOARDING_STORAGE_KEY = 'coverscope_has_seen_onboarding';

export default function App() {
  // State: Logged-in User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_USERS[0]; // Donald Grove default session
  });

  // State: Active Policy
  const [activePolicy, setActivePolicy] = useState<WarrantyPolicy>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_POLICY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_POLICIES[0]; // American Home Shield Gold by default
  });

  // State: Subscription Plan Tier
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlanTier>(() => {
    try {
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      if (saved === 'basic' || saved === 'premium') return saved;
    } catch {
      // ignore
    }
    return 'basic';
  });

  // State: Active Navigation Tab
  const [activeTab, setActiveTab] = useState<AppNavTab>('triage');

  // State: Evaluation History
  const [history, setHistory] = useState<TriageVerdict[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // State: Preventive Maintenance Tasks & Schedules
  const [preventiveTasks, setPreventiveTasks] = useState<PreventiveMaintenanceTask[]>(() => {
    try {
      const saved = localStorage.getItem(PREVENTIVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PREVENTIVE_TASKS;
  });

  // State: Rental Property Configuration
  const [rentalSettings, setRentalSettings] = useState<RentalPropertySettings>(() => {
    try {
      const saved = localStorage.getItem(RENTAL_SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_RENTAL_SETTINGS;
  });

  // State: Rental Maintenance Tickets
  const [rentalTickets, setRentalTickets] = useState<RentalMaintenanceTicket[]>(() => {
    try {
      const saved = localStorage.getItem(RENTAL_TICKETS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_RENTAL_TICKETS;
  });

  // State: Currently viewed verdict in the Coverage Report
  const [currentVerdict, setCurrentVerdict] = useState<TriageVerdict | null>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0];
      }
    } catch {
      // ignore
    }
    return null;
  });

  // State: Home Appliances Inventory
  const [inventory, setInventory] = useState<HomeApplianceItem[]>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_INVENTORY;
  });

  // State: Selected Item for Triage Pre-fill
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<{
    name: string;
    category: string;
    ageYears?: number;
  } | null>(null);

  // Modal States
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isContractorModalOpen, setIsContractorModalOpen] = useState(false);
  const [contractorModalTrade, setContractorModalTrade] = useState<string>('HVAC');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'profile'>('signin');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      return saved !== 'true';
    } catch {
      return true;
    }
  });

  const handleDismissOnboarding = () => {
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save onboarding state', e);
    }
  };

  const handleStartTriageFromOnboarding = () => {
    handleDismissOnboarding();
    setSelectedInventoryItem(null);
    setActiveTab('triage');
  };

  const handleUploadContractFromOnboarding = () => {
    handleDismissOnboarding();
    setIsPolicyModalOpen(true);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save auth state to storage', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_POLICY_STORAGE_KEY, JSON.stringify(activePolicy));
    } catch (e) {
      console.warn('Failed to save active policy to storage', e);
    }
  }, [activePolicy]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to storage', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    } catch (e) {
      console.warn('Failed to save inventory to storage', e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, currentPlan);
    } catch (e) {
      console.warn('Failed to save plan to storage', e);
    }
  }, [currentPlan]);

  useEffect(() => {
    try {
      localStorage.setItem(PREVENTIVE_STORAGE_KEY, JSON.stringify(preventiveTasks));
    } catch (e) {
      console.warn('Failed to save preventive tasks to storage', e);
    }
  }, [preventiveTasks]);

  useEffect(() => {
    try {
      localStorage.setItem(RENTAL_SETTINGS_STORAGE_KEY, JSON.stringify(rentalSettings));
    } catch (e) {
      console.warn('Failed to save rental settings to storage', e);
    }
  }, [rentalSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(RENTAL_TICKETS_STORAGE_KEY, JSON.stringify(rentalTickets));
    } catch (e) {
      console.warn('Failed to save rental tickets to storage', e);
    }
  }, [rentalTickets]);

  // Handler for completed triage
  const handleTriageComplete = (verdict: TriageVerdict) => {
    setCurrentVerdict(verdict);
    setHistory((prev) => [verdict, ...prev.filter((v) => v.id !== verdict.id)]);
  };

  const handleSelectHistoryVerdict = (verdict: TriageVerdict) => {
    setCurrentVerdict(verdict);
    setActiveTab('report');
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all saved claim evaluations?')) {
      setHistory([]);
      setCurrentVerdict(null);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  };

  const handleDiagnoseInventoryItem = (item: HomeApplianceItem) => {
    const calculatedAge = item.ageYears || Math.max(1, new Date().getFullYear() - item.installYear);
    setSelectedInventoryItem({
      name: `${item.brand} ${item.modelNumber ? `(${item.modelNumber})` : ''} - ${item.name}`,
      category: item.category,
      ageYears: calculatedAge,
    });
    setActiveTab('triage');
  };

  const handleOpenContractors = (trade?: string) => {
    if (trade) setContractorModalTrade(trade);
    setIsContractorModalOpen(true);
  };

  const handleSelectPlan = (tier: SubscriptionPlanTier) => {
    setCurrentPlan(tier);
  };

  // Count pending items
  const pendingPreventiveCount = preventiveTasks.filter((t) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(t.nextDueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const openRentalTicketCount = rentalTickets.filter((t) => t.status !== 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* Top Application Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePolicy={activePolicy}
        onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
        hasRecentReport={Boolean(currentVerdict)}
        currentPlan={currentPlan}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode || 'signin');
          setIsAuthModalOpen(true);
        }}
        onLogout={() => setCurrentUser(null)}
        onOpenOnboardingModal={() => setIsOnboardingOpen(true)}
        pendingPreventiveCount={pendingPreventiveCount}
        openRentalTicketCount={openRentalTicketCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {activeTab === 'triage' && (
          <TriageStudio
            activePolicy={activePolicy}
            onTriageComplete={handleTriageComplete}
            onSelectPolicy={setActivePolicy}
            onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
            onViewReport={() => setActiveTab('report')}
            onOpenContractorReferral={handleOpenContractors}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            initialItem={selectedInventoryItem}
          />
        )}

        {activeTab === 'report' && (
          <CoverageReportView
            verdict={currentVerdict}
            activePolicy={activePolicy}
            onNewTriage={() => {
              setSelectedInventoryItem(null);
              setActiveTab('triage');
            }}
            onOpenContractorReferral={handleOpenContractors}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onOpenPricingModal={() => setIsPricingModalOpen(true)}
            currentPlan={currentPlan}
          />
        )}

        {activeTab === 'inventory' && (
          <HomeInventoryView
            inventory={inventory}
            onUpdateInventory={setInventory}
            onDiagnoseItem={handleDiagnoseInventoryItem}
            onOpenVault={() => setActiveTab('vault')}
          />
        )}

        {activeTab === 'maintenance' && (
          <PreventiveMaintenanceView
            tasks={preventiveTasks}
            onUpdateTasks={setPreventiveTasks}
            activePolicy={activePolicy}
            onOpenContractorModal={handleOpenContractors}
          />
        )}

        {activeTab === 'rental' && (
          <RentalModeView
            rentalSettings={rentalSettings}
            onUpdateRentalSettings={setRentalSettings}
            tickets={rentalTickets}
            onUpdateTickets={setRentalTickets}
            activePolicy={activePolicy}
            onOpenContractorModal={handleOpenContractors}
          />
        )}

        {activeTab === 'vault' && (
          <PolicyVaultView
            activePolicy={activePolicy}
            onSelectPolicy={(policy) => {
              setActivePolicy(policy);
            }}
            onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectVerdict={handleSelectHistoryVerdict}
            onClearHistory={handleClearHistory}
            onStartNewTriage={() => {
              setSelectedInventoryItem(null);
              setActiveTab('triage');
            }}
          />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        currentUser={currentUser}
        onLogin={(user) => {
          setCurrentUser(user);
          if (user.planTier) setCurrentPlan(user.planTier);
        }}
        onLogout={() => {
          setCurrentUser(null);
        }}
        onUpdateProfile={(user) => {
          setCurrentUser(user);
        }}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
      />

      <PolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        activePolicy={activePolicy}
        onSelectPolicy={(policy) => {
          setActivePolicy(policy);
        }}
      />

      <PricingPlansModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentPlan={currentPlan}
        onSelectPlan={handleSelectPlan}
      />

      <ContractorReferralModal
        isOpen={isContractorModalOpen}
        onClose={() => setIsContractorModalOpen(false)}
        preferredCategory={contractorModalTrade}
        deniedApplianceName={currentVerdict?.detectedAppliance.name}
        failureDescription={currentVerdict?.detectedAppliance.failureMode}
        tradeFeeAvoided={activePolicy.tradeServiceCallFee}
        currentPlan={currentPlan}
      />

      <ShareReferralModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        verdict={currentVerdict}
      />

      <WelcomeOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleDismissOnboarding}
        onStartTriage={handleStartTriageFromOnboarding}
        onUploadContract={handleUploadContractFromOnboarding}
        currentUser={currentUser}
        onLogin={(user) => {
          setCurrentUser(user);
          if (user.planTier) setCurrentPlan(user.planTier);
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around text-[10px] font-medium text-slate-500 shadow-lg">
        <button
          onClick={() => {
            setSelectedInventoryItem(null);
            setActiveTab('triage');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-lg transition ${
            activeTab === 'triage' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Advisor</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-lg transition ${
            activeTab === 'maintenance' ? 'text-emerald-600 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Care</span>
        </button>

        <button
          onClick={() => setActiveTab('rental')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-lg transition ${
            activeTab === 'rental' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Rental</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-lg transition ${
            activeTab === 'inventory' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-lg transition ${
            activeTab === 'history' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Claims</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 mb-12 sm:mb-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">CoverScope™</span>
            <span className="text-slate-300">•</span>
            <span>Know Before You File™ • Prevent Unnecessary Trade Service Call Fees</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Grounding models: Gemini 3.7 Flash & 1.5 Pro • Contract rules derived from verified home/auto warranty policies
          </span>
        </div>
      </footer>
    </div>
  );
}

