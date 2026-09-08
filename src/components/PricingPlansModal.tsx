import React, { useState } from 'react';
import { X, Check, Sparkles, Shield, Star, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { SubscriptionPlanTier } from '../types';
import { SUBSCRIPTION_PLANS, PLAN_COMPARISON_TABLE } from '../data/plans';
import confetti from 'canvas-confetti';

interface PricingPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlanTier;
  onSelectPlan: (plan: SubscriptionPlanTier) => void;
}

export const PricingPlansModal: React.FC<PricingPlansModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSelectPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handlePlanUpgrade = (tier: SubscriptionPlanTier) => {
    onSelectPlan(tier);
    if (tier === 'premium') {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">CoverScope™ Membership Plans</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Know Before You File™
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Stop paying non-refundable $100–$125 trade service fees for claims that will get denied.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-xs font-semibold ${
                billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Monthly Billing
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-12 h-6 rounded-full bg-slate-200 p-1 flex items-center transition duration-200"
            >
              <div
                className={`w-4 h-4 rounded-full bg-blue-600 shadow-sm transform transition duration-200 ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold ${
                  billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                Annual Billing
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Basic Plan */}
            <div
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative ${
                currentPlan === 'basic'
                  ? 'border-blue-600 bg-blue-50/30 shadow-sm ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {currentPlan === 'basic' && (
                <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Current Plan
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{SUBSCRIPTION_PLANS.basic.name}</h4>
                  <p className="text-xs text-slate-500">{SUBSCRIPTION_PLANS.basic.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">
                    ${billingCycle === 'monthly' ? SUBSCRIPTION_PLANS.basic.priceMonthly : (SUBSCRIPTION_PLANS.basic.priceAnnual / 12).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                  {billingCycle === 'annual' && (
                    <span className="text-[11px] text-slate-400 block ml-2">
                      (${SUBSCRIPTION_PLANS.basic.priceAnnual}/yr)
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    What's Included:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {SUBSCRIPTION_PLANS.basic.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  id="btn-select-basic-plan"
                  onClick={() => handlePlanUpgrade('basic')}
                  disabled={currentPlan === 'basic'}
                  className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    currentPlan === 'basic'
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {currentPlan === 'basic' ? 'Active Plan' : 'Downgrade to Basic'}
                </button>
              </div>
            </div>

            {/* Premium Plan */}
            <div
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative shadow-md ${
                currentPlan === 'premium'
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600'
                  : 'border-blue-500 bg-gradient-to-b from-blue-50/50 to-white'
              }`}
            >
              <div className="absolute -top-3 left-6">
                <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-blue-600 text-white shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Most Popular for Homeowners
                </span>
              </div>

              {currentPlan === 'premium' && (
                <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Current Plan
                </span>
              )}

              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{SUBSCRIPTION_PLANS.premium.name}</span>
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </h4>
                  <p className="text-xs text-slate-500">{SUBSCRIPTION_PLANS.premium.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">
                    ${billingCycle === 'monthly' ? SUBSCRIPTION_PLANS.premium.priceMonthly : (SUBSCRIPTION_PLANS.premium.priceAnnual / 12).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                  {billingCycle === 'annual' && (
                    <span className="text-[11px] text-slate-400 block ml-2">
                      (${SUBSCRIPTION_PLANS.premium.priceAnnual}/yr)
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-blue-100 space-y-2.5">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                    All Basic Features Plus:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {SUBSCRIPTION_PLANS.premium.features.slice(1).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  id="btn-select-premium-plan"
                  onClick={() => handlePlanUpgrade('premium')}
                  disabled={currentPlan === 'premium'}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md ${
                    currentPlan === 'premium'
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  {currentPlan === 'premium' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Active Premium Member</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Upgrade to Premium ($19.99/mo)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
            <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Detailed Plan Feature Comparison
            </h5>
            <div className="divide-y divide-slate-200">
              {PLAN_COMPARISON_TABLE.map((item, i) => (
                <div key={i} className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                  <div className="sm:col-span-6">
                    <span className="font-bold text-slate-800 block">{item.name}</span>
                    <span className="text-[11px] text-slate-500">{item.description}</span>
                  </div>
                  <div className="sm:col-span-3 text-slate-600 flex items-center gap-1">
                    <span className="sm:hidden font-semibold text-slate-400">Basic: </span>
                    {typeof item.basic === 'boolean' ? (
                      item.basic ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )
                    ) : (
                      <span className="font-medium">{item.basic}</span>
                    )}
                  </div>
                  <div className="sm:col-span-3 text-blue-700 font-semibold flex items-center gap-1">
                    <span className="sm:hidden font-semibold text-slate-400">Premium: </span>
                    {typeof item.premium === 'boolean' ? (
                      item.premium ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )
                    ) : (
                      <span>{item.premium}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Current Status:{' '}
            <strong className="text-slate-900 uppercase font-bold">
              {currentPlan} Plan
            </strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
