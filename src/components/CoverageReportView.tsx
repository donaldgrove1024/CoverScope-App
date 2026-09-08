import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  PhoneCall,
  MessageSquare,
  Printer,
  ChevronDown,
  ChevronUp,
  Share2,
  Sparkles,
  ArrowRight,
  Send,
  AlertOctagon,
  TrendingUp,
  HelpCircle,
  Wrench,
  Info,
  Heart,
  Star,
  Zap,
  Lock,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TriageVerdict, WarrantyPolicy, ChatMessage, SubscriptionPlanTier } from '../types';
import { ViralLoopCard } from './ViralLoopCard';

interface CoverageReportViewProps {
  verdict: TriageVerdict | null;
  activePolicy: WarrantyPolicy;
  onNewTriage: () => void;
  onOpenContractorReferral?: (category: string) => void;
  onOpenShareModal?: () => void;
  currentPlan?: SubscriptionPlanTier;
  onOpenPricingModal?: () => void;
}

export const CoverageReportView: React.FC<CoverageReportViewProps> = ({
  verdict,
  activePolicy,
  onNewTriage,
  onOpenContractorReferral,
  onOpenShareModal,
  currentPlan = 'basic',
  onOpenPricingModal,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [expandedClauseIndex, setExpandedClauseIndex] = useState<number | null>(0);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInputMessage, setUserInputMessage] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Trigger confetti if covered
  React.useEffect(() => {
    if (verdict?.status === 'LIKELY_COVERED') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [verdict?.id]);

  if (!verdict) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Evaluation Report Yet</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Run an analysis in the Triage Studio to generate a grounded coverage verdict, financial fee-vs-payout risk analysis, and claim playbook.
        </p>
        <button
          onClick={onNewTriage}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition"
        >
          Go to Triage Studio
        </button>
      </div>
    );
  }

  const {
    status,
    confidenceScore,
    headline,
    executiveSummary,
    detectedAppliance,
    financialAnalysis,
    citedPolicyClauses,
    denialTraps,
    claimPlaybook,
    alternativeSolutions,
  } = verdict;

  const isCovered = status === 'LIKELY_COVERED';
  const isDenied = status === 'LIKELY_DENIED';
  const isAmbiguous = status === 'AMBIGUOUS';

  const handleCopyScript = () => {
    navigator.clipboard.writeText(claimPlaybook.exactPhoneScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyBrief = () => {
    const briefText = `COVERSCOPE WARRANTY EVALUATION BRIEF
Date: ${new Date(verdict.timestamp).toLocaleDateString()}
Policy: ${activePolicy.name}
Appliance: ${detectedAppliance.name} (${detectedAppliance.failureMode})
Verdict: ${status} (Confidence: ${confidenceScore}%)
Dispatch Fee: $${financialAnalysis.tradeCallFee}
Estimated Repair Range: $${financialAnalysis.estimatedRepairCostMin} - $${financialAnalysis.estimatedRepairCostMax}
Net Recommendation: ${financialAnalysis.recommendation}

MANDATORY KEYWORDS TO USE:
${claimPlaybook.mandatoryKeywordsToUse.map((k) => `• ${k}`).join('\n')}

PHONE FILING SCRIPT:
"${claimPlaybook.exactPhoneScript}"
`;
    navigator.clipboard.writeText(briefText);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInputMessage.trim() || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userInputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setUserInputMessage('');
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/chat-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userMsg.text,
          verdictContext: verdict,
          policyContext: activePolicy,
          conversationHistory: chatMessages,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-900">Evaluation Brief:</span>
          <span className="text-slate-700 font-medium truncate max-w-[200px] sm:max-w-xs">{detectedAppliance.name}</span>
          <span className="text-slate-400 hidden sm:inline">• {new Date(verdict.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Share to Save a Friend */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-xs font-bold text-pink-700 transition shadow-2xs"
            title="Share with friends to save them a $125 dispatch fee"
          >
            <Heart className="w-3.5 h-3.5 fill-pink-600 text-pink-600" />
            <span>Save a Friend $125</span>
          </button>

          <button
            onClick={() => setShowChatModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Ask AI Specialist</span>
          </button>

          <button
            onClick={handleCopyBrief}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-xs"
          >
            {copiedBrief ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied Brief</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition shadow-xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onNewTriage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>New Triage</span>
          </button>
        </div>
      </div>

      {/* Main Hero Verdict Banner */}
      <div
        className={`p-6 sm:p-7 rounded-3xl border shadow-sm relative overflow-hidden transition-all bg-white ${
          isCovered
            ? 'border-emerald-300 ring-4 ring-emerald-500/10'
            : isDenied
            ? 'border-rose-300 ring-4 ring-rose-500/10'
            : 'border-amber-300 ring-4 ring-amber-500/10'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Verdict Status Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs ${
                  isCovered
                    ? 'bg-emerald-600 text-white'
                    : isDenied
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-500 text-slate-950 font-extrabold'
                }`}
              >
                {isCovered && <CheckCircle2 className="w-4 h-4" />}
                {isDenied && <XCircle className="w-4 h-4" />}
                {isAmbiguous && <AlertTriangle className="w-4 h-4" />}
                <span>
                  {isCovered ? 'Likely Covered' : isDenied ? 'Likely Denied' : 'Ambiguous / Conditional'}
                </span>
              </div>

              {/* Confidence Score */}
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                {confidenceScore}% AI Confidence
              </span>

              {/* Active Policy Tag */}
              <span className="text-xs text-slate-500 font-medium">
                Matched against <strong className="text-slate-800">{activePolicy.name}</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{headline}</h2>

            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed whitespace-pre-line">
              {executiveSummary}
            </p>
          </div>

          {/* Quick Equipment Pill */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0 min-w-[220px] space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Identified Component
            </span>
            <p className="text-sm font-bold text-slate-900 truncate">{detectedAppliance.name}</p>
            <div className="text-xs space-y-1 text-slate-600">
              <div>
                Failure: <span className="text-slate-800 font-semibold">{detectedAppliance.failureMode}</span>
              </div>
              <div className="flex items-center gap-1.5">
                Severity:
                <span
                  className={`capitalize px-2 py-0.5 rounded text-[10px] font-bold ${
                    detectedAppliance.severity === 'critical'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : detectedAppliance.severity === 'high'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {detectedAppliance.severity}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Risk & Cost Analysis Matrix */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Financial Trade-Off & Dispatch Fee Calculator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Comparing your upfront non-refundable ${financialAnalysis.tradeCallFee} dispatch fee against out-of-pocket repair costs
            </p>
          </div>

          {/* Action Recommendation Badge */}
          <div
            className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider self-start sm:self-auto border ${
              financialAnalysis.recommendation === 'SUBMIT_CLAIM'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : financialAnalysis.recommendation === 'PAY_OUT_OF_POCKET_OR_DIY'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-rose-50 text-rose-700 border-rose-300'
            }`}
          >
            Recommendation: {financialAnalysis.recommendation.replace(/_/g, ' ')}
          </div>
        </div>

        {/* 4-Stat Comparison Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Trade Call Fee
            </span>
            <div className="text-2xl font-bold font-mono text-amber-700">
              ${financialAnalysis.tradeCallFee}
            </div>
            <span className="text-[10px] text-slate-400 block">Upfront non-refundable fee</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Estimated Out-of-Pocket
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ${financialAnalysis.estimatedRepairCostMin} - ${financialAnalysis.estimatedRepairCostMax}
            </div>
            <span className="text-[10px] text-slate-400 block">Independent contractor repair</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Potential Net Savings
            </span>
            <div
              className={`text-2xl font-bold font-mono ${
                financialAnalysis.netBenefitMin > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              ${financialAnalysis.netBenefitMin > 0 ? `+${financialAnalysis.netBenefitMin}` : financialAnalysis.netBenefitMin} to +${financialAnalysis.netBenefitMax}
            </div>
            <span className="text-[10px] text-slate-400 block">Value realized after dispatch fee</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Replacement Cost
            </span>
            <div className="text-2xl font-bold font-mono text-slate-700">
              ${financialAnalysis.estimatedReplacementCost}
            </div>
            <span className="text-[10px] text-slate-400 block">Full new unit replacement</span>
          </div>
        </div>

        {/* Recommendation Reason Box with Contractor Link */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-900 font-bold">Financial Strategy:</strong> {financialAnalysis.recommendationReason}
            </div>
          </div>

          {(isDenied || financialAnalysis.recommendation === 'PAY_OUT_OF_POCKET_OR_DIY') && onOpenContractorReferral && (
            <button
              onClick={() => onOpenContractorReferral(verdict.inputSnapshot.category || 'General')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 shadow-sm transition flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Get Local Contractor Quote</span>
            </button>
          )}
        </div>
      </div>

      {/* Claim Playbook & Phone Script */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span>Claim Preparation Script & Exact Phrasing</span>
              </h3>
              {currentPlan === 'premium' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Premium Defense Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Use these exact terms when contacting the warranty company to bypass automated keyword rejection traps
            </p>
          </div>

          <button
            id="copy-phone-script-btn"
            onClick={handleCopyScript}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
          >
            {copiedScript ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Script Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script to Clipboard</span>
              </>
            )}
          </button>
        </div>

        {/* Word-for-Word Script Box */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>READ THIS DIRECTLY TO DISPATCHER / CLAIMS PORTAL:</span>
            <span className="text-emerald-400">Verified Doctrine</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-100 font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 select-all">
            "{claimPlaybook.exactPhoneScript}"
          </p>
        </div>

        {/* Mandatory Keywords & Forbidden Phrases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mandatory Keywords */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mandatory Phrasing to Use</span>
            </span>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {claimPlaybook.mandatoryKeywordsToUse.map((keyword, i) => (
                <li key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span className="font-semibold text-emerald-950">{keyword}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Forbidden Phrases Table */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Forbidden Words (Auto-Denial Traps)</span>
            </span>
            <div className="space-y-2">
              {claimPlaybook.forbiddenPhrasesToAvoid.map((item, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-white border border-rose-200 shadow-2xs space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold line-through">
                    <span>"{item.phrase}"</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    <strong className="text-slate-800">Why it triggers denial:</strong> {item.why}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold leading-tight">
                    <strong>Say instead:</strong> "{item.replacement}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Plan & Technician Arrival Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Step-by-Step Filing Strategy
            </span>
            <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside leading-relaxed font-medium">
              {claimPlaybook.recommendedActionPlan.map((step, i) => (
                <li key={i} className="py-0.5">{step}</li>
              ))}
            </ol>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              On-Site Contractor Checklist
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed font-medium">
              {claimPlaybook.dispatcherChecklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Denial Trap Radar & Prevention Advice */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Policy Denial Trap Analysis</span>
          </h3>
          <p className="text-xs text-slate-500">
            Known clause loopholes and insurance defenses specific to this equipment failure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {denialTraps.map((trap, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{trap.trapName}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    trap.riskLevel === 'CRITICAL'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : trap.riskLevel === 'HIGH'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {trap.riskLevel} Risk
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{trap.explanation}</p>
              <div className="pt-1 text-[11px] text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <strong className="text-emerald-700 font-bold">Defense:</strong> {trap.preventativeAdvice}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cited Contract Clauses Inspector */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Cited Policy Clauses & Statutory Limits</span>
          </h3>
          <p className="text-xs text-slate-500">
            Direct clauses from {activePolicy.name} governing this determination
          </p>
        </div>

        <div className="space-y-2.5">
          {citedPolicyClauses.map((clause, idx) => {
            const isExpanded = expandedClauseIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden transition"
              >
                <div
                  onClick={() => setExpandedClauseIndex(isExpanded ? null : idx)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        clause.status === 'INCLUDED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : clause.status === 'EXCLUDED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {clause.status}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        {clause.section}: {clause.clauseTitle}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-2 border-t border-slate-200 text-xs">
                    <div className="font-mono text-[11px] text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      "{clause.textExcerpt}"
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      <strong className="text-blue-700 font-semibold">Legal & Practical Impact:</strong>{' '}
                      {clause.impactExplanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alternative DIY / Out-of-Pocket Solutions & Contractor Referral Banner */}
      {alternativeSolutions && alternativeSolutions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-600" />
                <span>Alternative Solutions & Direct Pro Referral</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cost-effective alternatives if you choose not to pay the ${financialAnalysis.tradeCallFee} dispatch fee
              </p>
            </div>

            {onOpenContractorReferral && (
              <button
                onClick={() => onOpenContractorReferral(verdict.inputSnapshot.category || 'General')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Vetted Local Pros →</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {alternativeSolutions.map((alt, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{alt.title}</span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">{alt.costEstimate}</span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">
                  Difficulty: <span className="text-slate-800">{alt.difficulty}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{alt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post-Analysis Viral Loop Banner */}
      <ViralLoopCard
        verdict={verdict}
        activePolicy={activePolicy}
        onCheckAnother={() => onNewTriage()}
        onOpenShareModal={onOpenShareModal}
        className="mt-4"
      />

      {/* Interactive AI Specialist Follow-up Drawer/Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">CoverScope AI Claim Advocate</h4>
                  <p className="text-[11px] text-slate-500">Ask questions about technician tactics or policy edge cases</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/50">
              {chatMessages.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 space-y-3">
                  <p className="font-medium">Have a question before calling the warranty company?</p>
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    {[
                      'What if the technician claims rust?',
                      'How do I request a second opinion?',
                      'Can I choose my own contractor?',
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => setUserInputMessage(prompt)}
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-[11px] font-semibold text-blue-700 shadow-2xs transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-1">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {isSendingChat && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-600 flex items-center gap-1.5 shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-3.5 border-t border-slate-100 bg-white flex gap-2">
              <input
                type="text"
                placeholder="Ask about dispute clauses, contractor questions, etc..."
                value={userInputMessage}
                onChange={(e) => setUserInputMessage(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSendingChat || !userInputMessage.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

