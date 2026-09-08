import React, { useState } from 'react';
import {
  X,
  Wrench,
  Star,
  ShieldCheck,
  PhoneCall,
  MapPin,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Send,
  Sliders,
  DollarSign,
  Award,
  Zap,
  Building,
  Check,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { ContractorPro, SubscriptionPlanTier, AngiVendorRequest } from '../types';
import { DEFAULT_CONTRACTORS } from '../data/defaultContractors';

interface ContractorReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferredCategory?: string;
  deniedApplianceName?: string;
  failureDescription?: string;
  tradeFeeAvoided?: number;
  currentPlan?: SubscriptionPlanTier;
}

export const ContractorReferralModal: React.FC<ContractorReferralModalProps> = ({
  isOpen,
  onClose,
  preferredCategory = 'ALL',
  deniedApplianceName,
  failureDescription,
  tradeFeeAvoided = 100,
  currentPlan = 'basic',
}) => {
  // Angi Matching Wizard State
  const [selectedCategory, setSelectedCategory] = useState<string>(preferredCategory);
  const [zipCode, setZipCode] = useState('75001');
  const [urgency, setUrgency] = useState<'URGENT_24H' | 'NEXT_2_3_DAYS' | 'FLEXIBLE'>('URGENT_24H');
  const [projectNotes, setProjectNotes] = useState(
    failureDescription || (deniedApplianceName ? `Repair / diagnostic for ${deniedApplianceName}` : 'Home appliance/HVAC repair')
  );

  // Multi-Pro 1-Click Quote & Booking State
  const [selectedProIds, setSelectedProIds] = useState<string[]>([]);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [batchDispatched, setBatchDispatched] = useState<AngiVendorRequest | null>(null);
  const [bookedProId, setBookedProId] = useState<string | null>(null);
  const [quoteSuccessMessage, setQuoteSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPros = DEFAULT_CONTRACTORS.filter((pro) => {
    if (selectedCategory === 'ALL') return true;
    return (
      pro.category.toLowerCase() === selectedCategory.toLowerCase() ||
      selectedCategory.toLowerCase().includes(pro.category.toLowerCase())
    );
  });

  const toggleSelectPro = (id: string) => {
    setSelectedProIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBookSinglePro = (pro: ContractorPro) => {
    setBookedProId(pro.id);
    setQuoteSuccessMessage(
      `Instant dispatch notification sent to ${pro.company}. Their on-call technician will reach out within ${pro.averageResponseTime} with exclusive CoverScope partner pricing!`
    );
    setTimeout(() => {
      setBookedProId(null);
    }, 4000);
  };

  const handleRequestBatchQuotes = () => {
    setIsSubmittingBatch(true);
    const prosToRequest = selectedProIds.length > 0 ? selectedProIds : filteredPros.slice(0, 3).map((p) => p.id);

    setTimeout(() => {
      setIsSubmittingBatch(false);
      const newRequest: AngiVendorRequest = {
        id: `ANGI-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleTimeString(),
        category: selectedCategory,
        projectScope: projectNotes,
        zipCode,
        urgency,
        requestedProIds: prosToRequest,
        homeownerName: 'Homeowner',
        homeownerPhone: '(555) 234-5678',
        estimatedCostRange: '$220 – $750',
        status: 'DISPATCHED',
      };
      setBatchDispatched(newRequest);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-900 overflow-hidden">
        {/* Angi Branded Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black text-xl">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                  <span>Angi</span>
                  <span className="text-amber-400 font-medium text-sm">Verified Vendor Network</span>
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Licensed & Background Checked</span>
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {deniedApplianceName ? (
                  <>Compare top-rated local pros for <strong>{deniedApplianceName}</strong> • Save your ${tradeFeeAvoided} non-refundable dispatch fee</>
                ) : (
                  'Instant quote requests and direct technician booking with Angi certified contractors.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Batch Quotes Dispatched Success State */}
          {batchDispatched ? (
            <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-sm animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900">
                  Angi Quote Requests Dispatched to {batchDispatched.requestedProIds.length} Verified Pros!
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your project request <strong>#{batchDispatched.id}</strong> has been routed to top-rated local pros in <strong>ZIP {batchDispatched.zipCode}</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-lg mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Request Number:</span>
                  <span className="font-mono font-bold text-slate-900">{batchDispatched.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Project Scope:</span>
                  <span className="font-semibold text-slate-800">{batchDispatched.projectScope}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Urgency Level:</span>
                  <span className="font-bold text-rose-700">
                    {batchDispatched.urgency === 'URGENT_24H' ? '🚨 Immediate (Within 24 Hours)' : '🗓️ Standard (Next 2-3 Days)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Expected Callbacks:</span>
                  <span className="font-bold text-emerald-700">Under 15–30 minutes</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setBatchDispatched(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Modify Request / View Pros
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Savings & Angi Cost Guide Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 font-bold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Saved ${tradeFeeAvoided} Non-Refundable Warranty Fee
                      </h4>
                      <p className="text-xs text-slate-600">
                        Instead of forfeiting ${tradeFeeAvoided} to a denied warranty claim, book verified Angi pros with upfront transparent rates.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center space-y-1 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Angi Local Price Guide</span>
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    $180 – $650 <span className="text-[11px] font-normal text-slate-500">avg Dallas project</span>
                  </span>
                </div>
              </div>

              {/* Angi Project Configuration Bar (Scope, Zip, Urgency) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Angi Match Criteria & Project Scope
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Pre-filled from CoverScope diagnostic</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Category */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Service Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="ALL">All Verified Trades</option>
                      <option value="Plumbing">Plumbing & Water Heaters</option>
                      <option value="HVAC">HVAC, AC & Heating</option>
                      <option value="Appliances">Major Appliances</option>
                      <option value="Electrical">Electrical & Panels</option>
                      <option value="Roofing">Roofing & Leak Detection</option>
                    </select>
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>ZIP Code / Area</span>
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="e.g. 75001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-medium focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Project Urgency</span>
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="URGENT_24H">🚨 Urgent (Within 24 Hours)</option>
                      <option value="NEXT_2_3_DAYS">🗓️ Within 2–3 Days</option>
                      <option value="FLEXIBLE">🔍 Flexible / Gathering Quotes</option>
                    </select>
                  </div>
                </div>

                {/* Project Description Input */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Issue Description for Contractors</label>
                  <input
                    type="text"
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    placeholder="e.g. Rheem water heater leaking from bottom valve"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 1-Click Multi-Pro Batch Dispatch Card (Angi Signature Feature) */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 font-black text-sm uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Angi 1-Click Multi-Quote Dispatch</span>
                  </div>
                  <p className="text-xs text-slate-900 font-medium">
                    Send your project details to top {selectedProIds.length > 0 ? selectedProIds.length : Math.min(3, filteredPros.length)} rated local pros simultaneously to receive competing quotes instantly.
                  </p>
                </div>

                <button
                  onClick={handleRequestBatchQuotes}
                  disabled={isSubmittingBatch || filteredPros.length === 0}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer hover:scale-105"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>
                    {isSubmittingBatch
                      ? 'Dispatching Requests...'
                      : `Request ${selectedProIds.length > 0 ? selectedProIds.length : Math.min(3, filteredPros.length)} Free Quotes Now`}
                  </span>
                </button>
              </div>

              {/* Single Quote Success Message Toast */}
              {quoteSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{quoteSuccessMessage}</span>
                </div>
              )}

              {/* Verified Angi Pros List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Top Rated Angi Certified Pros ({filteredPros.length} Available in {zipCode})
                  </h4>
                  <span className="text-[11px] text-slate-500">Select pros to request quotes or book directly</span>
                </div>

                <div className="space-y-3.5">
                  {filteredPros.map((pro) => {
                    const isSelected = selectedProIds.includes(pro.id);
                    return (
                      <div
                        key={pro.id}
                        className={`bg-white border rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs ${
                          isSelected ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Pro Info */}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectPro(pro.id)}
                              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                              title="Include in multi-quote request"
                            />
                            <h5 className="font-bold text-sm text-slate-900">{pro.company}</h5>
                            {pro.superServiceAward && (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-700" />
                                <span>Super Service Award</span>
                              </span>
                            )}
                            {pro.angiCertified && (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>Angi Certified</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{pro.rating}</span>
                              <span className="text-slate-400 font-normal">({pro.reviewCount} verified reviews)</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1 text-slate-600">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{pro.distanceMiles} miles away</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1 text-blue-600 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Responds in {pro.averageResponseTime}</span>
                            </div>
                            {pro.yearsInBusiness && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500">{pro.yearsInBusiness} yrs in business</span>
                              </>
                            )}
                          </div>

                          {/* Pricing & Specialty Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {pro.estimatedProjectRange && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                                🏷️ {pro.estimatedProjectRange}
                              </span>
                            )}
                            {pro.specialtyBadges.slice(0, 3).map((badge, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Booking & Call Actions */}
                        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0">
                          <button
                            onClick={() => handleBookSinglePro(pro)}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Request Free Quote</span>
                          </button>

                          <a
                            href={`tel:${pro.phone}`}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
                            <span>Call {pro.phone}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Angi-style verified contractor dispatch • Flat-rate upfront quotes</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
