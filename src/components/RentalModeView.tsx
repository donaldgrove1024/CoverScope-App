import React, { useState } from 'react';
import {
  Building2,
  Users,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PhoneCall,
  Mail,
  Send,
  Sparkles,
  Wrench,
  DollarSign,
  FileText,
  Plus,
  ArrowRight,
  Filter,
  Eye,
  Settings,
  HardHat,
  MessageSquare,
  Flame,
  Droplet,
  Zap,
  Home,
  UserCheck,
  Printer,
  ChevronRight,
  Phone,
  RefreshCw,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  RentalPropertySettings,
  RentalMaintenanceTicket,
  RentalTenantInfo,
  WarrantyPolicy,
  MaintenanceTicketStatus,
} from '../types';

interface RentalModeViewProps {
  rentalSettings: RentalPropertySettings;
  onUpdateRentalSettings: (settings: RentalPropertySettings) => void;
  tickets: RentalMaintenanceTicket[];
  onUpdateTickets: (tickets: RentalMaintenanceTicket[]) => void;
  activePolicy: WarrantyPolicy;
  onOpenContractorModal?: (trade: string) => void;
}

export const RentalModeView: React.FC<RentalModeViewProps> = ({
  rentalSettings,
  onUpdateRentalSettings,
  tickets,
  onUpdateTickets,
  activePolicy,
  onOpenContractorModal,
}) => {
  // Mode View: 'landlord' (Command Center) vs 'tenant_portal' (Generic public tenant reporting flow)
  const [viewPerspective, setViewPerspective] = useState<'landlord' | 'tenant_portal'>('landlord');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<RentalMaintenanceTicket | null>(null);

  // Copy feedback state
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Landlord Settings Modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editNickname, setEditNickname] = useState(rentalSettings.propertyNickname);
  const [editAddress, setEditAddress] = useState(rentalSettings.propertyAddress);
  const [editPMCompany, setEditPMCompany] = useState(rentalSettings.managementCompany);
  const [editPMPhone, setEditPMPhone] = useState(rentalSettings.pmPhone);
  const [editPMEmail, setEditPMEmail] = useState(rentalSettings.pmEmail);
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(rentalSettings.emergencyPhone);
  const [editAccessCode, setEditAccessCode] = useState(rentalSettings.genericAccessCode);
  const [editAutoDispatch, setEditAutoDispatch] = useState(rentalSettings.autoDispatchWarrantyIfCovered);

  // Tenant Portal Form State
  const [tenantName, setTenantName] = useState('Jessica Reynolds');
  const [tenantPhone, setTenantPhone] = useState('(214) 555-8491');
  const [tenantEmail, setTenantEmail] = useState('jess.reynolds@example.com');
  const [tenantUnit, setTenantUnit] = useState('Unit B');
  const [issueCategory, setIssueCategory] = useState('HVAC');
  const [issueAppliance, setIssueAppliance] = useState('Central Air Conditioner');
  const [issueSymptom, setIssueSymptom] = useState(
    'A/C blowing lukewarm air and fan running continuously. Indoor temp is 80°F.'
  );
  const [issueUrgency, setIssueUrgency] = useState<'EMERGENCY_24H' | 'URGENT_2_3_DAYS' | 'ROUTINE'>('URGENT_2_3_DAYS');
  const [isEvaluatingTriage, setIsEvaluatingTriage] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<RentalMaintenanceTicket | null>(null);

  // Add Timeline Note State
  const [newTimelineNote, setNewTimelineNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/?rental=${rentalSettings.genericAccessUrlSlug}&code=${rentalSettings.genericAccessCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    showToast('✓ Copied Generic Tenant Portal Link to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rentalSettings.genericAccessCode);
    setCopiedCode(true);
    showToast('✓ Copied Access PIN to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Landlord 1-Click Approve Warranty Dispatch
  const handleApproveWarrantyDispatch = (ticket: RentalMaintenanceTicket) => {
    const now = new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const updatedTimeline = [
      ...ticket.timeline,
      {
        id: `tl-${Date.now()}`,
        timestamp: now,
        title: 'Landlord Approved Warranty Claim Dispatch',
        notes: `Landlord approved ${activePolicy.provider} trade service call fee ($${ticket.tradeFeeAmount || activePolicy.tradeServiceCallFee}). Claim dispatched to network contractor.`,
        updatedBy: 'Landlord (Donald Grove)',
        type: 'approval' as const,
      },
    ];

    const updatedTicket: RentalMaintenanceTicket = {
      ...ticket,
      status: 'WARRANTY_DISPATCHED',
      landlordApproved: true,
      landlordApprovalNotes: 'Approved for warranty dispatch via CoverScope.',
      assignedContractor: `${activePolicy.provider} Priority Network Service`,
      timeline: updatedTimeline,
    };

    const newTickets = tickets.map((t) => (t.id === ticket.id ? updatedTicket : t));
    onUpdateTickets(newTickets);
    setSelectedTicket(updatedTicket);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    showToast(`✓ Dispatched warranty claim for Ticket #${ticket.ticketNumber}`);
  };

  // Landlord Mark Resolved
  const handleMarkResolved = (ticket: RentalMaintenanceTicket) => {
    const now = new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const updatedTimeline = [
      ...ticket.timeline,
      {
        id: `tl-${Date.now()}`,
        timestamp: now,
        title: 'Maintenance Issue Marked Resolved',
        notes: 'Repairs confirmed completed. Tenant notified.',
        updatedBy: 'Landlord / Property Manager',
        type: 'status' as const,
      },
    ];

    const updatedTicket: RentalMaintenanceTicket = {
      ...ticket,
      status: 'COMPLETED',
      timeline: updatedTimeline,
    };

    const newTickets = tickets.map((t) => (t.id === ticket.id ? updatedTicket : t));
    onUpdateTickets(newTickets);
    setSelectedTicket(updatedTicket);
    showToast(`✓ Ticket #${ticket.ticketNumber} marked resolved!`);
  };

  // Add Timeline Note
  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newTimelineNote.trim()) return;

    const now = new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newEntry = {
      id: `tl-${Date.now()}`,
      timestamp: now,
      title: 'Update / Coordination Note',
      notes: newTimelineNote.trim(),
      updatedBy: 'Property Management',
      type: 'comment' as const,
    };

    const updatedTicket: RentalMaintenanceTicket = {
      ...selectedTicket,
      timeline: [...selectedTicket.timeline, newEntry],
    };

    const newTickets = tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t));
    onUpdateTickets(newTickets);
    setSelectedTicket(updatedTicket);
    setNewTimelineNote('');
    setIsAddingNote(false);
    showToast('✓ Added update to ticket timeline');
  };

  // Handle Tenant Portal Submit Issue
  const handleTenantSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !issueSymptom.trim()) return;

    setIsEvaluatingTriage(true);

    setTimeout(() => {
      setIsEvaluatingTriage(false);

      // Check if covered under active policy
      const isHVAC = issueCategory.toLowerCase().includes('hvac') || issueAppliance.toLowerCase().includes('ac') || issueAppliance.toLowerCase().includes('air');
      const isPlumbing = issueCategory.toLowerCase().includes('plumb') || issueAppliance.toLowerCase().includes('water') || issueAppliance.toLowerCase().includes('drain');
      const isAppliance = issueCategory.toLowerCase().includes('appliance') || issueAppliance.toLowerCase().includes('fridge') || issueAppliance.toLowerCase().includes('dishwasher');

      const isCovered = isHVAC || isPlumbing || isAppliance;
      const tktNum = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const newTicket: RentalMaintenanceTicket = {
        id: `tkt-${Date.now()}`,
        ticketNumber: tktNum,
        propertyAddress: rentalSettings.propertyAddress,
        unitNumber: tenantUnit || 'Unit B',
        reportedBy: {
          name: tenantName.trim(),
          phone: tenantPhone.trim(),
          email: tenantEmail.trim(),
          role: 'TENANT',
        },
        createdAt: nowStr,
        category: issueCategory,
        applianceOrArea: issueAppliance,
        symptomDescription: issueSymptom.trim(),
        urgency: issueUrgency,
        photos: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
        ],
        isCoveredByWarranty: isCovered,
        warrantyCoverageExplanation: isCovered
          ? `Likely covered under landlord's ${activePolicy.name} policy. Eligible for $${activePolicy.tradeServiceCallFee} Trade Service Call Dispatch.`
          : 'Appears to be non-warranty standard property repair. Routed to Property Manager.',
        responsibility: isCovered ? 'WARRANTY_ELIGIBLE' : 'LANDLORD',
        status: rentalSettings.autoDispatchWarrantyIfCovered && isCovered ? 'WARRANTY_DISPATCHED' : 'OPEN',
        estimatedCostRange: isCovered
          ? `$${activePolicy.tradeServiceCallFee} Service Fee (Retail cost $350 - $1,200)`
          : '$150 - $400 estimated standard repair',
        tradeFeeAmount: activePolicy.tradeServiceCallFee,
        warrantyProviderName: activePolicy.name,
        landlordApproved: rentalSettings.autoDispatchWarrantyIfCovered && isCovered,
        landlordApprovalNotes: rentalSettings.autoDispatchWarrantyIfCovered && isCovered
          ? 'Auto-approved via Landlord Autonomous Warranty Rule.'
          : undefined,
        assignedContractor:
          rentalSettings.autoDispatchWarrantyIfCovered && isCovered
            ? `${activePolicy.provider} On-Call Network Pro`
            : undefined,
        scheduledServiceDate: 'Pending Dispatch Window',
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: nowStr,
            title: 'Maintenance Request Submitted by Tenant',
            notes: `${tenantName} submitted ticket via Generic Portal (${tenantUnit}).`,
            updatedBy: 'Tenant Portal',
            type: 'status',
          },
          {
            id: `tl-${Date.now() + 1}`,
            timestamp: nowStr,
            title: 'CoverScope AI Coverage Triage Analyzed',
            notes: isCovered
              ? `High-confidence warranty coverage detected under ${activePolicy.name}. Trade fee: $${activePolicy.tradeServiceCallFee}.`
              : 'Maintenance request forwarded to Landlord and Property Management team.',
            updatedBy: 'CoverScope AI',
            type: 'status',
          },
        ],
      };

      onUpdateTickets([newTicket, ...tickets]);
      setSubmittedTicket(newTicket);

      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }, 1000);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: RentalPropertySettings = {
      ...rentalSettings,
      propertyNickname: editNickname,
      propertyAddress: editAddress,
      managementCompany: editPMCompany,
      pmPhone: editPMPhone,
      pmEmail: editPMEmail,
      emergencyPhone: editEmergencyPhone,
      genericAccessCode: editAccessCode,
      autoDispatchWarrantyIfCovered: editAutoDispatch,
    };
    onUpdateRentalSettings(updated);
    setIsSettingsModalOpen(false);
    showToast('✓ Rental property settings saved successfully!');
  };

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    if (selectedStatusFilter === 'ALL') return true;
    if (selectedStatusFilter === 'ACTION_NEEDED') return t.status === 'OPEN' || t.status === 'LANDLORD_REVIEW';
    if (selectedStatusFilter === 'DISPATCHED') return t.status === 'WARRANTY_DISPATCHED' || t.status === 'PRO_SCHEDULED' || t.status === 'IN_PROGRESS';
    if (selectedStatusFilter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Perspective Toggle: Landlord vs Generic Tenant Portal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                {rentalSettings.propertyNickname}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                Rental Mode Active
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-sm sm:max-w-md">
              {rentalSettings.propertyAddress} • {rentalSettings.managementCompany}
            </p>
          </div>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewPerspective('landlord')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              viewPerspective === 'landlord'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-indigo-600" />
            <span>Landlord & PM Hub</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewPerspective('tenant_portal');
              setSubmittedTicket(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              viewPerspective === 'tenant_portal'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tenant Public Portal</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. LANDLORD & PROPERTY MANAGER HUB VIEW                                   */}
      {/* ========================================================================= */}
      {viewPerspective === 'landlord' && (
        <div className="space-y-6">
          {/* Generic Tenant Access Link & QR Code Banner */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Generic Tenant & Property Management Access</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Seamless Tenant Maintenance Triage
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Share this portal with your tenants or property management staff. They can report AC outages, leaks, and appliance failures without seeing your personal billing details. CoverScope checks your <strong className="text-white">{activePolicy.name}</strong> warranty and auto-dispatches covered repairs.
                </p>
              </div>

              {/* Portal Access Credentials Box */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-2xl space-y-3 shrink-0 lg:max-w-md w-full">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block mb-1">
                    Tenant Access Portal Link
                  </span>
                  <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10 text-xs">
                    <span className="text-indigo-200 font-mono truncate flex-1 select-all">
                      https://coverscope.app/rental/{rentalSettings.genericAccessUrlSlug}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Generic Tenant PIN
                    </span>
                    <span className="text-base font-extrabold text-white font-mono tracking-wider">
                      {rentalSettings.genericAccessCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy PIN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="p-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-white transition cursor-pointer"
                      title="Edit Rental Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Property Management Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Active Tenants</span>
                <span className="text-lg font-extrabold text-white">
                  {rentalSettings.activeTenants.length} Occupants
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Open Tickets</span>
                <span className="text-lg font-extrabold text-amber-400">
                  {tickets.filter((t) => t.status !== 'COMPLETED').length} Active
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Auto-Dispatch</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  {rentalSettings.autoDispatchWarrantyIfCovered ? 'Enabled' : 'Manual'}
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Warranty Trade Copay</span>
                <span className="text-lg font-extrabold text-indigo-300">
                  ${activePolicy.tradeServiceCallFee} Flat Fee
                </span>
              </div>
            </div>
          </div>

          {/* Tickets Queue Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedStatusFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Tickets ({tickets.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatusFilter('ACTION_NEEDED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedStatusFilter === 'ACTION_NEEDED'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Action Needed ({tickets.filter((t) => t.status === 'OPEN' || t.status === 'LANDLORD_REVIEW').length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatusFilter('DISPATCHED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedStatusFilter === 'DISPATCHED'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                In Progress ({tickets.filter((t) => t.status === 'WARRANTY_DISPATCHED' || t.status === 'PRO_SCHEDULED').length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatusFilter('COMPLETED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedStatusFilter === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Resolved ({tickets.filter((t) => t.status === 'COMPLETED').length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setViewPerspective('tenant_portal');
                setSubmittedTicket(null);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-500/20 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Log Tenant Incident</span>
            </button>
          </div>

          {/* Tickets Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top Row: Ticket ID, Category, Urgency, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-extrabold text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                          {ticket.ticketNumber}
                        </span>
                        <span className="font-extrabold text-sm text-slate-900">
                          {ticket.applianceOrArea}
                        </span>
                        {ticket.unitNumber && (
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                            {ticket.unitNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Urgency Badge */}
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            ticket.urgency === 'EMERGENCY_24H'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : ticket.urgency === 'URGENT_2_3_DAYS'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {ticket.urgency === 'EMERGENCY_24H'
                            ? 'Emergency (24h)'
                            : ticket.urgency === 'URGENT_2_3_DAYS'
                            ? 'Urgent (2-3 Days)'
                            : 'Standard Routine'}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            ticket.status === 'WARRANTY_DISPATCHED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : ticket.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {ticket.status === 'WARRANTY_DISPATCHED' && <Clock className="w-3 h-3 animate-spin text-blue-600" />}
                          {ticket.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{ticket.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Symptom Description & Reported By */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                      <div className="lg:col-span-2 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Tenant Issue Report:
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          {ticket.symptomDescription}
                        </p>

                        {/* AI Warranty Triage Analysis */}
                        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-900 block">
                              CoverScope Warranty Evaluation:
                            </span>
                            <p className="text-xs leading-relaxed text-indigo-900">
                              {ticket.warrantyCoverageExplanation}
                            </p>
                            <div className="flex items-center gap-3 pt-1 font-bold text-[11px]">
                              <span className="text-emerald-700">
                                Trade Fee: ${ticket.tradeFeeAmount || activePolicy.tradeServiceCallFee}
                              </span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-600">{ticket.estimatedCostRange}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Details & Assigned Pro */}
                      <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Reported By
                          </span>
                          <span className="font-bold text-slate-900 block">{ticket.reportedBy.name}</span>
                          <span className="text-slate-600 block">{ticket.reportedBy.phone}</span>
                          <span className="text-slate-400 text-[11px] font-mono block">{ticket.reportedBy.email}</span>
                        </div>

                        {ticket.assignedContractor && (
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Assigned Contractor
                            </span>
                            <span className="font-bold text-indigo-800 block truncate">{ticket.assignedContractor}</span>
                            {ticket.scheduledServiceDate && (
                              <span className="text-slate-600 text-[11px] block">{ticket.scheduledServiceDate}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Activity Drawer */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Ticket Activity Log ({ticket.timeline.length} events)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsAddingNote(true);
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Note / Contractor Note</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {ticket.timeline.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 block">{entry.title}</span>
                              <p className="text-slate-600 text-[11px]">{entry.notes}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">{entry.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Landlord Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Reported: {ticket.createdAt}
                      </span>

                      <div className="flex items-center gap-2">
                        {ticket.status !== 'WARRANTY_DISPATCHED' && ticket.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => handleApproveWarrantyDispatch(ticket)}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>1-Click Approve Warranty Dispatch (${ticket.tradeFeeAmount || 100})</span>
                          </button>
                        )}

                        {ticket.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => handleMarkResolved(ticket)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GENERIC TENANT PUBLIC REPORTING PORTAL VIEW                             */}
      {/* ========================================================================= */}
      {viewPerspective === 'tenant_portal' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Tenant Portal Top Card */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Homeowner & Tenant Maintenance Portal
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                {rentalSettings.genericAccessCode}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Report Maintenance Issue
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {rentalSettings.propertyAddress} • Managed by {rentalSettings.managementCompany}
            </p>
          </div>

          {/* Success Confirmation Card if just submitted */}
          {submittedTicket ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-lg space-y-5 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Maintenance Request Submitted Successfully
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Ticket #{submittedTicket.ticketNumber}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your issue has been logged and analyzed by CoverScope. Confirmation sent to <strong>{submittedTicket.reportedBy.email}</strong>.
                </p>
              </div>

              {/* Status Box */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-left text-xs space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950">Warranty Coverage Status:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {submittedTicket.isCoveredByWarranty ? 'Covered by Warranty' : 'Routed to Landlord'}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{submittedTicket.warrantyCoverageExplanation}</p>
                <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Emergency Dispatch Contact:</span>
                  <span className="font-bold text-indigo-900">{rentalSettings.emergencyPhone}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittedTicket(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Submit Another Request
                </button>

                <button
                  type="button"
                  onClick={() => setViewPerspective('landlord')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  Return to Landlord Hub
                </button>
              </div>
            </div>
          ) : (
            /* Tenant Issue Submission Form */
            <form
              onSubmit={handleTenantSubmitIssue}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5"
            >
              {/* Emergency Warning */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-950 block">Emergency Protocol:</span>
                  <p className="text-[11px] leading-relaxed">
                    If you smell natural gas, see active uncontainable water flooding, or have electrical sparking, immediately call emergency services and then our emergency dispatch at <strong className="text-amber-950 font-bold">{rentalSettings.emergencyPhone}</strong>.
                  </p>
                </div>
              </div>

              {/* Step 1: Contact Info & Unit */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-slate-900 block border-b border-slate-100 pb-1.5">
                  1. Tenant & Unit Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="e.g. Jessica Reynolds"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit Number / Area</label>
                    <input
                      type="text"
                      value={tenantUnit}
                      onChange={(e) => setTenantUnit(e.target.value)}
                      placeholder="e.g. Unit B / Main House"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      placeholder="(214) 555-0000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address (For Updates) *</label>
                    <input
                      type="email"
                      required
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      placeholder="jessica@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Issue Details */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-slate-900 block border-b border-slate-100 pb-1.5">
                  2. Maintenance Incident Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={issueCategory}
                      onChange={(e) => {
                        setIssueCategory(e.target.value);
                        if (e.target.value === 'HVAC') setIssueAppliance('Central Air Conditioner');
                        if (e.target.value === 'Plumbing') setIssueAppliance('Kitchen Sink & Disposal');
                        if (e.target.value === 'Kitchen Appliances') setIssueAppliance('Refrigerator & Freezer');
                        if (e.target.value === 'Water Heater') setIssueAppliance('50-Gallon Water Heater');
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="HVAC">Heating, Ventilation & Air Conditioning (HVAC)</option>
                      <option value="Plumbing">Plumbing, Drains & Toilets</option>
                      <option value="Kitchen Appliances">Kitchen Appliances (Fridge, Oven, Dishwasher)</option>
                      <option value="Water Heater">Water Heater (Hot Water Outage)</option>
                      <option value="Electrical">Electrical (Breakers, Outlets, Switches)</option>
                      <option value="Structural & Safety">Doors, Windows & Smoke Alarms</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Specific Equipment / Area</label>
                    <input
                      type="text"
                      value={issueAppliance}
                      onChange={(e) => setIssueAppliance(e.target.value)}
                      placeholder="e.g. Central Air Conditioner"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-bold text-slate-700 mb-1">
                    Describe What Happened / Symptoms *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={issueSymptom}
                    onChange={(e) => setIssueSymptom(e.target.value)}
                    placeholder="Describe what is failing, any error codes, noises, leaks, or when the problem started..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                  />
                </div>

                <div className="text-xs">
                  <label className="block font-bold text-slate-700 mb-1">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setIssueUrgency('ROUTINE')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                        issueUrgency === 'ROUTINE'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs">Standard</span>
                      <span className="text-[10px] opacity-75">3-5 business days</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIssueUrgency('URGENT_2_3_DAYS')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                        issueUrgency === 'URGENT_2_3_DAYS'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs">Urgent</span>
                      <span className="text-[10px] opacity-75">Next 24-48 hrs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIssueUrgency('EMERGENCY_24H')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                        issueUrgency === 'EMERGENCY_24H'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs">Emergency</span>
                      <span className="text-[10px] opacity-75">Immediate 24h</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isEvaluatingTriage}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-500/25 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isEvaluatingTriage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Warranty Policy & Dispatching Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Maintenance Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Modal: Edit Rental Property Settings */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Rental Property Configuration</h3>
                  <p className="text-[11px] text-slate-500">Manage PM contact and generic tenant access codes</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Property Nickname</label>
                <input
                  type="text"
                  required
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Property Full Street Address</label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Management Company Name</label>
                  <input
                    type="text"
                    value={editPMCompany}
                    onChange={(e) => setEditPMCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">PM Phone Number</label>
                  <input
                    type="text"
                    value={editPMPhone}
                    onChange={(e) => setEditPMPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PM Maintenance Email</label>
                  <input
                    type="email"
                    value={editPMEmail}
                    onChange={(e) => setEditPMEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Dispatch Phone</label>
                  <input
                    type="text"
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Generic Access PIN / Code</label>
                  <input
                    type="text"
                    value={editAccessCode}
                    onChange={(e) => setEditAccessCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAutoDispatch}
                      onChange={(e) => setEditAutoDispatch(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800 text-[11px]">
                      Auto-dispatch if covered by warranty ($100 copay)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Note to Selected Ticket */}
      {isAddingNote && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Add Timeline Note</h3>
                <p className="text-[11px] text-slate-500">Ticket #{selectedTicket.ticketNumber} ({selectedTicket.applianceOrArea})</p>
              </div>
              <button onClick={() => setIsAddingNote(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTimelineNote} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Update / Action Details</label>
                <textarea
                  rows={3}
                  required
                  value={newTimelineNote}
                  onChange={(e) => setNewTimelineNote(e.target.value)}
                  placeholder="e.g. Spoke with All-Star Heating tech. Part ordered, delivery expected tomorrow afternoon."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
