import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Twitter, Send, Sparkles, Shield, Heart } from 'lucide-react';
import { TriageVerdict } from '../types';

interface ShareReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  verdict?: TriageVerdict | null;
}

export const ShareReferralModal: React.FC<ShareReferralModalProps> = ({
  isOpen,
  onClose,
  verdict,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;
  const applianceName = verdict?.detectedAppliance?.name || 'appliance';
  const feeSaved = verdict?.financialAnalysis?.tradeCallFee || 125;

  const shareText = `Before you pay a $${feeSaved} service fee to American Home Shield or your warranty carrier, check CoverScope first! It audited my ${applianceName} failure and showed how to avoid a surprise denial. Try it free here: ${appUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareSMS = () => {
    const url = `sms:?&body=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                Share this to help another homeowner avoid a ${feeSaved} surprise
              </h3>
              <p className="text-xs text-slate-500">
                Help friends and neighbors avoid paying non-refundable dispatch fees for denied warranty claims.
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
        <div className="p-6 space-y-5">
          {/* Card Preview */}
          <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                <Shield className="w-4 h-4" />
                <span>CoverScope™ — Know Before You File™</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Saved ${feeSaved} Trade Fee
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              "{shareText}"
            </p>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1-Click Instant Share
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={handleShareSMS}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>SMS / Text</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition"
              >
                <Send className="w-4 h-4 text-green-600" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition"
              >
                <Twitter className="w-4 h-4 text-sky-500" />
                <span>X / Post</span>
              </button>
            </div>
          </div>

          {/* Link Copier */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Shareable Link
            </span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={appUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Thank you for helping fellow homeowners!</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
