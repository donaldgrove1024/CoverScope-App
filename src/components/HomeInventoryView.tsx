import React, { useState } from 'react';
import {
  Home,
  Plus,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Camera,
  Layers,
  Lock,
  Zap,
  Info
} from 'lucide-react';
import { HomeApplianceItem, WarrantyPolicy, SubscriptionPlanTier } from '../types';

interface HomeInventoryViewProps {
  inventory: HomeApplianceItem[];
  activePolicy: WarrantyPolicy;
  currentPlan: SubscriptionPlanTier;
  onAddInventoryItem: (item: HomeApplianceItem) => void;
  onDeleteInventoryItem: (id: string) => void;
  onTriageItem: (item: HomeApplianceItem) => void;
  onOpenPricingModal: () => void;
}

export const HomeInventoryView: React.FC<HomeInventoryViewProps> = ({
  inventory,
  activePolicy,
  currentPlan,
  onAddInventoryItem,
  onDeleteInventoryItem,
  onTriageItem,
  onOpenPricingModal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('HVAC');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [installYear, setInstallYear] = useState(2020);
  const [lastServicedDate, setLastServicedDate] = useState('');
  const [conditionStatus, setConditionStatus] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'AT_RISK'>('GOOD');
  const [estimatedReplacementValue, setEstimatedReplacementValue] = useState(2000);
  const [notes, setNotes] = useState('');

  const currentYear = new Date().getFullYear();

  const isBasicLocked = currentPlan === 'basic' && inventory.length >= 2;

  const filteredInventory = inventory.filter((item) => {
    if (filterCategory === 'ALL') return true;
    return item.category.toLowerCase() === filterCategory.toLowerCase();
  });

  const totalAssetValue = inventory.reduce((sum, item) => sum + (item.estimatedReplacementValue || 0), 0);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim()) return;

    // Check if category is covered by policy
    const policyCovered = activePolicy.coverageItems.some(
      (c) =>
        (c.category.toLowerCase().includes(category.toLowerCase()) ||
          c.name.toLowerCase().includes(category.toLowerCase()) ||
          category.toLowerCase().includes(c.name.toLowerCase())) &&
        c.isCovered
    );

    const newItem: HomeApplianceItem = {
      id: `inv-${Date.now()}`,
      name,
      category,
      brand,
      modelNumber: modelNumber || undefined,
      serialNumber: serialNumber || undefined,
      location: location || undefined,
      installYear: Number(installYear) || 2020,
      lastServicedDate: lastServicedDate || undefined,
      conditionStatus,
      estimatedReplacementValue: Number(estimatedReplacementValue) || 1500,
      coveredUnderCurrentPolicy: policyCovered,
      coverageLimitDollar:
        category === 'HVAC'
          ? activePolicy.hvacLimit || 5000
          : activePolicy.applianceLimit || 2000,
      notes: notes || undefined,
    };

    onAddInventoryItem(newItem);
    setIsAddModalOpen(false);

    // Reset Form
    setName('');
    setBrand('');
    setModelNumber('');
    setSerialNumber('');
    setLocation('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                <span>Home Inventory Vault</span>
              </span>
              {currentPlan === 'premium' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Premium Unlimited
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Basic (2 Item Limit)
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Household Systems & Appliance Records
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Track serial stickers, equipment age, and pre-audited coverage under <strong>{activePolicy.name}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isBasicLocked ? (
              <button
                onClick={onOpenPricingModal}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Unlock Unlimited Inventory ($19.99/mo)</span>
              </button>
            ) : (
              <button
                id="btn-add-inventory-item"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Equipment / Appliance</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Tracked Equipment
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900">{inventory.length} units</div>
            <span className="text-[10px] text-slate-400">Audited in vault</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Estimated Asset Value
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ${totalAssetValue.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Total replacement cost</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Active Policy Cap
            </span>
            <div className="text-2xl font-bold font-mono text-blue-600">
              ${activePolicy.annualAggregateCap || 25000}
            </div>
            <span className="text-[10px] text-slate-400">Annual aggregate limit</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              High Risk / Aging
            </span>
            <div className="text-2xl font-bold font-mono text-amber-700">
              {inventory.filter((i) => i.conditionStatus === 'AT_RISK' || currentYear - i.installYear > 8).length} units
            </div>
            <span className="text-[10px] text-slate-400">&gt; 8 years old or wear flag</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'HVAC', 'Plumbing', 'Appliances', 'Laundry', 'Electrical'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Equipment' : cat}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInventory.map((item) => {
          const age = currentYear - item.installYear;
          const isAtRisk = item.conditionStatus === 'AT_RISK' || age >= 9;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          item.conditionStatus === 'EXCELLENT'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.conditionStatus === 'GOOD'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : item.conditionStatus === 'FAIR'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {item.conditionStatus} ({age} yrs old)
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {item.brand} {item.modelNumber ? `• Model #${item.modelNumber}` : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteInventoryItem(item.id)}
                    className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg transition"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Installed</span>
                    <span className="font-semibold text-slate-800">{item.installYear} ({age} yrs)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Est. Value</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      ${item.estimatedReplacementValue.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Location</span>
                    <span className="text-slate-700 truncate block">{item.location || 'Home'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Warranty Status</span>
                    <span
                      className={`font-bold ${
                        item.coveredUnderCurrentPolicy ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {item.coveredUnderCurrentPolicy ? 'Covered' : 'Excluded'}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-500 leading-relaxed italic bg-slate-50/50 p-2 rounded-xl">
                    "{item.notes}"
                  </p>
                )}

                {isAtRisk && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Denial Risk Warning:</strong> Older unit. Ensure maintenance records are saved before filing.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Fee: <strong className="text-slate-900 font-mono">${activePolicy.tradeServiceCallFee}</strong>
                </span>
                <button
                  id={`btn-triage-inv-${item.id}`}
                  onClick={() => onTriageItem(item)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Triage Issue With This Item →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Add Equipment / Appliance</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Equipment Name *</label>
                <input
                  required
                  placeholder="e.g. Central Air Conditioner Condenser"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HVAC">HVAC & Heating</option>
                    <option value="Plumbing">Plumbing & Water</option>
                    <option value="Appliances">Major Appliances</option>
                    <option value="Laundry">Washer / Dryer</option>
                    <option value="Electrical">Electrical Panel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Make *</label>
                  <input
                    required
                    placeholder="e.g. Carrier, Samsung, Whirlpool"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model Number</label>
                  <input
                    placeholder="e.g. 25VNA848A003"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Install Year</label>
                  <input
                    type="number"
                    min="1990"
                    max={currentYear}
                    value={installYear}
                    onChange={(e) => setInstallYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Condition Status</label>
                  <select
                    value={conditionStatus}
                    onChange={(e) => setConditionStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="EXCELLENT">Excellent (Like New)</option>
                    <option value="GOOD">Good (Normal Operation)</option>
                    <option value="FAIR">Fair (Minor Wear)</option>
                    <option value="AT_RISK">At Risk (High Age / Rust)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Est. Replacement ($)</label>
                  <input
                    type="number"
                    value={estimatedReplacementValue}
                    onChange={(e) => setEstimatedReplacementValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Maintenance / Condition Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Filters changed quarterly, capacitor replaced 2024..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
