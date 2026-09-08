import React from 'react';
import { History, Trash2, CheckCircle2, XCircle, AlertTriangle, ArrowRight, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { TriageVerdict } from '../types';

interface HistoryViewProps {
  history: TriageVerdict[];
  onSelectVerdict: (verdict: TriageVerdict) => void;
  onClearHistory: () => void;
  onStartNewTriage: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectVerdict,
  onClearHistory,
  onStartNewTriage,
}) => {
  // Calculate total fee savings from avoided denied claims or successful payouts
  const totalPreventedFees = history
    .filter((v) => v.status === 'LIKELY_DENIED')
    .reduce((acc, curr) => acc + (curr.financialAnalysis.tradeCallFee || 100), 0);

  const totalPotentialPayouts = history
    .filter((v) => v.status === 'LIKELY_COVERED')
    .reduce((acc, curr) => acc + (curr.financialAnalysis.netBenefitMax || 450), 0);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Metrics Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Savings Tracker
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Evaluation History & Realized Value
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Audit trail of all diagnosed breakdowns, avoided dispatch fees, and claim playbooks
            </p>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
            <button
              onClick={onStartNewTriage}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Triage</span>
            </button>
          </div>
        </div>

        {/* 3-Stat Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Total Evaluated Claims
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900">{history.length}</div>
            <span className="text-[10px] text-slate-400">Multimodal diagnoses</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
              Avoided Wasted Fees
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-600">${totalPreventedFees}</div>
            <span className="text-[10px] text-slate-400">Saved by not dispatching on denied claims</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
              Potential Covered Value
            </span>
            <div className="text-2xl font-bold font-mono text-blue-600">${totalPotentialPayouts}</div>
            <span className="text-[10px] text-slate-400">Estimated repair claim payouts</span>
          </div>
        </div>
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <History className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Saved Claims Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your evaluated claims and claim filing playbooks will be automatically saved here for rapid reference during technician visits.
          </p>
          <button
            onClick={onStartNewTriage}
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            Start First Triage
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((verdict) => {
            const isCovered = verdict.status === 'LIKELY_COVERED';
            const isDenied = verdict.status === 'LIKELY_DENIED';
            return (
              <div
                key={verdict.id}
                onClick={() => onSelectVerdict(verdict)}
                className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-2xs group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isCovered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isDenied
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isCovered && <CheckCircle2 className="w-3 h-3" />}
                      {isDenied && <XCircle className="w-3 h-3" />}
                      {!isCovered && !isDenied && <AlertTriangle className="w-3 h-3" />}
                      <span>{verdict.status.replace(/_/g, ' ')}</span>
                    </span>

                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(verdict.timestamp).toLocaleDateString()}</span>
                    </span>

                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      • {verdict.inputSnapshot.policyName}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                    {verdict.detectedAppliance.name} ({verdict.detectedAppliance.failureMode})
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {verdict.headline}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Dispatch Fee vs Repair
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-800">
                      ${verdict.financialAnalysis.tradeCallFee} vs ${verdict.financialAnalysis.estimatedRepairCostMin}-${verdict.financialAnalysis.estimatedRepairCostMax}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 border border-slate-200 flex items-center justify-center transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
