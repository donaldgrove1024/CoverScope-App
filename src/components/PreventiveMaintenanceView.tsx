import React, { useState } from 'react';
import {
  Wrench,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Sparkles,
  ShieldCheck,
  Plus,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Flame,
  Wind,
  Droplet,
  Zap,
  Battery,
  Layers,
  ShoppingBag,
  Info,
  CalendarCheck,
  CalendarPlus,
  RefreshCw,
  HelpCircle,
  FileCheck2,
  HardHat,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PreventiveMaintenanceTask,
  PreventiveTaskCategory,
  MaintenanceLogEntry,
  WarrantyPolicy,
} from '../types';

interface PreventiveMaintenanceViewProps {
  tasks: PreventiveMaintenanceTask[];
  onUpdateTasks: (tasks: PreventiveMaintenanceTask[]) => void;
  activePolicy: WarrantyPolicy;
  onOpenContractorModal?: (trade: string) => void;
}

const CATEGORY_META: Record<
  PreventiveTaskCategory,
  { label: string; icon: React.FC<{ className?: string }>; color: string }
> = {
  HVAC_FILTERS: { label: 'Air Filters', icon: Wind, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  SMOKE_DETECTORS: { label: 'Smoke & CO', icon: Battery, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  HVAC_TUNEUP: { label: 'HVAC Tune-Up', icon: Flame, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  WATER_HEATER: { label: 'Water Heater', icon: Droplet, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  APPLIANCES: { label: 'Appliances', icon: Zap, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  PLUMBING: { label: 'Plumbing', icon: Droplet, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  SAFETY: { label: 'Safety & Vents', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  SEASONAL: { label: 'Seasonal Care', icon: Calendar, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  CUSTOM: { label: 'Custom Tasks', icon: Wrench, color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export const PreventiveMaintenanceView: React.FC<PreventiveMaintenanceViewProps> = ({
  tasks,
  onUpdateTasks,
  activePolicy,
  onOpenContractorModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Modals
  const [completingTask, setCompletingTask] = useState<PreventiveMaintenanceTask | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionCost, setCompletionCost] = useState('');
  const [completionPerson, setCompletionPerson] = useState('Donald Grove');
  const [completionReplaced, setCompletionReplaced] = useState('');

  // Add Task Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PreventiveTaskCategory>('HVAC_FILTERS');
  const [newFrequencyDays, setNewFrequencyDays] = useState(60);
  const [newSpecsSize, setNewSpecsSize] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDenialReason, setNewDenialReason] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  // Calendar / Notification banner toast
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Helper to calculate days until / days overdue
  const getTaskDueStatus = (task: PreventiveMaintenanceTask) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.nextDueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'OVERDUE' as const, days: Math.abs(diffDays), text: `${Math.abs(diffDays)} days overdue` };
    } else if (diffDays === 0) {
      return { status: 'DUE_TODAY' as const, days: 0, text: 'Due today!' };
    } else if (diffDays <= 7) {
      return { status: 'DUE_SOON' as const, days: diffDays, text: `Due in ${diffDays} days` };
    } else {
      return { status: 'GOOD' as const, days: diffDays, text: `Due in ${diffDays} days` };
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    const dueInfo = getTaskDueStatus(t);
    if (statusFilter === 'DUE' && (dueInfo.status === 'GOOD')) return false;
    if (statusFilter === 'COMPLETED' && (dueInfo.status === 'OVERDUE' || dueInfo.status === 'DUE_TODAY')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.specs.location?.toLowerCase().includes(q) ||
        t.specs.filterSize?.toLowerCase().includes(q) ||
        t.specs.batteryType?.toLowerCase().includes(q) ||
        t.whyWarrantyMatters.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Health Stats
  const totalTasks = tasks.length;
  const overdueCount = tasks.filter((t) => getTaskDueStatus(t).status === 'OVERDUE').length;
  const dueSoonCount = tasks.filter(
    (t) => getTaskDueStatus(t).status === 'DUE_TODAY' || getTaskDueStatus(t).status === 'DUE_SOON'
  ).length;
  const onTrackCount = totalTasks - overdueCount - dueSoonCount;
  const healthScore = Math.max(20, Math.round(((onTrackCount + dueSoonCount * 0.5) / (totalTasks || 1)) * 100));

  // Handle Mark Completed
  const handleConfirmCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTask) return;

    const todayStr = new Date().toISOString().split('T')[0];
    // Calculate next due date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + completingTask.frequencyDays);
    const nextDueStr = nextDate.toISOString().split('T')[0];

    const newLog: MaintenanceLogEntry = {
      id: `log-${Date.now()}`,
      date: todayStr,
      completedBy: completionPerson.trim() || 'Donald Grove',
      notes: completionNotes.trim() || 'Preventive task completed on schedule.',
      cost: completionCost ? parseFloat(completionCost) : undefined,
      replacedItems: completionReplaced.trim() || completingTask.specs.filterSize || completingTask.specs.batteryType,
    };

    const updated = tasks.map((t) => {
      if (t.id === completingTask.id) {
        return {
          ...t,
          lastCompletedDate: todayStr,
          nextDueDate: nextDueStr,
          logs: [newLog, ...t.logs],
        };
      }
      return t;
    });

    onUpdateTasks(updated);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    showToast(`✓ Completed "${completingTask.title}" and updated warranty audit log!`);
    setCompletingTask(null);
    setCompletionNotes('');
    setCompletionCost('');
    setCompletionReplaced('');
  };

  // Handle Add Custom Task
  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newFrequencyDays);
    const nextDueStr = nextDate.toISOString().split('T')[0];

    const newTask: PreventiveMaintenanceTask = {
      id: `pm-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      frequency: newFrequencyDays <= 30 ? 'MONTHLY' : newFrequencyDays <= 60 ? 'EVERY_60_DAYS' : newFrequencyDays <= 90 ? 'QUARTERLY' : newFrequencyDays <= 180 ? 'BI_ANNUAL' : 'ANNUAL',
      frequencyDays: newFrequencyDays,
      lastCompletedDate: todayStr,
      nextDueDate: nextDueStr,
      specs: {
        filterSize: newSpecsSize.trim() || undefined,
        location: newLocation.trim() || undefined,
        diyDifficulty: 'Easy (5 mins)',
      },
      whyWarrantyMatters: newDenialReason.trim() || 'Neglect of routine maintenance can void home warranty coverage on mechanical breakdowns.',
      instructionsStepByStep: newInstructions.trim() ? newInstructions.split('\n').filter(Boolean) : ['Perform regular inspection and service as specified.'],
      reminderEnabled: true,
      assignedRole: 'HOMEOWNER',
      logs: [
        {
          id: `log-${Date.now()}`,
          date: todayStr,
          completedBy: 'Donald Grove',
          notes: 'Task created and initial baseline established.',
        },
      ],
    };

    onUpdateTasks([newTask, ...tasks]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewSpecsSize('');
    setNewLocation('');
    setNewDenialReason('');
    setNewInstructions('');
    showToast(`✓ Added new maintenance task: "${newTask.title}"`);
  };

  // Handle Calendar Export / Sync
  const handleExportCalendar = (task: PreventiveMaintenanceTask) => {
    const title = encodeURIComponent(`CoverScope Maintenance: ${task.title}`);
    const details = encodeURIComponent(
      `Preventive Maintenance Task: ${task.title}\n\nLocation: ${task.specs.location || 'Home'}\nSpecs: ${task.specs.filterSize || task.specs.batteryType || 'Standard'}\n\nWhy It Matters: ${task.whyWarrantyMatters}\n\nLogged in CoverScope Warranty Defense Portal.`
    );
    const dateFormatted = task.nextDueDate.replace(/-/g, '');
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dateFormatted}/${dateFormatted}`;

    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
    showToast(`📅 Opened Google Calendar to schedule reminder for ${task.title}`);
  };

  // Handle Print / Export Proof Log
  const handleExportProofLog = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Banner */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Top Banner & Health Score */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Warranty Denial Protection Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Preventive Maintenance & Equipment Health
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track air filters, smoke alarm batteries, HVAC seasonal tune-ups, and routine flushes. Maintaining regular records gives you undeniable proof when filing claims with <strong className="text-white">{activePolicy.name}</strong>.
            </p>
          </div>

          {/* Health Score Gauge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    healthScore >= 80 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                  strokeDasharray={`${healthScore}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-white">{healthScore}%</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Home Care Score
              </span>
              <span className="text-sm font-bold text-white block">
                {healthScore >= 80 ? 'Optimal Protection' : healthScore >= 60 ? 'Attention Needed' : 'At-Risk Neglect'}
              </span>
              <span className="text-[11px] text-emerald-300 font-medium">
                {onTrackCount} on schedule • {dueSoonCount + overdueCount} action items
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Active Tasks</span>
            <span className="text-lg font-extrabold text-white">{totalTasks} Schedules</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Due Soon / Today</span>
            <span className="text-lg font-extrabold text-amber-400">{dueSoonCount} Pending</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Overdue Items</span>
            <span className="text-lg font-extrabold text-rose-400">{overdueCount} Overdue</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Verified Proof Logs</span>
            <span className="text-lg font-extrabold text-emerald-400">
              {tasks.reduce((acc, t) => acc + t.logs.length, 0)} Records
            </span>
          </div>
        </div>
      </div>

      {/* Action Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories ({tasks.length})
          </button>

          {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
            const count = tasks.filter((t) => t.category === catKey).length;
            if (count === 0 && catKey === 'CUSTOM') return null;
            const Icon = meta.icon;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === catKey
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{meta.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportProofLog}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Export full printable maintenance audit trail"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Trail PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Task</span>
          </button>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const catMeta = CATEGORY_META[task.category] || CATEGORY_META.CUSTOM;
          const CatIcon = catMeta.icon;
          const dueStatus = getTaskDueStatus(task);
          const isExpanded = expandedTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`bg-white rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between ${
                dueStatus.status === 'OVERDUE'
                  ? 'border-rose-200 hover:border-rose-300 ring-1 ring-rose-200/50'
                  : dueStatus.status === 'DUE_TODAY' || dueStatus.status === 'DUE_SOON'
                  ? 'border-amber-200 hover:border-amber-300'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-5 space-y-3.5">
                {/* Header Badge & Due Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${catMeta.color}`}>
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        {catMeta.label} • {task.frequency.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{task.title}</h3>
                    </div>
                  </div>

                  {/* Due Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      dueStatus.status === 'OVERDUE'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : dueStatus.status === 'DUE_TODAY'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse'
                        : dueStatus.status === 'DUE_SOON'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {dueStatus.status === 'OVERDUE' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                    {dueStatus.status === 'GOOD' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    <span>{dueStatus.text}</span>
                  </span>
                </div>

                {/* Specs / Filter size / Battery details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {task.specs.filterSize ? 'Filter Size' : task.specs.batteryType ? 'Battery Spec' : 'Equipment Spec'}
                    </span>
                    <span className="font-bold text-slate-800 truncate block">
                      {task.specs.filterSize || task.specs.batteryType || task.specs.modelNumber || 'Standard System'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                    <span className="font-semibold text-slate-700 truncate block">
                      {task.specs.location || 'Home Mechanical'}
                    </span>
                  </div>
                </div>

                {/* Why Warranty Matters Callout */}
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[11px] uppercase tracking-wider text-amber-950 block">
                      Why Warranty Requires This:
                    </span>
                    <p className="text-[11px] leading-relaxed text-amber-900">{task.whyWarrantyMatters}</p>
                  </div>
                </div>

                {/* Step by Step DIY Guidance (Collapsible) */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block mb-1.5">
                        Step-by-Step DIY Instructions:
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 leading-relaxed pl-1">
                        {task.instructionsStepByStep.map((step, idx) => (
                          <li key={idx} className="pl-1">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {task.productReorderTip && (
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="text-[11px] font-semibold">{task.productReorderTip}</span>
                        </div>
                      </div>
                    )}

                    {/* Past Logs for this task */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Audit History ({task.logs.length} logged):
                      </span>
                      <div className="space-y-1.5 max-h-28 overflow-y-auto">
                        {task.logs.map((log) => (
                          <div
                            key={log.id}
                            className="text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{log.date}</span> •{' '}
                              <span className="text-slate-600">{log.notes || 'Routine check'}</span>
                            </div>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {log.completedBy} {log.cost ? `($${log.cost})` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpanded ? 'Less' : 'Instructions & Logs'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Calendar Sync */}
                  <button
                    type="button"
                    onClick={() => handleExportCalendar(task)}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-600 hover:text-blue-600 transition cursor-pointer"
                    title="Add reminder to Google Calendar"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </button>

                  {/* Schedule Pro if category is HVAC tune-up */}
                  {task.category === 'HVAC_TUNEUP' && onOpenContractorModal && (
                    <button
                      type="button"
                      onClick={() => onOpenContractorModal('HVAC')}
                      className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <HardHat className="w-3.5 h-3.5" />
                      <span>Book Pro</span>
                    </button>
                  )}

                  {/* Mark Completed Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setCompletingTask(task);
                      setCompletionReplaced(task.specs.filterSize || task.specs.batteryType || '');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Done</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Proof-of-Maintenance Audit Trail Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Official Preventive Maintenance Audit Proof Log
              </h2>
              <p className="text-xs text-slate-500">
                Timestamped maintenance log required to refute "Prior Neglect" or "Lack of Maintenance" warranty claim denials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportProofLog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Audit Certificate</span>
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5 font-bold">Service Date</th>
                <th className="pb-2.5 font-bold">Equipment / Task</th>
                <th className="pb-2.5 font-bold">Completed By</th>
                <th className="pb-2.5 font-bold">Replaced Item / Specs</th>
                <th className="pb-2.5 font-bold">Technician Notes</th>
                <th className="pb-2.5 font-bold text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks
                .flatMap((t) =>
                  t.logs.map((log) => ({
                    ...log,
                    taskTitle: t.title,
                    category: t.category,
                  }))
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 font-bold text-slate-900 whitespace-nowrap">{log.date}</td>
                    <td className="py-3 font-semibold text-slate-800">{log.taskTitle}</td>
                    <td className="py-3 text-slate-600">{log.completedBy}</td>
                    <td className="py-3 font-mono text-[11px] text-slate-700">
                      {log.replacedItems || 'Inspection & Cleaning'}
                    </td>
                    <td className="py-3 text-slate-600 max-w-xs truncate">{log.notes || 'Routine service'}</td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      {log.cost !== undefined ? `$${log.cost.toFixed(2)}` : 'DIY ($0)'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Mark Task Completed */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-4 h-4 font-bold" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Log Maintenance Completion</h3>
                  <p className="text-[11px] text-slate-500">{completingTask.title}</p>
                </div>
              </div>
              <button
                onClick={() => setCompletingTask(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCompletion} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Completed By (Technician / Homeowner)</label>
                <input
                  type="text"
                  required
                  value={completionPerson}
                  onChange={(e) => setCompletionPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Replaced Item Details / Specs</label>
                <input
                  type="text"
                  value={completionReplaced}
                  onChange={(e) => setCompletionReplaced(e.target.value)}
                  placeholder="e.g. 1x Filtrete 20x25x1 MERV 11 Filter"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cost Incurred ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={completionCost}
                  onChange={(e) => setCompletionCost(e.target.value)}
                  placeholder="0.00 (Leave blank if DIY / no cost)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Notes & Condition</label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Replaced filter, vacuumed return box, airflow running smooth."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingTask(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save to Proof Log</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Task */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Plus className="w-4 h-4 font-bold" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Add Preventive Maintenance Task</h3>
                  <p className="text-[11px] text-slate-500">Configure recurring alerts and warranty audit proof</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Water Softener Salt Refill & Resin Clean"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as PreventiveTaskCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {Object.entries(CATEGORY_META).map(([k, meta]) => (
                      <option key={k} value={k}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency Interval</label>
                  <select
                    value={newFrequencyDays}
                    onChange={(e) => setNewFrequencyDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value={30}>Every 30 Days (Monthly)</option>
                    <option value={60}>Every 60 Days (2 Months)</option>
                    <option value={90}>Every 90 Days (Quarterly)</option>
                    <option value={180}>Every 180 Days (Bi-Annual)</option>
                    <option value={365}>Every 365 Days (Annual)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Part / Spec (Optional)</label>
                  <input
                    type="text"
                    value={newSpecsSize}
                    onChange={(e) => setNewSpecsSize(e.target.value)}
                    placeholder="e.g. 40lb Solar Naturals Salt"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location in Home</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Garage Utility Corner"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Why Warranty Requires This (Denial Risk)</label>
                <input
                  type="text"
                  value={newDenialReason}
                  onChange={(e) => setNewDenialReason(e.target.value)}
                  placeholder="e.g. Prevents valve corrosion and water hardness scale buildup."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Step-by-Step Instructions (One per line)</label>
                <textarea
                  rows={3}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="1. Check salt level in brine tank&#10;2. Break up salt bridges if necessary&#10;3. Add two 40lb bags of salt"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
