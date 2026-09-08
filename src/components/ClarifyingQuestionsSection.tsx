import React, { useState, useRef } from 'react';
import {
  HelpCircle,
  Sparkles,
  Camera,
  Mic,
  MicOff,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  Tag,
  Calendar,
  Wrench,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ClarifyingQuestion } from '../types';
import { createSpeechRecognition, SpeechRecognitionHelper } from '../utils/audioRecorder';

interface ClarifyingQuestionsSectionProps {
  questions?: ClarifyingQuestion[];
  answers: Record<string, string>;
  make?: string;
  model?: string;
  manufacturerYear?: string;
  onAnswerChange: (questionId: string, answer: string) => void;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
  onYearChange: (year: string) => void;
  onRecalibrate: () => void;
  isRecalibrating: boolean;
  onScanTagPhoto?: (file: File) => void;
  isScanningTag?: boolean;
}

const COMMON_MAKES = [
  'Rheem',
  'A.O. Smith',
  'Bradford White',
  'Carrier',
  'Trane',
  'Lennox',
  'Whirlpool',
  'GE Appliances',
  'Samsung',
  'LG',
  'Bosch',
  'KitchenAid',
  'Maytag',
];

export const ClarifyingQuestionsSection: React.FC<ClarifyingQuestionsSectionProps> = ({
  questions,
  answers,
  make,
  model,
  manufacturerYear,
  onAnswerChange,
  onMakeChange,
  onModelChange,
  onYearChange,
  onRecalibrate,
  isRecalibrating,
  onScanTagPhoto,
  isScanningTag,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeVoiceQuestionId, setActiveVoiceQuestionId] = useState<string | null>(null);
  const tagFileInputRef = useRef<HTMLInputElement | null>(null);
  const speechHelperRef = useRef<SpeechRecognitionHelper | null>(null);

  // Initialize Speech
  React.useEffect(() => {
    speechHelperRef.current = createSpeechRecognition();
    return () => {
      if (speechHelperRef.current) speechHelperRef.current.stop();
    };
  }, []);

  const handleToggleVoiceForQuestion = (qId: string) => {
    if (!speechHelperRef.current) return;

    if (activeVoiceQuestionId === qId) {
      speechHelperRef.current.stop();
      setActiveVoiceQuestionId(null);
    } else {
      setActiveVoiceQuestionId(qId);
      speechHelperRef.current.start(
        (transcript) => {
          onAnswerChange(qId, transcript);
          if (qId === 'make') onMakeChange(transcript);
          if (qId === 'model') onModelChange(transcript);
        },
        () => setActiveVoiceQuestionId(null)
      );
    }
  };

  const handleTagFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onScanTagPhoto) {
      onScanTagPhoto(file);
    }
  };

  const defaultQuestions: ClarifyingQuestion[] = [
    {
      id: 'make_manufacturer',
      question: 'What is the make or manufacturer of the equipment?',
      category: 'MAKE_MODEL',
      quickOptions: ['Rheem', 'A.O. Smith', 'Whirlpool', 'GE', 'Carrier', 'Samsung / LG', 'Other'],
      whyItMatters: 'Certain manufacturer parts have specific trade caps or known factory recalls excluded by warranties.',
    },
    {
      id: 'model_age',
      question: 'Approximate age or model series?',
      category: 'MANUFACTURER_YEAR',
      quickOptions: ['< 3 Years (Under MFR Warranty)', '4 – 8 Years (Standard)', '9 – 12 Years', '13+ Years (End of Life)'],
      whyItMatters: 'Units under 1 year must be referred to manufacturer warranty first; units over 10-12 years have strict replacement caps.',
    },
    {
      id: 'leak_symptom_origin',
      question: 'Where specifically is the failure or leak occurring?',
      category: 'SYMPTOM_LOCATION',
      quickOptions: ['Top pipes / Supply valve', 'Bottom tank / Internal vessel', 'Drain pan / Condensate line', 'Control board / Electrical'],
      whyItMatters: 'External valves and piping are 100% covered; bottom tank corrosion or secondary water damage requires specific filing phrasing.',
    },
  ];

  const displayQuestions = questions && questions.length > 0 ? questions : defaultQuestions;
  const answeredCount = Object.keys(answers).filter((k) => Boolean(answers[k])).length + (make ? 1 : 0) + (model ? 1 : 0);

  return (
    <div className="bg-gradient-to-b from-blue-50/60 to-white border border-blue-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                Clarifying Questions for Precision Recommendation
              </h3>
              {answeredCount > 0 && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {answeredCount} Answered
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              Contract claims officers use make, model, and failure details to determine coverage caps and exclude pre-existing clauses.
            </p>
          </div>
        </div>

        {/* Scan Model Tag Shortcut */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-blue-700 text-xs font-bold cursor-pointer transition shadow-2xs">
            {isScanningTag ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{isScanningTag ? 'Reading Tag OCR...' : 'Scan Model Tag Photo'}</span>
            <input
              ref={tagFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleTagFileSelect}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          {/* Quick Make & Model Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-white border border-slate-200/90 rounded-2xl text-xs shadow-2xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Make / Brand</span>
              </label>
              <input
                type="text"
                value={make || answers['make'] || ''}
                onChange={(e) => {
                  onMakeChange(e.target.value);
                  onAnswerChange('make', e.target.value);
                }}
                placeholder="e.g. Rheem, Whirlpool, Carrier"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Model / Series Number</span>
              </label>
              <input
                type="text"
                value={model || answers['model'] || ''}
                onChange={(e) => {
                  onModelChange(e.target.value);
                  onAnswerChange('model', e.target.value);
                }}
                placeholder="e.g. PROG50-38N or 50 Gal Gas"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Manufacture Year / Age</span>
              </label>
              <input
                type="text"
                value={manufacturerYear || answers['year'] || ''}
                onChange={(e) => {
                  onYearChange(e.target.value);
                  onAnswerChange('year', e.target.value);
                }}
                placeholder="e.g. 2019 or ~5 years old"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Dynamic AI Clarifying Questions List */}
          <div className="space-y-3">
            {displayQuestions.map((q, idx) => {
              const currentVal = answers[q.id] || answers[q.question] || '';
              const isVoiceActive = activeVoiceQuestionId === q.id;

              return (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-2xs transition hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                          {q.question}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 pl-7">
                        <Info className="w-3 h-3 text-blue-500 shrink-0" />
                        <span><strong>Contract Impact:</strong> {q.whyItMatters}</span>
                      </p>
                    </div>

                    {/* Question Voice Answer Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleVoiceForQuestion(q.id)}
                      className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                        isVoiceActive
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                      title="Speak answer aloud"
                    >
                      {isVoiceActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span className="text-[10px] hidden sm:inline">
                        {isVoiceActive ? 'Listening...' : 'Voice'}
                      </span>
                    </button>
                  </div>

                  {/* 1-Tap Quick Answer Chips */}
                  {q.quickOptions && q.quickOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-7 pt-1">
                      {q.quickOptions.map((opt, optIdx) => {
                        const isSelected = currentVal.toLowerCase() === opt.toLowerCase();
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => onAnswerChange(q.id, opt)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                                : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Input for Custom Specifics */}
                  <div className="pl-7">
                    <input
                      type="text"
                      value={currentVal}
                      onChange={(e) => onAnswerChange(q.id, e.target.value)}
                      placeholder="Or type/speak specific detail..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recalibrate Action Button */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <span className="text-xs text-slate-500">
              Answering these details sharpens coverage certainty & eliminates denial risks.
            </span>

            <button
              type="button"
              disabled={isRecalibrating}
              onClick={onRecalibrate}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer hover:scale-[1.02]"
            >
              {isRecalibrating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Recalibrating Contract Evaluation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Update & Recalibrate Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
