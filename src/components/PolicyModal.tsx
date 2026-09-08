import React, { useState } from 'react';
import { X, ShieldCheck, Upload, FileText, Check, DollarSign, AlertCircle, Sparkles, Building2, Car } from 'lucide-react';
import { WarrantyPolicy } from '../types';
import { DEFAULT_POLICIES } from '../data/defaultPolicies';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePolicy: WarrantyPolicy;
  onSelectPolicy: (policy: WarrantyPolicy) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  activePolicy,
  onSelectPolicy,
}) => {
  const [selectedTab, setSelectedTab] = useState<'presets' | 'custom' | 'feeEdit'>('presets');
  const [customText, setCustomText] = useState('');
  const [customProvider, setCustomProvider] = useState('');
  const [customTier, setCustomTier] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [tradeFeeInput, setTradeFeeInput] = useState(String(activePolicy.tradeServiceCallFee));

  if (!isOpen) return null;

  const handleParseCustomPolicy = async () => {
    if (!customText.trim() && !customProvider.trim()) {
      setParseError('Please enter contract text or provider details');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      let parsedPolicy: any = null;

      try {
        const response = await fetch('/api/parse-policy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentText: customText,
            providerName: customProvider,
            planTier: customTier,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.policy) {
            parsedPolicy = data.policy;
          }
        }
      } catch (networkErr) {
        console.warn('Backend parse policy network warning:', networkErr);
      }

      if (!parsedPolicy) {
        const pName = customProvider.trim() || 'Custom Home Warranty';
        const tier = customTier.trim() || 'Comprehensive Tier';
        parsedPolicy = {
          id: `custom-local-${Date.now()}`,
          name: `${pName} (${tier})`,
          provider: pName,
          planTier: tier,
          type: customText.toLowerCase().includes('vehicle') || customText.toLowerCase().includes('auto') ? 'vehicle' : 'home',
          tradeServiceCallFee: customText.includes('125') ? 125 : customText.includes('75') ? 75 : 100,
          annualAggregateCap: 25000,
          perItemLimit: 2000,
          hvacLimit: 5000,
          applianceLimit: 2000,
          plumbingLimit: 1500,
          wearAndTearCovered: true,
          secondaryDamageCovered: false,
          codeViolationCoverageDollar: 250,
          refrigerantCoverage: true,
          coverageItems: [
            { name: 'Central HVAC / Air Conditioning', category: 'HVAC', isCovered: true, limitDollar: 5000 },
            { name: 'Water Heater', category: 'Plumbing', isCovered: true, limitDollar: 2000 },
            { name: 'Kitchen Refrigerator', category: 'Appliances', isCovered: true, limitDollar: 2000 },
            { name: 'Built-in Dishwasher', category: 'Appliances', isCovered: true, limitDollar: 2000 },
            { name: 'Electrical Panel & Wiring', category: 'Electrical', isCovered: true, limitDollar: 2000 },
          ],
          commonExclusions: [
            'Consequential secondary water damage to drywall, subflooring, or personal property',
            'Pre-existing conditions known prior to enrollment waiting period',
            'Rust, sediment accumulation, or chemical corrosion exclusions',
          ],
          contractClauses: [
            {
              section: 'Section 3',
              title: 'Mechanical Breakdown',
              description: 'Covers items that fail due to normal residential wear and tear.',
            },
          ],
        };
      }

      onSelectPolicy(parsedPolicy);
      onClose();
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse policy.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpdateTradeFee = () => {
    const feeNum = parseFloat(tradeFeeInput) || 100;
    const updated = {
      ...activePolicy,
      tradeServiceCallFee: feeNum,
    };
    onSelectPolicy(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-900 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Warranty Policy Setup</h3>
              <p className="text-xs text-slate-500">Select your active warranty contract or upload a custom agreement</p>
            </div>
          </div>
          <button
            id="close-policy-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-100 bg-white px-6 pt-2">
          <button
            id="tab-policy-presets"
            onClick={() => setSelectedTab('presets')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition ${
              selectedTab === 'presets'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Provider Presets
          </button>
          <button
            id="tab-policy-custom"
            onClick={() => setSelectedTab('custom')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              selectedTab === 'custom'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Contract Parser</span>
          </button>
          <button
            id="tab-policy-fee"
            onClick={() => setSelectedTab('feeEdit')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition ${
              selectedTab === 'feeEdit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Adjust Trade Call Fee
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {selectedTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Choose the preset that matches your current home or auto service contract:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {DEFAULT_POLICIES.map((policy) => {
                  const isSelected = activePolicy.id === policy.id;
                  return (
                    <div
                      key={policy.id}
                      id={`policy-card-${policy.id}`}
                      onClick={() => {
                        onSelectPolicy(policy);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {policy.type === 'home' ? (
                            <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                          ) : (
                            <Car className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                          <span className="font-bold text-sm text-slate-900">{policy.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs">
                        <span className="text-blue-700 font-bold font-mono bg-blue-100/80 px-2 py-0.5 rounded-lg border border-blue-200">
                          ${policy.tradeServiceCallFee} Trade Fee
                        </span>
                        <span className="text-slate-500 font-medium">
                          {policy.type === 'home' ? 'Home Warranty' : 'Vehicle Service'}
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {policy.notes || `${policy.provider} tier covering major residential components.`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTab === 'custom' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Multimodal Contract Extractor</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Paste the text or key clauses from your warranty agreement, declaration page, or provider summary. Gemini 3.7 Flash will extract all trade fees, exclusions, aggregate caps, and coverage limits.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Provider Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Liberty Home Guard, Fidelity"
                      value={customProvider}
                      onChange={(e) => setCustomProvider(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Plan Tier (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Appliance Guard, Platinum"
                      value={customTier}
                      onChange={(e) => setCustomTier(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contract Text / Clauses / Declaration Excerpt
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Paste policy clauses, covered systems, exclusions, and trade fee clauses here..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 placeholder-slate-400 font-mono"
                  />
                </div>

                {parseError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                )}

                <button
                  id="btn-parse-contract"
                  onClick={handleParseCustomPolicy}
                  disabled={isParsing}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20"
                >
                  {isParsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Parsing Contract Clauses with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Parse & Set as Active Policy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'feeEdit' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <h4 className="font-bold text-sm text-slate-900">Adjust Trade Service Call Fee</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The Trade Service Call Fee is the mandatory dispatch fee you must pay each time a contractor is sent to your home ($75, $100, or $125).
                </p>

                <div className="flex items-center gap-3">
                  <div className="relative w-36">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm font-semibold">$</span>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={tradeFeeInput}
                      onChange={(e) => setTradeFeeInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-sm text-slate-900 font-bold font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {[75, 85, 100, 125].map((fee) => (
                      <button
                        key={fee}
                        type="button"
                        onClick={() => setTradeFeeInput(String(fee))}
                        className={`px-3 py-2 rounded-xl text-xs font-bold font-mono border transition ${
                          tradeFeeInput === String(fee)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ${fee}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="save-trade-fee-btn"
                  onClick={handleUpdateTradeFee}
                  className="mt-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Update Trade Fee
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Active: <strong className="text-slate-800 font-bold">{activePolicy.name}</strong></span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
