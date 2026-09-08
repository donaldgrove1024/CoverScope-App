import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, HelpCircle, ArrowRight, Wrench, ShieldAlert } from 'lucide-react';

interface DiagnosticQuestion {
  id: string;
  category: string;
  question: string;
  hint: string;
  options: { label: string; impactText: string; isRisk: boolean }[];
}

const DIAGNOSTIC_QUESTIONS: Record<string, DiagnosticQuestion[]> = {
  HVAC: [
    {
      id: 'hvac-q1',
      category: 'HVAC',
      question: 'Is the outdoor condenser fan spinning when the thermostat calls for cool?',
      hint: 'A humming sound with a stationary fan usually indicates a failed start/run capacitor (Covered mechanical failure).',
      options: [
        { label: 'Yes, fan is spinning rapidly', impactText: 'Airflow is active, checking compressor and refrigerant lines', isRisk: false },
        { label: 'No, fan is stopped but unit hums', impactText: 'Strong indication of failed run capacitor (covered standard repair)', isRisk: false },
        { label: 'No sound and no fan movement', impactText: 'Potential breaker trip, thermostat wiring, or blown fuse', isRisk: false },
      ],
    },
    {
      id: 'hvac-q2',
      category: 'HVAC',
      question: 'Is there visible ice or frost on the copper suction line or indoor coil?',
      hint: 'Frost indicates either low refrigerant (leaking evaporator coil) or severe dirty air filter restriction.',
      options: [
        { label: 'No ice visible anywhere', impactText: 'Normal thermal transfer profile', isRisk: false },
        { label: 'Yes, thick ice on pipes or coil', impactText: 'Check air filter immediately; replace filter before tech visit so carrier cannot claim lack of maintenance!', isRisk: true },
      ],
    },
    {
      id: 'hvac-q3',
      category: 'HVAC',
      question: 'When was the air filter last replaced?',
      hint: 'Warranty adjusters frequently ask to inspect the filter to deny claims for "improper maintenance".',
      options: [
        { label: 'Within the last 1–3 months (Clean)', impactText: 'Maintenance defense is strong', isRisk: false },
        { label: 'More than 6 months ago (Dirty)', impactText: 'WARNING: Put a brand new clean filter in before technician arrives!', isRisk: true },
      ],
    },
  ],
  Plumbing: [
    {
      id: 'plumb-q1',
      category: 'Plumbing',
      question: 'Is the water heater leaking from the bottom seam or a top valve?',
      hint: 'Tank seam failures indicate tank rupture (wear & tear). Rust/corrosion on external tank is often excluded.',
      options: [
        { label: 'Dripping from Temperature & Pressure (T&P) valve', impactText: 'T&P relief valve is covered mechanical component', isRisk: false },
        { label: 'Ruptured from bottom base seam', impactText: 'Total tank failure; covered under standard appliance caps ($2,000)', isRisk: false },
        { label: 'Rust pinhole on outer metal shell', impactText: 'High risk of corrosion exclusion clause', isRisk: true },
      ],
    },
    {
      id: 'plumb-q2',
      category: 'Plumbing',
      question: 'Is there secondary water damage to drywall, subflooring, or carpets?',
      hint: 'Most warranties STRICTLY EXCLUDE consequential secondary water damage. Never ask warranty carrier to fix drywall!',
      options: [
        { label: 'No, contained in drain pan or bucket', impactText: 'Clean claim with zero secondary damage dispute', isRisk: false },
        { label: 'Yes, damaged adjacent floor or baseboard', impactText: 'DO NOT mention damaged flooring on the initial warranty call; file that separately with homeowners insurance.', isRisk: true },
      ],
    },
  ],
  Appliances: [
    {
      id: 'app-q1',
      category: 'Appliances',
      question: 'Did the issue begin abruptly or has it been degrading for months?',
      hint: 'Saying an issue has happened for months triggers the "Pre-Existing Condition" or "Neglected Condition" auto-denial trap.',
      options: [
        { label: 'Failed suddenly during standard use', impactText: 'Ideal phrasing for warranty claims filing', isRisk: false },
        { label: 'Intermittent issues over the past 4 months', impactText: 'CRITICAL: State that it worked until the sudden failure event!', isRisk: true },
      ],
    },
    {
      id: 'app-q2',
      category: 'Appliances',
      question: 'Have you attempted any DIY disassembly or unbolting parts?',
      hint: 'Unauthorized repair attempts void manufacturer and warranty carrier liability.',
      options: [
        { label: 'No, only checked breaker and power plug', impactText: 'Clean claim without unauthorized modification risk', isRisk: false },
        { label: 'Yes, opened motor housing or rewired', impactText: 'Ensure all factory panels are cleanly reassembled before tech arrival.', isRisk: true },
      ],
    },
  ],
};

interface DiagnosticFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  onApplyAnswers: (additionalDetails: string) => void;
}

export const DiagnosticFollowUpModal: React.FC<DiagnosticFollowUpModalProps> = ({
  isOpen,
  onClose,
  category,
  onApplyAnswers,
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const matchedQuestions =
    DIAGNOSTIC_QUESTIONS[category] || DIAGNOSTIC_QUESTIONS['Appliances'];

  const currentQ = matchedQuestions[currentQuestionIdx];

  const handleSelectOption = (optionLabel: string, impact: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.question]: `${optionLabel} (${impact})`,
    }));

    if (currentQuestionIdx < matchedQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      // Completed all
      const summaryText = Object.entries({
        ...selectedAnswers,
        [currentQ.question]: `${optionLabel} (${impact})`,
      })
        .map(([q, a]) => `[Diagnostic Question: ${q}] Answer: ${a}`)
        .join('\n');

      onApplyAnswers(summaryText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">Master Tech Diagnostic Assistant</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Step {currentQuestionIdx + 1} of {matchedQuestions.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Technician triage questions to rule out denial traps before you file.
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

        {/* Question Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              {currentQ.category} Diagnostic Question
            </span>
            <h4 className="text-base font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h4>
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{currentQ.hint}</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(opt.label, opt.impactText)}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-start justify-between gap-3 group ${
                  opt.isRisk
                    ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-100/50 hover:border-amber-300'
                    : 'border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 shadow-2xs'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block">
                    {opt.label}
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-relaxed">
                    {opt.impactText}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-1 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Question {currentQuestionIdx + 1} of {matchedQuestions.length}</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Skip Follow-Up
          </button>
        </div>
      </div>
    </div>
  );
};
