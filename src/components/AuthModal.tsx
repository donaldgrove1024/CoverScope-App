import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  MapPin,
  Shield,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Sparkles,
  Phone,
  ArrowRight,
  ShieldCheck,
  Building2,
  Crown,
  Zap,
  LogIn,
  UserPlus,
  RefreshCw,
  LogOut,
  Edit3,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, SubscriptionPlanTier } from '../types';
import { DEFAULT_USERS } from '../data/defaultUsers';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'profile';
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateProfile: (user: UserProfile) => void;
  onOpenPricingModal?: () => void;
}

const POPULAR_WARRANTY_PROVIDERS = [
  'American Home Shield (ShieldGold)',
  'American Home Shield (ShieldSilver)',
  'American Home Shield (ShieldPlatinum)',
  'Choice Home Warranty (Total Plan)',
  'First American Home Warranty (Eagle Premier)',
  'Liberty Home Guard (Total Home Guard)',
  'Cinch Home Services (Complete Home)',
  'Select Home Warranty (Platinum Care)',
  'None / I do not have a policy yet',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  onOpenPricingModal,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'profile'>(() => {
    if (currentUser && initialMode === 'profile') return 'profile';
    return initialMode;
  });

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpStreet, setSignUpStreet] = useState('');
  const [signUpCityStateZip, setSignUpCityStateZip] = useState('Dallas, TX 75001');
  const [signUpWarrantyProvider, setSignUpWarrantyProvider] = useState('American Home Shield (ShieldGold)');
  const [signUpMemberId, setSignUpMemberId] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCityStateZip, setEditCityStateZip] = useState('');
  const [editWarrantyProvider, setEditWarrantyProvider] = useState('');
  const [editMemberId, setEditMemberId] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Loading & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Sync mode when modal opens or currentUser changes
  React.useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setForgotSubmitted(false);
      setIsEditingProfile(false);
      if (currentUser && initialMode === 'profile') {
        setMode('profile');
        setEditName(currentUser.name);
        setEditPhone(currentUser.phone || '');
        setEditAddress(currentUser.propertyAddress || '');
        setEditCityStateZip(currentUser.cityStateZip || '');
        setEditWarrantyProvider(currentUser.warrantyProvider || 'American Home Shield (ShieldGold)');
        setEditMemberId(currentUser.memberId || '');
      } else {
        setMode(initialMode === 'profile' && !currentUser ? 'signin' : initialMode);
      }
    }
  }, [isOpen, initialMode, currentUser]);

  if (!isOpen) return null;

  // Password Strength Calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passStrength = getPasswordStrength(signUpPassword);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback if canvas not available
    }
  };

  // Handle Sign In
  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const emailToUse = signInEmail.trim() || 'donaldgrove1@gmail.com';
    if (!signInEmail.trim() && !signInPassword.trim()) {
      // Default to Donald Grove if empty
      const demoUser = DEFAULT_USERS[0];
      performLogin(demoUser);
      return;
    }

    if (!emailToUse.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Authenticating account...');

    setTimeout(() => {
      setIsLoading(false);
      // Check if matches default users
      const found = DEFAULT_USERS.find((u) => u.email.toLowerCase() === emailToUse.toLowerCase());
      const userToLogin: UserProfile = found || {
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

      performLogin(userToLogin);
    }, 700);
  };

  // Handle Sign Up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signUpName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service to create your account.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Creating your CoverScope account...');

    setTimeout(() => {
      setIsLoading(false);
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        phone: signUpPhone.trim() || undefined,
        propertyAddress: signUpStreet.trim() || undefined,
        cityStateZip: signUpCityStateZip.trim() || undefined,
        warrantyProvider: signUpWarrantyProvider,
        memberId: signUpMemberId.trim() || `MBR-${Math.floor(100000 + Math.random() * 900000)}`,
        planTier: 'basic',
        createdAt: new Date().toISOString().split('T')[0],
        emailVerified: true,
      };

      performLogin(newUser, true);
    }, 900);
  };

  // Handle Social / 1-Click Login
  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    setIsLoading(true);
    setLoadingText(`Connecting to ${provider}...`);
    setTimeout(() => {
      setIsLoading(false);
      const socialUser: UserProfile = {
        id: `usr_${provider.toLowerCase()}_${Date.now()}`,
        name: provider === 'Google' ? 'Donald Grove' : 'Apple Homeowner',
        email: provider === 'Google' ? 'donaldgrove1@gmail.com' : 'homeowner@icloud.com',
        avatarUrl:
          provider === 'Google'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            : undefined,
        propertyAddress: '1244 Maplewood Lane',
        cityStateZip: 'Dallas, TX 75001',
        warrantyProvider: 'American Home Shield (ShieldGold)',
        memberId: 'AHS-884920-TX',
        planTier: 'premium',
        createdAt: new Date().toISOString().split('T')[0],
        emailVerified: true,
      };
      performLogin(socialUser);
    }, 800);
  };

  // Perform Login Finalization
  const performLogin = (user: UserProfile, isNewSignUp = false) => {
    onLogin(user);
    triggerConfetti();
    setSuccessMessage(
      isNewSignUp
        ? `🎉 Welcome to CoverScope, ${user.name}! Your account is active.`
        : `👋 Welcome back, ${user.name}!`
    );
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Handle Quick Demo Sign-In
  const handleDemoSignIn = (user: UserProfile) => {
    performLogin(user);
  };

  // Handle Password Reset Request
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address to send the reset link.');
      return;
    }
    setIsLoading(true);
    setLoadingText('Sending password reset instructions...');
    setTimeout(() => {
      setIsLoading(false);
      setForgotSubmitted(true);
    }, 800);
  };

  // Handle Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: UserProfile = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      phone: editPhone.trim() || currentUser.phone,
      propertyAddress: editAddress.trim() || currentUser.propertyAddress,
      cityStateZip: editCityStateZip.trim() || currentUser.cityStateZip,
      warrantyProvider: editWarrantyProvider || currentUser.warrantyProvider,
      memberId: editMemberId.trim() || currentUser.memberId,
    };

    onUpdateProfile(updated);
    setIsEditingProfile(false);
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">CoverScope™</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {mode === 'profile' ? 'Account Profile' : 'Homeowner Portal'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {mode === 'signin' && 'Sign in to access your warranty policy & saved claims'}
                {mode === 'signup' && 'Sign up to protect your home and prevent denied warranty claims'}
                {mode === 'forgot' && 'Reset your password to regain access'}
                {mode === 'profile' && 'Manage your home details, warranty provider & subscription'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector: Sign In vs Sign Up (When not in Profile or Forgot mode) */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. SIGN IN FORM                                                           */}
          {/* ========================================================================= */}
          {mode === 'signin' && (
            <div className="space-y-4">
              {/* Quick 1-Click Social Sign In */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
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
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('Apple')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.92-2.84-.9.04-2 .6-2.65 1.35-.58.66-1.08 1.73-.95 2.76 1.01.08 2.05-.52 2.68-1.27z" />
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                  Or with email
                </span>
              </div>

              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="e.g. donaldgrove1@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{loadingText}</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to CoverScope</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Fast Test Accounts */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick 1-Click Test Profiles:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEFAULT_USERS.map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleDemoSignIn(usr)}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50 text-left transition cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {usr.name.charAt(0)}
                      </div>
                      <div className="truncate text-xs">
                        <span className="font-bold text-slate-800 group-hover:text-blue-700 block truncate">
                          {usr.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block truncate">
                          {usr.warrantyProvider?.split(' ')[0]} • {usr.planTier}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. SIGN UP / REGISTRATION FORM                                            */}
          {/* ========================================================================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Free Homeowner Plan:</strong> Get instant AI voice/photo triage, contract clause lookups, and prevent denied claims before paying dispatch fees.
                </span>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Donald Grove"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="donaldgrove1@gmail.com"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Strength Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {signUpPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passStrength <= 25
                            ? 'w-1/4 bg-rose-500'
                            : passStrength <= 50
                            ? 'w-2/4 bg-amber-500'
                            : passStrength <= 75
                            ? 'w-3/4 bg-blue-500'
                            : 'w-full bg-emerald-500'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Strength: {passStrength <= 25 ? 'Weak' : passStrength <= 50 ? 'Fair' : passStrength <= 75 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Property Details (Used for claim dispatch and Angi quotes) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={signUpStreet}
                      onChange={(e) => setSignUpStreet(e.target.value)}
                      placeholder="1244 Maplewood Lane"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City, State & ZIP
                  </label>
                  <input
                    type="text"
                    value={signUpCityStateZip}
                    onChange={(e) => setSignUpCityStateZip(e.target.value)}
                    placeholder="Dallas, TX 75001"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Warranty Provider Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Current Home Warranty Provider
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={signUpWarrantyProvider}
                    onChange={(e) => setSignUpWarrantyProvider(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white appearance-none cursor-pointer"
                  >
                    {POPULAR_WARRANTY_PROVIDERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5"
                  />
                  <span>
                    I agree to the <strong className="text-slate-800">Terms of Service</strong> & <strong className="text-slate-800">Privacy Policy</strong>. CoverScope uses AI to interpret warranty contracts and assist with claim preparation.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loadingText}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Free CoverScope Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 3. FORGOT PASSWORD FORM                                                   */}
          {/* ========================================================================= */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {forgotSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Password Reset Link Sent!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    We sent recovery instructions to <strong>{signInEmail || 'your email'}</strong>. Check your inbox to set a new password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSubmitted(false);
                      setMode('signin');
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold transition hover:bg-blue-700"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter the email address associated with your account. We'll send you a secure link to reset your password.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="e.g. donaldgrove1@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition flex-1"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex-[2] flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. USER PROFILE & ACCOUNT SETTINGS (When Logged In)                       */}
          {/* ========================================================================= */}
          {mode === 'profile' && currentUser && (
            <div className="space-y-5">
              {/* Profile Card Header */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {currentUser.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                      currentUser.planTier === 'premium'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-blue-100 text-blue-900 border border-blue-200'
                    }`}
                  >
                    {currentUser.planTier === 'premium' ? (
                      <Crown className="w-3 h-3 text-amber-600" />
                    ) : (
                      <Zap className="w-3 h-3 text-blue-600" />
                    )}
                    <span>{currentUser.planTier} Plan</span>
                  </span>
                </div>
              </div>

              {/* Edit Mode Toggle / Form */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-3.5 border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-slate-800 block">Edit Profile Information:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">City, State, ZIP</label>
                      <input
                        type="text"
                        value={editCityStateZip}
                        onChange={(e) => setEditCityStateZip(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Home Warranty Provider</label>
                    <select
                      value={editWarrantyProvider}
                      onChange={(e) => setEditWarrantyProvider(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {POPULAR_WARRANTY_PROVIDERS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* Static Read-only Profile Details */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-0.5">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                        Property Address
                      </span>
                      <span className="font-semibold text-slate-900 block truncate">
                        {currentUser.propertyAddress || '1244 Maplewood Lane'}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {currentUser.cityStateZip || 'Dallas, TX 75001'}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-0.5">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                        Warranty Policy
                      </span>
                      <span className="font-semibold text-slate-900 block truncate">
                        {currentUser.warrantyProvider || 'American Home Shield'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        Member #{currentUser.memberId || 'AHS-884920-TX'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Home & Policy Info</span>
                    </button>

                    {onOpenPricingModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPricingModal();
                        }}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Manage Subscription</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Sign Out / Switch User Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMode('signin');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
