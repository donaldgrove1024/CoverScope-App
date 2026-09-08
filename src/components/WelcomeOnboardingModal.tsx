import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  Mic,
  FileSearch,
  Zap,
  ArrowRight,
  UploadCloud,
  X,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  UserPlus,
  LogIn,
  Mail,
  Lock,
  User,
  MapPin,
  Check,
  Crown,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { DEFAULT_USERS } from '../data/defaultUsers';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTriage: () => void;
  onUploadContract: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
}

const POPULAR_WARRANTY_PROVIDERS = [
  'American Home Shield (ShieldGold)',
  'Choice Home Warranty (Total Plan)',
  'First American Home Warranty (Eagle Premier)',
  'Liberty Home Guard (Total Home Guard)',
  'Cinch Home Services (Complete Home)',
  'Select Home Warranty (Platinum Care)',
  'None / I do not have a policy yet',
];

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartTriage,
  onUploadContract,
  currentUser,
  onLogin,
}) => {
  // Step management:
  // step 1: Create Login / Sign In (or Verified User card if already logged in)
  // step 2: How It Works & Core Value Proposition
  const [currentStep, setCurrentStep] = useState<1 | 2>(() => (currentUser ? 2 : 1));
  const [authTab, setAuthTab] = useState<'signup' | 'signin'>('signup');

  // Quick Sign-up state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [warrantyProvider, setWarrantyProvider] = useState('American Home Shield (ShieldGold)');
  const [streetAddress, setStreetAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Quick Sign-in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessToast(null);
      setCurrentStep(currentUser ? 2 : 1);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  };

  // Handle Quick Create Account in Step 1
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length > 0 && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        propertyAddress: streetAddress.trim() || '1244 Maplewood Lane',
        cityStateZip: 'Dallas, TX 75001',
        warrantyProvider: warrantyProvider,
        memberId: `MBR-${Math.floor(100000 + Math.random() * 900000)}`,
        planTier: 'basic',
        createdAt: new Date().toISOString().split('T')[0],
        emailVerified: true,
      };

      onLogin(newUser);
      triggerConfetti();
      setSuccessToast(`Account created for ${newUser.name}! Proceeding to overview.`);
      setTimeout(() => {
        setSuccessToast(null);
        setCurrentStep(2);
      }, 700);
    }, 600);
  };

  // Handle Quick Sign In
  const handleQuickSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailToUse = signInEmail.trim() || 'donaldgrove1@gmail.com';
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const found = DEFAULT_USERS.find((u) => u.email.toLowerCase() === emailToUse.toLowerCase());
      const loggedUser: UserProfile = found || {
        id: `usr_${Date.now()}`,
        name: emailToUse.split('@')[0].replace('.', ' ').replace(/^./, (c) => c.toUpperCase()),
        email: emailToUse,
        propertyAddress: '1244 Maplewood Lane',
        cityStateZip: 'Dallas, TX 75001',
        warrantyProvider: 'American Home Shield (ShieldGold)',
        memberId: 'AHS-884920-TX',
        planTier: 'basic',
        createdAt: new Date().toISOString().split('T')[0],
        emailVerified: true,
      };

      onLogin(loggedUser);
      triggerConfetti();
      setSuccessToast(`Welcome back, ${loggedUser.name}!`);
      setTimeout(() => {
        setSuccessToast(null);
        setCurrentStep(2);
      }, 600);
    }, 600);
  };

  // Handle 1-Click Social Sign-In
  const handle1ClickGoogle = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoUser = DEFAULT_USERS[0]; // Donald Grove
      onLogin(demoUser);
      triggerConfetti();
      setSuccessToast(`Signed in as ${demoUser.name} with Google`);
      setTimeout(() => {
        setSuccessToast(null);
        setCurrentStep(2);
      }, 600);
    }, 500);
  };

  // Handle Skip to Step 2 as Guest
  const handleContinueAsGuest = () => {
    setCurrentStep(2);
  };

  return (
    <div
      id="welcome-onboarding-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="welcome-onboarding-modal-card"
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Top Gradient Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 shrink-0" />

        {/* Top Bar with Step Indicators and Close Button */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <span
              id="welcome-tagline-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>CoverScope™ • Know Before You File™</span>
            </span>

            {/* Step 1 / Step 2 Pill Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`px-2.5 py-0.5 rounded-full transition cursor-pointer flex items-center gap-1 ${
                  currentStep === 1
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : currentUser
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                <span>Step 1: {currentUser ? 'Account' : 'Create Login'}</span>
                {currentUser && <Check className="w-3 h-3 text-emerald-700" />}
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                  currentStep === 2
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                <span>Step 2: How It Works</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            id="welcome-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Dismiss and explore CoverScope"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Toast / Status Alert */}
          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: CREATE LOGIN / SIGN IN                                            */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in slide-in-from-left-4 duration-200">
              {currentUser ? (
                /* Already Authenticated State */
                <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900">{currentUser.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                            Active Account
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-emerald-200/60">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Provider:</span>{' '}
                      <span className="font-semibold text-slate-800">{currentUser.warrantyProvider || 'Configured'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Property:</span>{' '}
                      <span className="font-semibold text-slate-800">{currentUser.propertyAddress || '1244 Maplewood Lane'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Headline & Value Proposition for Account Creation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                        Step 1 of 2: Create Your Free Account
                      </span>
                      <button
                        type="button"
                        onClick={handleContinueAsGuest}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-700 underline"
                      >
                        Skip & continue as guest →
                      </button>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      Save Your Policies, Claims & Avoid $100+ Dispatch Traps
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Create your login in 10 seconds. We'll store your active warranty terms, appliance inventory, and claim triage evaluations securely in one place.
                    </p>
                  </div>

                  {/* 1-Click Social Sign In */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handle1ClickGoogle}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 transition shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Continue with Google (1-Click)</span>
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                      Or with email
                    </span>
                  </div>

                  {/* Auth Mode Toggle (Create Account vs Sign In) */}
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAuthTab('signup')}
                      className={`py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        authTab === 'signup'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Free Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthTab('signin')}
                      className={`py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        authTab === 'signin'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>I Have an Account</span>
                    </button>
                  </div>

                  {/* FORM: Sign Up */}
                  {authTab === 'signup' ? (
                    <form onSubmit={handleCreateAccount} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Your Full Name *
                          </label>
                          <div className="relative">
                            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g. Donald Grove"
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="donaldgrove1@gmail.com"
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Password (Optional for Demo)
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="At least 6 chars"
                              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Warranty Company
                          </label>
                          <select
                            value={warrantyProvider}
                            onChange={(e) => setWarrantyProvider(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                          >
                            {POPULAR_WARRANTY_PROVIDERS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition cursor-pointer disabled:opacity-50 mt-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Create Login & Continue to Step 2</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    /* FORM: Sign In */
                    <form onSubmit={handleQuickSignIn} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={signInEmail}
                            onChange={(e) => setSignInEmail(e.target.value)}
                            placeholder="e.g. donaldgrove1@gmail.com"
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            value={signInPassword}
                            onChange={(e) => setSignInPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: HOW IT WORKS & VALUE PROPOSITION                                  */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              {/* Headline & Value Proposition */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
                    Step 2: Know Before You File™
                  </span>
                  {currentUser && (
                    <span className="text-xs font-bold text-slate-400">
                      • Signed in as {currentUser.name}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Stop Paying $100+ Just to Hear{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600">
                    "Sorry, That's Not Covered."
                  </span>
                </h2>
                <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
                  When something breaks, warranty companies charge a non-refundable <strong>$100–$125 service fee</strong> before a technician even shows up. CoverScope checks your specific contract first so you never waste money on an excluded repair.
                </p>
              </div>

              {/* High-Impact Stat Callout Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">The Warranty Trap</p>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Over <strong>42%</strong> of filed claims are denied due to hidden wear-and-tear or rust clauses.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold">
                    $100–$125 Saved Per Claim
                  </span>
                </div>
              </div>

              {/* How It Works (3 Quick Steps with Icons) */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  How It Works in 3 Quick Steps
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-blue-300 hover:shadow-xs transition">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>1. Describe or Snap</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-normal">
                        Speak naturally about your issue or snap a photo of the broken item.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-indigo-300 hover:shadow-xs transition">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <FileSearch className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>2. Instant Policy Check</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-normal">
                        AI scans your contract for hidden exclusions, caps, and denial traps.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-emerald-300 hover:shadow-xs transition">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>3. Know Before You Pay</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-normal">
                        Get a clear Coverage Score and exact claim filing wording before spending a dime.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200/80 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="order-2 sm:order-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold border border-slate-300 transition cursor-pointer shadow-xs"
              >
                <span>Continue as Guest</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="order-1 sm:order-2 flex-1 sm:flex-initial flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
              >
                <span>Preview "How It Works"</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Secondary Action: Upload Contract */}
              <button
                type="button"
                id="welcome-upload-contract-btn"
                onClick={onUploadContract}
                className="order-2 sm:order-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-bold border border-slate-300 transition cursor-pointer shadow-xs"
              >
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span>Upload My Warranty Contract</span>
              </button>

              {/* Primary Action: Check First Repair */}
              <button
                type="button"
                id="welcome-start-triage-btn"
                onClick={onStartTriage}
                className="order-1 sm:order-2 flex-1 sm:flex-initial flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-600/25 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Check My First Repair — Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
