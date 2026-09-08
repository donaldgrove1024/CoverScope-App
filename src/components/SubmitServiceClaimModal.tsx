import React, { useState } from 'react';
import {
  X,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PhoneCall,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Building2,
  User,
  Calendar,
  Send,
  Sparkles,
  Printer,
  Zap,
  Lock,
} from 'lucide-react';
import { WarrantyPolicy, TriageVerdict, HomeWarrantyAccount, ClaimSubmittalRecord } from '../types';

interface SubmitServiceClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  verdict: TriageVerdict | null;
  activePolicy: WarrantyPolicy;
  warrantyAccount?: HomeWarrantyAccount;
  onClaimDispatched?: (record: ClaimSubmittalRecord) => void;
  onUpdateAutonomousPreference?: (enabled: boolean) => void;
}

export const SubmitServiceClaimModal: React.FC<SubmitServiceClaimModalProps> = ({
  isOpen,
  onClose,
  verdict,
  activePolicy,
  warrantyAccount,
  onClaimDispatched,
  onUpdateAutonomousPreference,
}) => {
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimRecord, setClaimRecord] = useState<ClaimSubmittalRecord | null>(null);

  // Form Fields prefilled from connected account
  const [homeownerName, setHomeownerName] = useState(warrantyAccount?.accountHolderName || 'Donald Grove');
  const [homeownerPhone, setHomeownerPhone] = useState(warrantyAccount?.phone || '(555) 234-5678');
  const [homeownerAddress, setHomeownerAddress] = useState(warrantyAccount?.propertyAddress || '1244 Maplewood Lane, Dallas, TX 75001');
  const [memberId, setMemberId] = useState(warrantyAccount?.memberId || 'AHS-884920-TX');
  const [preferredDate, setPreferredDate] = useState('Next Available (Urgent)');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [makeAutonomousDefault, setMakeAutonomousDefault] = useState(warrantyAccount?.autonomousDispatchEnabled || false);

  if (!isOpen || !verdict) return null;

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (onUpdateAutonomousPreference && makeAutonomousDefault !== warrantyAccount?.autonomousDispatchEnabled) {
      onUpdateAutonomousPreference(makeAutonomousDefault);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedClaimNum = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;
      const record: ClaimSubmittalRecord = {
        id: `rec-${Date.now()}`,
        claimNumber: generatedClaimNum,
        timestamp: new Date().toLocaleTimeString(),
        providerName: activePolicy.name,
        memberId: memberId,
        applianceName: verdict.detectedAppliance.name,
        failureMode: verdict.detectedAppliance.failureMode,
        tradeFee: activePolicy.tradeServiceCallFee,
        dispatchWindow: preferredDate,
        autonomous: false,
        status: 'DISPATCHED',
        confirmationNotes: `Authorized verification submittal dispatched to ${activePolicy.name} contractor pool.`,
      };

      setClaimRecord(record);
      setClaimSubmitted(true);
      if (onClaimDispatched) {
        onClaimDispatched(record);
      }
    }, 1200);
  };

  const handleCopyScript = () => {
    if (!verdict.claimPlaybook?.exactPhoneScript) return;
    navigator.clipboard.writeText(verdict.claimPlaybook.exactPhoneScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-slate-900 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">
                  {claimSubmitted ? 'Service Request Dispatched' : `Verify & Submit Service Request`}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Linked Account Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connected to <strong>{activePolicy.name}</strong> • Account #{memberId}
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {claimSubmitted && claimRecord ? (
            <div className="space-y-6 text-center py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900">Service Request Successfully Submitted!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your claim has been packaged with verified contract clauses and transmitted to <strong>{activePolicy.name}</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Claim Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{claimRecord.claimNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Warranty Provider:</span>
                  <span className="font-semibold text-slate-900">{activePolicy.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Trade Service Call Fee:</span>
                  <span className="font-bold text-emerald-700">${activePolicy.tradeServiceCallFee} due at contractor visit</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Item & Failure:</span>
                  <span className="font-semibold text-slate-800">{verdict.detectedAppliance.name} ({verdict.detectedAppliance.failureMode})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Dispatch Arrival Window:</span>
                  <span className="font-bold text-blue-700">{claimRecord.dispatchWindow} (24–48h)</span>
                </div>
              </div>

              {/* Anti-Denial Protection Box */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2 text-xs text-amber-950 max-w-md mx-auto">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Important When Contractor Arrives:</span>
                </div>
                <p className="leading-relaxed">
                  State that the failure occurred under <strong>normal residential wear and tear</strong>. Do NOT mention prior DIY repair attempts or rust/corrosion.
                </p>
                {verdict.claimPlaybook?.exactPhoneScript && (
                  <button
                    onClick={handleCopyScript}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl text-amber-900 font-bold transition shadow-xs"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Phone Script Copied!' : 'Copy Script for Technician'}</span>
                  </button>
                )}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Claim Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitClaim} className="space-y-4">
              {/* Linked Account Confirmation Box */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Verified Covered Claim ({verdict.confidenceScore}% Contract Match)</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Trade Fee: ${activePolicy.tradeServiceCallFee}
                  </span>
                </div>
                <div className="text-xs text-slate-700">
                  <strong>Item:</strong> {verdict.detectedAppliance.name} • <strong>Failure:</strong> {verdict.detectedAppliance.failureMode}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  CoverScope has validated that this breakdown is fully covered under the <strong>{activePolicy.name}</strong> wear-and-tear doctrine.
                </p>
              </div>

              {/* Connected Account Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Holder Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={homeownerName}
                    onChange={(e) => setHomeownerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Warranty Member / Policy ID</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    <span>Callback Phone</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={homeownerPhone}
                    onChange={(e) => setHomeownerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Preferred Contractor Window</span>
                  </label>
                  <select
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Next Available (Urgent 24h)">Next Available (Urgent 24h)</option>
                    <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (12:00 PM - 5:00 PM)">Afternoon (12:00 PM - 5:00 PM)</option>
                    <option value="Weekend Appointment">Weekend Appointment</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Service Property Address</label>
                  <input
                    type="text"
                    required
                    value={homeownerAddress}
                    onChange={(e) => setHomeownerAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Technician Dispatch Notes & Anti-Denial Script */}
              {verdict.claimPlaybook?.exactPhoneScript && (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold">ANTI-DENIAL TECHNICIAN PHRASING:</span>
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-slate-200 text-[11px] leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    "{verdict.claimPlaybook.exactPhoneScript}"
                  </p>
                </div>
              )}

              {/* Autonomous Mode Toggle in Verification Modal */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Enable Autonomous 1-Click Dispatch for future claims</span>
                    <span className="text-[11px] text-slate-500">Skip this approval pop-up and dispatch automatically when covered</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={makeAutonomousDefault}
                    onChange={(e) => setMakeAutonomousDefault(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting Claim to {activePolicy.name}...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Approve & Submit Service Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
