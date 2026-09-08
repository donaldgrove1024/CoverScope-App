import React, { useState } from 'react';
import {
  Share2,
  Sparkles,
  PlusCircle,
  MessageSquare,
  Send,
  Copy,
  Check,
  Twitter,
  Heart,
  Shield,
  ArrowRight,
  Flame,
  Zap,
  Refrigerator,
  Flame as HeaterIcon,
  Wind,
  Wrench,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TriageVerdict, WarrantyPolicy } from '../types';

interface ViralLoopCardProps {
  verdict?: TriageVerdict | null;
  activePolicy?: WarrantyPolicy;
  onCheckAnother: (presetQuery?: string, category?: string) => void;
  onOpenShareModal?: () => void;
  compact?: boolean;
  className?: string;
}

const POPULAR_APPLIANCES = [
  { label: 'Refrigerator', icon: '🧊', category: 'Appliances', sample: 'My refrigerator is not cooling properly.' },
  { label: 'Dishwasher', icon: '🍽️', category: 'Appliances', sample: 'My dishwasher is leaking or not draining.' },
  { label: 'Water Heater', icon: '💧', category: 'Plumbing', sample: 'My water heater has no hot water or is leaking.' },
  { label: 'HVAC / AC', icon: '❄️', category: 'HVAC', sample: 'My AC unit stopped blowing cold air.' },
  { label: 'Washer / Dryer', icon: '🧺', category: 'Appliances', sample: 'My washing machine won’t spin or drain.' },
  { label: 'Oven / Range', icon: '🍳', category: 'Appliances', sample: 'My oven is not heating to temperature.' },
];

export const ViralLoopCard: React.FC<ViralLoopCardProps> = ({
  verdict,
  activePolicy,
  onCheckAnother,
  onOpenShareModal,
  compact = false,
  className = '',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const feeAmount = activePolicy?.tradeServiceCallFee || verdict?.financialAnalysis?.tradeCallFee || 125;
  const applianceName = verdict?.detectedAppliance?.name || 'appliance';
  const appUrl = window.location.origin;

  const shareText = `Before you pay a $${feeAmount} service fee to American Home Shield or your warranty carrier, check CoverScope first! It audited my ${applianceName} repair and showed how to avoid claim denials. Try it free: ${appUrl}`;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {
      // fallback
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    triggerConfetti();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedSnippet(true);
    triggerConfetti();
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const handleShareSMS = () => {
    const url = `sms:?&body=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      id="viral-loop-section"
      className={`rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 shadow-xl space-y-6 overflow-hidden relative ${className}`}
    >
      {/* Background Accent Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2 relative z-10 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-blue-300">
            Post-Analysis Action Loop
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Avoided $125 Unexpected Out-of-Pocket</span>
        </div>
      </div>

      {/* Two Column Grid: 1. Check Another Appliance | 2. Share to Save a Friend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
        {/* ========================================================================= */}
        {/* LOOP 1: WANT TO CHECK ANOTHER APPLIANCE?                                   */}
        {/* ========================================================================= */}
        <div
          id="viral-loop-check-another-card"
          className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-600 transition"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold">
                <PlusCircle className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Want to check another appliance?
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Have another humming disposal, noisy washer, or aging AC? Check coverage before filing to ensure you don’t forfeit another trade call fee.
            </p>

            {/* Quick 1-Click Appliance Pickers */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                1-Click Quick Check:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {POPULAR_APPLIANCES.map((app) => (
                  <button
                    key={app.label}
                    type="button"
                    onClick={() => onCheckAnother(app.sample, app.category)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-blue-600 hover:border-blue-500 border border-slate-700/70 text-[11px] font-semibold text-slate-200 hover:text-white transition text-left cursor-pointer group"
                  >
                    <span>{app.icon}</span>
                    <span className="truncate">{app.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            id="viral-loop-new-triage-btn"
            onClick={() => onCheckAnother()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Check Another Appliance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* LOOP 2: SHARE THIS TO HELP ANOTHER HOMEOWNER AVOID A $125 SURPRISE       */}
        {/* ========================================================================= */}
        <div
          id="viral-loop-share-card"
          className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-600 transition"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold">
                  <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Share this to help another homeowner avoid a $125 surprise
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Warranty carriers pocket millions in non-refundable dispatch fees on denied claims. Send this to a friend or neighbor to protect them.
            </p>

            {/* Instant 1-Click Social Triggers */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                1-Tap Instant Share:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleShareSMS}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:border-emerald-500 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
                  title="Send via SMS / Text Message"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                  <span>Text / SMS</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-green-600 hover:border-green-500 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <Send className="w-3.5 h-3.5 text-green-400" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareTwitter}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 hover:border-sky-500 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
                  title="Post to X / Twitter"
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>Post / X</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Copy Link & Full Modal Trigger */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="viral-loop-copy-link-btn"
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-100 transition cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Share Link'}</span>
              </button>

              {onOpenShareModal && (
                <button
                  type="button"
                  id="viral-loop-open-share-modal-btn"
                  onClick={onOpenShareModal}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer shrink-0"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Kit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
