import React, { useState } from 'react';
import {
  FileText,
  Shield,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  Settings,
  Layers,
  Building2,
  Car,
  Search,
  ExternalLink
} from 'lucide-react';
import { WarrantyPolicy } from '../types';
import { DEFAULT_POLICIES } from '../data/defaultPolicies';

interface PolicyVaultViewProps {
  activePolicy: WarrantyPolicy;
  onSelectPolicy: (policy: WarrantyPolicy) => void;
  onOpenPolicyModal: () => void;
}

export const PolicyVaultView: React.FC<PolicyVaultViewProps> = ({
  activePolicy,
  onSelectPolicy,
  onOpenPolicyModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [comparePolicyId, setComparePolicyId] = useState<string>('ahs-platinum');

  const filteredItems = (activePolicy.coverageItems || []).filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.conditions && item.conditions.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = filterCategory === 'all' || item.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const comparePolicy = DEFAULT_POLICIES.find((p) => p.id === comparePolicyId) || DEFAULT_POLICIES[1];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Grounding Document Vault
              </span>
              <span className="text-xs text-slate-500 font-medium">Audited Contract Rules</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{activePolicy.name}</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Provider: <strong className="text-slate-800">{activePolicy.provider}</strong> • Plan Tier: <strong className="text-slate-800">{activePolicy.planTier}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenPolicyModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Switch / Ingest Policy</span>
            </button>
          </div>
        </div>

        {/* 4-Card Cap Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Trade Call Fee</span>
            <div className="text-2xl font-bold font-mono text-amber-700">${activePolicy.tradeServiceCallFee}</div>
            <span className="text-[10px] text-slate-400">Paid per contractor visit</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">HVAC Annual Cap</span>
            <div className="text-2xl font-bold font-mono text-slate-900">${activePolicy.hvacLimit || 5000}</div>
            <span className="text-[10px] text-slate-400">Heating & cooling repair cap</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Appliance Limit</span>
            <div className="text-2xl font-bold font-mono text-slate-900">${activePolicy.applianceLimit || activePolicy.perItemLimit || 2000}</div>
            <span className="text-[10px] text-slate-400">Per appliance claim cap</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Aggregate Term Cap</span>
            <div className="text-2xl font-bold font-mono text-slate-900">${activePolicy.annualAggregateCap || 25000}</div>
            <span className="text-[10px] text-slate-400">Total policy payout limit</span>
          </div>
        </div>
      </div>

      {/* Covered Items Explorer */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Covered Systems & Appliances Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500">Search specific appliances to verify policy inclusion and payout caps</p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter items (e.g., A/C, oven)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition ${
                item.isCovered
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-rose-50/40 border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {item.isCovered ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-bold text-xs text-slate-900">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold pl-6 block">
                    {item.category}
                  </span>
                </div>

                <div className="text-right">
                  {item.isCovered ? (
                    <span className="text-xs font-bold text-emerald-700 font-mono">
                      {item.limitDollar ? `$${item.limitDollar} Cap` : 'Covered'}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-700">Excluded</span>
                  )}
                </div>
              </div>

              {item.conditions && (
                <p className="mt-2 text-[11px] text-slate-600 pl-6 leading-relaxed">
                  {item.conditions}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Policy Exclusions & Strict Clauses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Exclusions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertCircle className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900">Explicit Plan Exclusions</h3>
          </div>
          <p className="text-xs text-slate-500">
            Contractual exceptions where claims will be automatically denied by the warranty carrier:
          </p>
          <ul className="space-y-2 pt-1 text-xs text-slate-700">
            {(activePolicy.commonExclusions || []).map((exc, i) => (
              <li key={i} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-rose-600 font-bold">•</span>
                <span className="font-medium">{exc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Audited Contract Clauses */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <FileText className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900">Legal Clause Definitions</h3>
          </div>
          <p className="text-xs text-slate-500">
            Key excerpts governing mechanical wear and tear requirements and liability limitations:
          </p>
          <div className="space-y-2 pt-1">
            {(activePolicy.contractClauses || []).map((c, i) => (
              <div key={i} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{c.section}</span>
                  <span className="text-[10px] text-blue-700 font-bold uppercase">{c.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Comparison Tool */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Plan Tier Comparison (Is an Upgrade Worth It?)</span>
            </h3>
            <p className="text-xs text-slate-500">Compare your active plan against other tiers to evaluate coverage gaps</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Compare against:</span>
            <select
              value={comparePolicyId}
              onChange={(e) => setComparePolicyId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
            >
              {DEFAULT_POLICIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Your Active Policy</span>
              <span className="text-xs font-bold text-slate-900">${activePolicy.tradeServiceCallFee} Fee</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">{activePolicy.name}</h4>
            <div className="text-xs space-y-1.5 text-slate-700">
              <div>HVAC Cap: <strong className="text-slate-900 font-mono">${activePolicy.hvacLimit || 5000}</strong></div>
              <div>Appliance Cap: <strong className="text-slate-900 font-mono">${activePolicy.applianceLimit || 2000}</strong></div>
              <div>Refrigerant Recapture: <strong className="text-slate-900">{activePolicy.refrigerantCoverage ? 'Included' : 'Not Included'}</strong></div>
              <div>Roof Leak Coverage: <strong className="text-slate-900">{activePolicy.coverageItems.some(i => i.name.includes('Roof') && i.isCovered) ? 'Yes' : 'No'}</strong></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comparison Plan</span>
              <span className="text-xs font-bold text-slate-900">${comparePolicy.tradeServiceCallFee} Fee</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">{comparePolicy.name}</h4>
            <div className="text-xs space-y-1.5 text-slate-700">
              <div>HVAC Cap: <strong className="text-slate-900 font-mono">${comparePolicy.hvacLimit || 5000}</strong></div>
              <div>Appliance Cap: <strong className="text-slate-900 font-mono">${comparePolicy.applianceLimit || 2000}</strong></div>
              <div>Refrigerant Recapture: <strong className="text-slate-900">{comparePolicy.refrigerantCoverage ? 'Included' : 'Not Included'}</strong></div>
              <div>Roof Leak Coverage: <strong className="text-slate-900">{comparePolicy.coverageItems.some(i => i.name.includes('Roof') && i.isCovered) ? 'Yes' : 'No'}</strong></div>
            </div>
            <button
              onClick={() => onSelectPolicy(comparePolicy)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              Switch to this plan →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
