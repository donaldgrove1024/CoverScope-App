import React, { useEffect, useState, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  X,
  HelpCircle,
} from 'lucide-react';
import { TriageVerdict, WarrantyPolicy } from '../types';

export type VoiceIntentType = 'CONFIRM_SUBMIT' | 'CONFIRM_VENDOR' | 'DISMISS_SAVE' | 'CLARIFY' | 'UNKNOWN';

interface StickyActionHeaderProps {
  verdict: TriageVerdict;
  activePolicy: WarrantyPolicy;
  isSpeaking: boolean;
  isListening: boolean;
  onToggleVoiceListening: () => void;
  onToggleAudioMute: () => void;
  isMuted: boolean;
  onSubmitClaim: () => void;
  onLocateVendor: () => void;
  onDismissToVault: () => void;
  onScrollToClarifications?: () => void;
  spokenTranscript?: string;
  detectedIntent?: { type: VoiceIntentType; label: string; rawText: string } | null;
  vadSecondsLeft?: number;
  speechSupported?: boolean;
}

export const StickyActionHeader: React.FC<StickyActionHeaderProps> = ({
  verdict,
  activePolicy,
  isSpeaking,
  isListening,
  onToggleVoiceListening,
  onToggleAudioMute,
  isMuted,
  onSubmitClaim,
  onLocateVendor,
  onDismissToVault,
  onScrollToClarifications,
  spokenTranscript = '',
  detectedIntent = null,
  vadSecondsLeft = 5,
  speechSupported = true,
}) => {
  const isCovered = verdict.status === 'LIKELY_COVERED';
  const isDenied = verdict.status === 'LIKELY_DENIED';
  const isAmbiguous = verdict.status === 'AMBIGUOUS';

  const [showVoiceTips, setShowVoiceTips] = useState(false);
  const [dismissToast, setDismissToast] = useState<string | null>(null);

  // Status-based theme styling
  const statusTheme = isCovered
    ? {
        headerBg: 'bg-slate-900/95 border-emerald-500/40 shadow-emerald-950/40',
        badgeBg: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
        badgeIcon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        badgeText: 'Likely Covered',
        actionBtnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30',
        actionLabel: 'Submit Service Request',
        actionIcon: <Send className="w-4 h-4" />,
        subText: `$${activePolicy.tradeServiceCallFee} Trade Fee`,
        promptSuggestion: 'Say "Yes" or "Submit it"',
      }
    : isDenied
    ? {
        headerBg: 'bg-slate-900/95 border-rose-500/40 shadow-rose-950/40',
        badgeBg: 'bg-rose-500/20 border-rose-400/40 text-rose-300',
        badgeIcon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
        badgeText: 'Likely Denied / Excluded',
        actionBtnBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/30',
        actionLabel: 'Locate Local Vetted Vendor',
        actionIcon: <Wrench className="w-4 h-4" />,
        subText: `Save $${activePolicy.tradeServiceCallFee} Dispatch Fee`,
        promptSuggestion: 'Say "Yes" or "Find a vendor"',
      }
    : {
        headerBg: 'bg-slate-900/95 border-amber-500/40 shadow-amber-950/40',
        badgeBg: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
        badgeIcon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        badgeText: 'Conditional Coverage',
        actionBtnBg: 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30',
        actionLabel: 'Submit Service Request',
        actionIcon: <Send className="w-4 h-4" />,
        subText: 'Requires diagnostic code',
        promptSuggestion: 'Say "Submit" or "Clarify"',
      };

  return (
    <header
      id="coverscope-sticky-action-header"
      className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-all duration-300 shadow-xl ${statusTheme.headerBg} -mx-4 sm:-mx-6 px-4 sm:px-6 py-3`}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Area: Outcome Status Badge & Appliance Name */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${statusTheme.badgeBg}`}
            >
              {statusTheme.badgeIcon}
              <span>{statusTheme.badgeText}</span>
            </span>

            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-white block truncate max-w-[200px] lg:max-w-[280px]">
                {verdict.detectedAppliance?.name || 'Appliance Diagnosis'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {verdict.confidenceScore}% Contract Match • {activePolicy.provider}
              </span>
            </div>
          </div>

          {/* Quick Voice / Audio Controls for Mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={onToggleAudioMute}
              className={`p-2 rounded-xl border text-xs font-bold transition ${
                isSpeaking
                  ? 'bg-blue-600 text-white border-blue-500 animate-pulse'
                  : isMuted
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title={isMuted ? 'Unmute voice' : 'Mute voice'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {speechSupported && (
              <button
                type="button"
                onClick={onToggleVoiceListening}
                className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-400 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title={isListening ? 'Stop listening' : 'Start hands-free voice agent'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Center Area: Hands-Free Multimodal Voice Indicator & Live Waveform */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
          {/* Visual Voice State Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all ${
              isListening
                ? 'bg-slate-800/90 border-blue-400/50 shadow-md shadow-blue-500/10'
                : isSpeaking
                ? 'bg-slate-800/90 border-emerald-400/50'
                : 'bg-slate-800/50 border-slate-700/80 text-slate-400'
            }`}
          >
            {/* Pulsing Mic Button */}
            {speechSupported ? (
              <button
                type="button"
                id="sticky-header-mic-toggle-btn"
                onClick={onToggleVoiceListening}
                className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 ring-2 ring-rose-400/50'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                title={isListening ? 'Tap to pause voice listening' : 'Tap to speak hands-free'}
              >
                {isListening ? (
                  <>
                    <Mic className="w-4 h-4 z-10" />
                    <span className="absolute inset-0 rounded-xl bg-rose-500 animate-ping opacity-30" />
                  </>
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </button>
            ) : null}

            {/* Micro Waveform Bars */}
            <div className="flex items-center gap-0.5 h-4 px-1" title={isListening ? 'Voice Listener Active' : 'Waveform'}>
              <span
                className={`w-1 rounded-full transition-all duration-150 ${
                  isListening
                    ? 'bg-blue-400 animate-[bounce_0.6s_infinite_100ms] h-3.5'
                    : isSpeaking
                    ? 'bg-emerald-400 animate-[bounce_0.8s_infinite_150ms] h-3'
                    : 'bg-slate-600 h-1.5'
                }`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-150 ${
                  isListening
                    ? 'bg-blue-400 animate-[bounce_0.6s_infinite_200ms] h-4'
                    : isSpeaking
                    ? 'bg-emerald-400 animate-[bounce_0.8s_infinite_250ms] h-4'
                    : 'bg-slate-600 h-2'
                }`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-150 ${
                  isListening
                    ? 'bg-cyan-400 animate-[bounce_0.6s_infinite_300ms] h-3'
                    : isSpeaking
                    ? 'bg-emerald-400 animate-[bounce_0.8s_infinite_350ms] h-2.5'
                    : 'bg-slate-600 h-1'
                }`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-150 ${
                  isListening
                    ? 'bg-cyan-400 animate-[bounce_0.6s_infinite_150ms] h-4'
                    : isSpeaking
                    ? 'bg-emerald-400 animate-[bounce_0.8s_infinite_200ms] h-3.5'
                    : 'bg-slate-600 h-1.5'
                }`}
              />
            </div>

            {/* Voice Status Text */}
            <div className="text-left text-xs pr-1">
              {isSpeaking ? (
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
                  <span>AI Advisor Speaking...</span>
                </div>
              ) : isListening ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-blue-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    Listening
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">({vadSecondsLeft}s)</span>
                  <span className="text-slate-400 hidden lg:inline">• {statusTheme.promptSuggestion}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onToggleVoiceListening}
                  className="text-[11px] text-slate-400 hover:text-slate-200 font-medium transition cursor-pointer"
                >
                  Hands-Free Voice Standby • <span className="text-blue-400 font-bold">Tap Mic</span>
                </button>
              )}

              {/* Spoken Transcript preview */}
              {spokenTranscript && (
                <div className="text-[10px] text-slate-300 font-mono truncate max-w-[180px] sm:max-w-[220px]">
                  "{spokenTranscript}"
                </div>
              )}
            </div>

            {/* Audio Voice Toggle on Desktop */}
            <button
              type="button"
              onClick={onToggleAudioMute}
              className={`hidden md:flex p-1.5 rounded-lg border text-xs font-bold transition ${
                isSpeaking
                  ? 'bg-blue-600 text-white border-blue-500 animate-pulse'
                  : isMuted
                  ? 'bg-slate-700/60 text-slate-400 border-slate-600 hover:text-slate-200'
                  : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:text-white'
              }`}
              title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Voice Prompt Help Popover Button */}
          <button
            type="button"
            onClick={() => setShowVoiceTips((prev) => !prev)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 text-xs transition"
            title="View voice commands"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Right Area: Primary Above-the-Fold Action Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Secondary Dismiss Button */}
          <button
            type="button"
            id="sticky-header-save-vault-btn"
            onClick={onDismissToVault}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Save evaluation to Policy Vault"
          >
            <Check className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Save to Vault</span>
            <span className="sm:hidden">Save</span>
          </button>

          {/* Primary Action Button (Conditional Rendering) */}
          {isCovered ? (
            <button
              type="button"
              id="sticky-header-submit-claim-btn"
              onClick={onSubmitClaim}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${statusTheme.actionBtnBg}`}
            >
              {statusTheme.actionIcon}
              <span>{statusTheme.actionLabel}</span>
              <span className="text-[11px] font-mono opacity-90 px-1.5 py-0.5 rounded-md bg-black/10">
                ${activePolicy.tradeServiceCallFee} Fee
              </span>
            </button>
          ) : isDenied ? (
            <button
              type="button"
              id="sticky-header-locate-vendor-btn"
              onClick={onLocateVendor}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${statusTheme.actionBtnBg}`}
            >
              {statusTheme.actionIcon}
              <span>{statusTheme.actionLabel}</span>
              <span className="text-[11px] font-bold opacity-90 px-1.5 py-0.5 rounded-md bg-black/10">
                Verified Pros
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 flex-1 md:flex-initial">
              {onScrollToClarifications && (
                <button
                  type="button"
                  onClick={onScrollToClarifications}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                >
                  Clarify
                </button>
              )}
              <button
                type="button"
                id="sticky-header-conditional-submit-btn"
                onClick={onSubmitClaim}
                className={`flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer hover:scale-[1.02] ${statusTheme.actionBtnBg}`}
              >
                {statusTheme.actionIcon}
                <span>Submit Service Request</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Voice Detected Intent Banner */}
      {detectedIntent && detectedIntent.type !== 'UNKNOWN' && (
        <div className="mt-2 bg-blue-600/90 text-white rounded-xl px-4 py-1.5 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>
              Voice Recognized: <strong className="underline decoration-yellow-300">"{detectedIntent.rawText}"</strong> → {detectedIntent.label}
            </span>
          </div>
          <span className="text-[10px] text-blue-200 uppercase tracking-wider font-mono">Executing...</span>
        </div>
      )}

      {/* Voice Commands Tip Dropdown / Card */}
      {showVoiceTips && (
        <div className="mt-2 bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-slate-200 max-w-lg mx-auto shadow-2xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-white border-b border-slate-700 pb-1">
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-blue-400" />
              <span>Hands-Free Spoken Voice Commands</span>
            </span>
            <button
              type="button"
              onClick={() => setShowVoiceTips(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
              <strong className="text-emerald-400 block mb-0.5">To Confirm Action:</strong>
              <span className="text-slate-300">"Yes", "Submit it", "Go ahead", "Find a vendor", "File claim", "Do it"</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
              <strong className="text-rose-400 block mb-0.5">To Dismiss / Save:</strong>
              <span className="text-slate-300">"No", "Not now", "Cancel", "I'll handle it", "Save to vault", "Skip"</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
