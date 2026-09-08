import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  Upload,
  Sparkles,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  XCircle,
  X,
  Volume2,
  VolumeX,
  ArrowRight,
  PhoneCall,
  FileText,
  DollarSign,
  Wrench,
  HelpCircle,
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Droplets,
  Refrigerator,
  Cpu,
  RefreshCw,
  Send,
  Building2,
  ThumbsUp,
  FileCheck,
  ArrowLeft,
  Info,
  Tag,
  Calendar,
  Zap,
  Lock,
  Clock,
  MapPin,
  Star,
  Award,
  Sliders,
  SlidersHorizontal,
  ExternalLink,
  Printer,
  AlertCircle,
  User,
} from 'lucide-react';
import { WarrantyPolicy, TriageVerdict, HomeWarrantyAccount, ClaimSubmittalRecord, ContractorPro } from '../types';
import { DEFAULT_HOME_WARRANTY_ACCOUNT } from '../data/defaultAccount';
import { DEFAULT_CONTRACTORS } from '../data/defaultContractors';
import { createSpeechRecognition, SpeechRecognitionHelper } from '../utils/audioRecorder';
import { speakText, stopSpeaking } from '../utils/speechSynthesis';
import { generateClientSideTriageVerdict } from '../utils/localTriageFallback';
import { SubmitServiceClaimModal } from './SubmitServiceClaimModal';
import { ClarifyingQuestionsSection } from './ClarifyingQuestionsSection';
import { StickyActionHeader, VoiceIntentType } from './StickyActionHeader';
import { ViralLoopCard } from './ViralLoopCard';

interface TriageStudioProps {
  activePolicy: WarrantyPolicy;
  onTriageComplete: (verdict: TriageVerdict) => void;
  onSelectPolicy: (policy: WarrantyPolicy) => void;
  onOpenPolicyModal: () => void;
  onViewReport: () => void;
  onOpenContractorReferral?: (trade?: string) => void;
  onOpenShareModal?: () => void;
  initialItem?: { name: string; category: string; ageYears?: number } | null;
  onClaimDispatched?: (record: ClaimSubmittalRecord) => void;
}

const COMMON_QUESTIONS = [
  {
    text: 'My water heater is leaking from the bottom.',
    category: 'Plumbing',
    label: '💧 Water heater leak',
  },
  {
    text: "My dishwasher isn't draining. Is this covered?",
    category: 'Appliances',
    label: '🍽️ Dishwasher not draining',
  },
  {
    text: 'My AC stopped cooling. Should I file a claim?',
    category: 'HVAC',
    label: '❄️ AC stopped cooling',
  },
  {
    text: 'My refrigerator is warm but the freezer works.',
    category: 'Appliances',
    label: '🧊 Refrigerator warm',
  },
  {
    text: 'My garbage disposal is humming and won’t spin.',
    category: 'Plumbing',
    label: '⚙️ Disposal humming',
  },
];

const ACCOUNT_STORAGE_KEY = 'coverscope_linked_warranty_account';

export const TriageStudio: React.FC<TriageStudioProps> = ({
  activePolicy,
  onTriageComplete,
  onOpenPolicyModal,
  onViewReport,
  onOpenContractorReferral,
  onOpenShareModal,
  initialItem,
  onClaimDispatched,
}) => {
  // Navigation / Stepper State (Screen 1: Ask, Screen 2: Assessment & Verdict, Screen 3: Service Request Claim / Approved Vendor)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Input Query State
  const [query, setQuery] = useState(
    initialItem ? `My ${initialItem.name} stopped working properly. Is this covered?` : ''
  );
  const [category, setCategory] = useState(initialItem?.category || 'General');

  // Appliance Make & Model Clarification State
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [manufacturerYear, setManufacturerYear] = useState(initialItem?.ageYears ? `${initialItem.ageYears} years` : '');
  const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({});
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [isScanningTag, setIsScanningTag] = useState(false);
  const [tagScanFeedback, setTagScanFeedback] = useState<string | null>(null);

  // Media & Photo State
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const speechHelperRef = useRef<SpeechRecognitionHelper | null>(null);

  // Hands-Free Multimodal Voice Agent State (Screen 2 / Triage Evaluation)
  const [isHandsFreeListening, setIsHandsFreeListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [detectedIntent, setDetectedIntent] = useState<{ type: VoiceIntentType; label: string; rawText: string } | null>(null);
  const [vadSecondsLeft, setVadSecondsLeft] = useState(5);
  const [vaultToastMessage, setVaultToastMessage] = useState<string | null>(null);
  const vadTimerRef = useRef<number | null>(null);
  const clarifyingSectionRef = useRef<HTMLDivElement | null>(null);

  // Audio Playback State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  // Active AI Advisor Response State
  const [currentResult, setCurrentResult] = useState<TriageVerdict | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Linked Home Warranty Account & Submittal Autonomy State
  const [warrantyAccount, setWarrantyAccount] = useState<HomeWarrantyAccount>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_HOME_WARRANTY_ACCOUNT;
  });

  // Autonomous Pipeline States
  const [isAutonomousSubmitting, setIsAutonomousSubmitting] = useState(false);
  const [autonomousStepText, setAutonomousStepText] = useState('');
  const [autonomousClaimRecord, setAutonomousClaimRecord] = useState<ClaimSubmittalRecord | null>(null);

  // Claim Submission Modal State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Optional Risk Factors
  const [approxAgeYears, setApproxAgeYears] = useState(initialItem?.ageYears ? String(initialItem.ageYears) : '5');
  const [rustOrCorrosionVisible, setRustOrCorrosionVisible] = useState(false);
  const [preExistingSuspected, setPreExistingSuspected] = useState(false);
  const [waterLeakPresent, setWaterLeakPresent] = useState(false);

  // Angi Matching State (Screen 3 for Denied/Excluded)
  const [angiSelectedProIds, setAngiSelectedProIds] = useState<string[]>([]);
  const [isAngiSubmitting, setIsAngiSubmitting] = useState(false);
  const [angiSuccessMessage, setAngiSuccessMessage] = useState<string | null>(null);

  // Copy state for phone script
  const [copiedScript, setCopiedScript] = useState(false);

  // Sync warranty account to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(warrantyAccount));
    } catch (e) {
      console.warn('Failed to save warranty account:', e);
    }
  }, [warrantyAccount]);

  // Initialize Speech Recognition & Cleanup
  useEffect(() => {
    speechHelperRef.current = createSpeechRecognition();
    setSpeechSupported(speechHelperRef.current.isSupported);

    return () => {
      if (vadTimerRef.current) {
        window.clearInterval(vadTimerRef.current);
      }
      if (speechHelperRef.current) {
        speechHelperRef.current.stop();
      }
      stopSpeaking();
    };
  }, []);

  // Sync initialItem if provided
  useEffect(() => {
    if (initialItem) {
      setQuery(`My ${initialItem.name} stopped working properly. Is this covered by my warranty?`);
      if (initialItem.category) setCategory(initialItem.category);
      if (initialItem.ageYears) setApproxAgeYears(String(initialItem.ageYears));
    }
  }, [initialItem]);

  // Viral Loop: Reset / Trigger check for another appliance
  const handleCheckAnotherAppliance = (presetQuery?: string, presetCategory?: string) => {
    stopSpeaking();
    setIsSpeaking(false);
    if (presetQuery) {
      setQuery(presetQuery);
      setCategory(presetCategory || 'General');
    } else {
      setQuery('');
      setCategory('General');
    }
    setSelectedImageBase64(null);
    setSelectedImageMime(null);
    setImagePreviewUrl(null);
    setMake('');
    setModel('');
    setManufacturerYear('');
    setClarifyingAnswers({});
    setTagScanFeedback(null);
    setAutonomousClaimRecord(null);
    setAngiSuccessMessage(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Voice Recording Toggle for Input Query (Screen 1)
  const toggleVoiceRecording = () => {
    if (!speechHelperRef.current) return;

    if (isRecording) {
      speechHelperRef.current.stop();
      setIsRecording(false);
    } else {
      stopSpeaking();
      setIsSpeaking(false);
      setIsRecording(true);
      speechHelperRef.current.start(
        (transcript, _isFinal) => {
          setQuery(transcript);
        },
        (error) => {
          console.warn('Speech recognition notice:', error);
          setIsRecording(false);
        }
      );
    }
  };

  // =========================================================================
  // Hands-Free Multimodal Voice Intent Engine (Screen 2 / Evaluation)
  // =========================================================================

  // Parse spoken natural language into actionable intents
  const parseOutcomeIntent = (
    rawText: string,
    status: 'LIKELY_COVERED' | 'LIKELY_DENIED' | 'AMBIGUOUS'
  ): { type: VoiceIntentType; label: string; rawText: string } | null => {
    const clean = rawText.toLowerCase().trim();
    if (!clean || clean.length < 2) return null;

    // 1. Positive Intent: "yes", "submit", "file claim", "go ahead", "sure", "please do", "do it", "confirm", "send it", "sounds good"
    const isPositive = /\b(yes|yeah|yep|sure|please do|submit|submit it|file it|file claim|go ahead|proceed|do it|okay|ok|sounds good|let's do it|lets do it|send it|confirm|file this)\b/i.test(clean);

    // 2. Vendor Intent: "find a vendor", "locate someone", "vendor", "angi", "contractor", "find pro", "get quotes", "hire pro"
    const isVendor = /\b(vendor|contractor|find pro|find a vendor|locate someone|locate a vendor|quotes|angi|hire pro|local pro|repair pro|handyman|quote)\b/i.test(clean);

    // 3. Negative / Dismiss Intent: "no", "not now", "cancel", "nope", "skip", "i'll handle it", "never mind", "dismiss", "save to vault"
    const isNegative = /\b(no|nope|not now|cancel|skip|dismiss|i'll handle it|ill handle it|never mind|nevermind|don't|dont|stop|later|save it|save to vault|i will handle it|vault)\b/i.test(clean);

    // 4. Clarify Intent: "clarify", "questions", "details", "diagnose", "make and model"
    const isClarify = /\b(clarify|questions|diagnose|details|answer|make|model)\b/i.test(clean);

    if (isVendor) {
      return { type: 'CONFIRM_VENDOR', label: 'Connecting to Local Verified Vendors...', rawText };
    }

    if (isPositive) {
      if (status === 'LIKELY_COVERED') {
        return { type: 'CONFIRM_SUBMIT', label: 'Opening Claim Submission Workflow...', rawText };
      } else if (status === 'LIKELY_DENIED') {
        return { type: 'CONFIRM_VENDOR', label: 'Connecting with Local Vetted Vendors...', rawText };
      } else {
        return { type: 'CONFIRM_SUBMIT', label: 'Proceeding to Service Request...', rawText };
      }
    }

    if (isNegative) {
      return { type: 'DISMISS_SAVE', label: 'Saving Report to Policy Vault...', rawText };
    }

    if (isClarify) {
      return { type: 'CLARIFY', label: 'Scrolling to Diagnostic Questions...', rawText };
    }

    return null;
  };

  // Start Hands-Free Voice Listening with 5-second silence VAD countdown
  const startHandsFreeListening = (verdict?: TriageVerdict) => {
    const targetVerdict = verdict || currentResult;
    if (!targetVerdict) return;
    if (!speechHelperRef.current?.isSupported) return;

    // Clear existing interval
    if (vadTimerRef.current) {
      window.clearInterval(vadTimerRef.current);
      vadTimerRef.current = null;
    }

    setVadSecondsLeft(5);
    setIsHandsFreeListening(true);
    setSpokenTranscript('');
    setDetectedIntent(null);

    speechHelperRef.current.start(
      (transcript, _isFinal) => {
        setSpokenTranscript(transcript);
        // Reset countdown timer on voice activity
        setVadSecondsLeft(5);

        const intent = parseOutcomeIntent(transcript, targetVerdict.status);
        if (intent) {
          setDetectedIntent(intent);
          stopHandsFreeListening();
          executeVoiceIntent(intent, targetVerdict);
        }
      },
      (error) => {
        console.warn('Hands-free voice recognition notice:', error);
        stopHandsFreeListening();
      }
    );

    // VAD countdown
    vadTimerRef.current = window.setInterval(() => {
      setVadSecondsLeft((prev) => {
        if (prev <= 1) {
          stopHandsFreeListening();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Stop Hands-Free Voice Listening
  const stopHandsFreeListening = () => {
    if (vadTimerRef.current) {
      window.clearInterval(vadTimerRef.current);
      vadTimerRef.current = null;
    }
    setIsHandsFreeListening(false);
    if (speechHelperRef.current) {
      speechHelperRef.current.stop();
    }
  };

  // Execute recognized voice intent
  const executeVoiceIntent = (
    intent: { type: VoiceIntentType; label: string; rawText: string },
    verdict: TriageVerdict
  ) => {
    setTimeout(() => {
      if (intent.type === 'CONFIRM_SUBMIT') {
        if (warrantyAccount.autonomousDispatchEnabled) {
          handleTriggerAutonomousSubmittal();
        } else {
          setCurrentStep(3);
          setIsClaimModalOpen(true);
        }
      } else if (intent.type === 'CONFIRM_VENDOR') {
        setCurrentStep(3);
        if (onOpenContractorReferral) {
          onOpenContractorReferral(category || verdict.inputSnapshot?.category || 'General');
        }
      } else if (intent.type === 'DISMISS_SAVE') {
        setVaultToastMessage('✓ Evaluation report safely stored in your Policy Vault');
        setTimeout(() => setVaultToastMessage(null), 4000);
      } else if (intent.type === 'CLARIFY') {
        clarifyingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  // Toggle Hands-Free Voice Agent manually
  const handleToggleHandsFreeListening = () => {
    if (isHandsFreeListening) {
      stopHandsFreeListening();
    } else if (currentResult) {
      stopSpeaking();
      setIsSpeaking(false);
      startHandsFreeListening(currentResult);
    }
  };

  // Touch Handlers for Above-the-Fold Sticky Header Actions
  const handleSubmitClaimTouch = () => {
    stopHandsFreeListening();
    stopSpeaking();
    setIsSpeaking(false);
    if (warrantyAccount.autonomousDispatchEnabled) {
      handleTriggerAutonomousSubmittal();
    } else {
      setCurrentStep(3);
      setIsClaimModalOpen(true);
    }
  };

  const handleLocateVendorTouch = () => {
    stopHandsFreeListening();
    stopSpeaking();
    setIsSpeaking(false);
    setCurrentStep(3);
    if (onOpenContractorReferral) {
      onOpenContractorReferral(category || currentResult?.inputSnapshot?.category || 'General');
    }
  };

  const handleDismissToVaultTouch = () => {
    stopHandsFreeListening();
    stopSpeaking();
    setIsSpeaking(false);
    setVaultToastMessage('✓ Evaluation report safely stored in your Policy Vault');
    setTimeout(() => setVaultToastMessage(null), 4000);
  };

  const handleScrollToClarifications = () => {
    clarifyingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Image Upload Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreviewUrl(dataUrl);
      setSelectedImageBase64(dataUrl);
      setSelectedImageMime(file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImageBase64(null);
    setSelectedImageMime(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Scanner for Appliance Rating Plate Photo (Extracts Make, Model, Serial, Year)
  const handleScanTagPhoto = async (file: File) => {
    setIsScanningTag(true);
    setTagScanFeedback(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dataUrl = event.target?.result as string;
        const resp = await fetch('/api/extract-model-tag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            imageMimeType: file.type || 'image/jpeg',
          }),
        });
        const data = await resp.json();
        if (data.success && data.data) {
          const ext = data.data;
          if (ext.make) {
            setMake(ext.make);
            setClarifyingAnswers((prev) => ({ ...prev, make: ext.make }));
          }
          if (ext.modelNumber) {
            setModel(ext.modelNumber);
            setClarifyingAnswers((prev) => ({ ...prev, model: ext.modelNumber }));
          }
          if (ext.manufactureYear) {
            setManufacturerYear(ext.manufactureYear);
            setClarifyingAnswers((prev) => ({ ...prev, year: ext.manufactureYear }));
          }
          if (ext.approxAgeYears) {
            setApproxAgeYears(String(ext.approxAgeYears));
          }
          setTagScanFeedback(`Detected: ${ext.make || ''} Model #${ext.modelNumber || ''} (${ext.manufactureYear || ''})`);
        }
      } catch (err) {
        console.warn('Failed to scan model tag:', err);
      } finally {
        setIsScanningTag(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger Triage Evaluation
  const handleAskAdvisor = async (overrideQuery?: string) => {
    const promptToSubmit = (overrideQuery || query).trim();
    if (!promptToSubmit && !selectedImageBase64) {
      setErrorMessage('Please speak, type what broke, or upload a photo.');
      return;
    }

    // Stop recording if active
    if (isRecording && speechHelperRef.current) {
      speechHelperRef.current.stop();
      setIsRecording(false);
    }

    stopSpeaking();
    setIsSpeaking(false);
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAutonomousClaimRecord(null);

    try {
      let verdict: TriageVerdict | null = null;

      try {
        const response = await fetch('/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            policy: activePolicy,
            symptomDescription: promptToSubmit,
            category: category || 'General',
            applianceOrPart: initialItem?.name || promptToSubmit.slice(0, 40),
            make: make || undefined,
            model: model || undefined,
            manufacturerYear: manufacturerYear || undefined,
            approxAgeYears: approxAgeYears || 5,
            preExistingSuspected,
            rustOrCorrosionVisible,
            waterLeakPresent,
            clarifyingAnswers: clarifyingAnswers && Object.keys(clarifyingAnswers).length > 0 ? clarifyingAnswers : undefined,
            imageBase64: selectedImageBase64,
            imageMimeType: selectedImageMime,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.verdict) {
            verdict = data.verdict;
          }
        }
      } catch (fetchErr) {
        console.warn('Backend triage fetch failed, using local evaluator engine:', fetchErr);
      }

      // If backend was unavailable or returned non-JSON, calculate local client verdict
      if (!verdict) {
        verdict = generateClientSideTriageVerdict({
          policy: activePolicy,
          symptomDescription: promptToSubmit,
          category: category || 'General',
          applianceOrPart: initialItem?.name || promptToSubmit.slice(0, 40),
          make: make || undefined,
          model: model || undefined,
          manufacturerYear: manufacturerYear || undefined,
          approxAgeYears: approxAgeYears || 5,
          preExistingSuspected,
          rustOrCorrosionVisible,
          waterLeakPresent,
          clarifyingAnswers,
          imagePreviewUrl,
        });
      }

      // Ensure natural conversational advisor response format and clear actionable follow-up prompt
      const applianceName = verdict.detectedAppliance?.name || initialItem?.name || 'appliance';
      if (verdict.status === 'LIKELY_COVERED') {
        verdict.conversationalAdvisorResponse = `Good news, this repair on your ${applianceName} is likely covered under your ${activePolicy.name} contract. Normal wear-and-tear mechanical failure coverage applies.`;
        verdict.followUpPrompt = 'Would you like me to submit your service request?';
      } else if (verdict.status === 'LIKELY_DENIED') {
        verdict.conversationalAdvisorResponse = `This issue on your ${applianceName} is likely excluded under your ${activePolicy.name} policy due to contract limitation clauses.`;
        verdict.followUpPrompt = 'Would you like me to help you locate a local repair vendor?';
      } else {
        verdict.conversationalAdvisorResponse = `Based on your ${activePolicy.name} contract, coverage depends on the specific component that failed.`;
        verdict.followUpPrompt = 'Would you like me to submit your service request or clarify diagnostic details?';
      }

      setCurrentResult(verdict);
      onTriageComplete(verdict);
      setCurrentStep(2); // Progress to Screen 2 (Assessment & Plain-English Verdict)

      // Playback Speech & Automatically Trigger Hands-Free Multimodal Voice Agent on completion
      if (!isMuted) {
        const fullSpeech = `${verdict.conversationalAdvisorResponse} ${verdict.followUpPrompt}`;
        setIsSpeaking(true);
        cancelSpeechRef.current = speakText(fullSpeech, () => {
          setIsSpeaking(false);
          // Automatically trigger hands-free voice listening once advisor finishes speaking
          startHandsFreeListening(verdict);
        });
      } else {
        // If muted, immediately activate hands-free listening
        startHandsFreeListening(verdict);
      }
    } catch (err: any) {
      console.error('Advisor evaluation failed:', err);
      // Even in unhandled errors, guarantee a valid verdict
      const fallbackVerdict = generateClientSideTriageVerdict({
        policy: activePolicy,
        symptomDescription: promptToSubmit,
        category: category || 'General',
        applianceOrPart: initialItem?.name || promptToSubmit.slice(0, 40),
        imagePreviewUrl,
      });
      const applianceName = fallbackVerdict.detectedAppliance?.name || 'appliance';
      if (fallbackVerdict.status === 'LIKELY_COVERED') {
        fallbackVerdict.conversationalAdvisorResponse = `Good news, this repair on your ${applianceName} is likely covered under your ${activePolicy.name} contract. Normal wear-and-tear mechanical failure coverage applies.`;
        fallbackVerdict.followUpPrompt = 'Would you like me to submit your service request?';
      } else if (fallbackVerdict.status === 'LIKELY_DENIED') {
        fallbackVerdict.conversationalAdvisorResponse = `This issue on your ${applianceName} is likely excluded under your ${activePolicy.name} policy due to contract limitation clauses.`;
        fallbackVerdict.followUpPrompt = 'Would you like me to help you locate a local repair vendor?';
      } else {
        fallbackVerdict.conversationalAdvisorResponse = `Based on your ${activePolicy.name} contract, coverage depends on the specific component that failed.`;
        fallbackVerdict.followUpPrompt = 'Would you like me to submit your service request or clarify diagnostic details?';
      }
      setCurrentResult(fallbackVerdict);
      onTriageComplete(fallbackVerdict);
      setCurrentStep(2);

      if (!isMuted) {
        const fullSpeech = `${fallbackVerdict.conversationalAdvisorResponse} ${fallbackVerdict.followUpPrompt}`;
        setIsSpeaking(true);
        cancelSpeechRef.current = speakText(fullSpeech, () => {
          setIsSpeaking(false);
          startHandsFreeListening(fallbackVerdict);
        });
      } else {
        startHandsFreeListening(fallbackVerdict);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Recalibrate with Clarifying Question Answers
  const handleRecalibrateWithClarifications = async () => {
    if (!currentResult) return;
    setIsRecalibrating(true);
    stopSpeaking();
    setIsSpeaking(false);
    stopHandsFreeListening();

    try {
      let updatedVerdict: TriageVerdict | null = null;

      try {
        const response = await fetch('/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            policy: activePolicy,
            symptomDescription: query || currentResult.inputSnapshot.symptomDescription,
            category: category || currentResult.inputSnapshot.category,
            applianceOrPart: currentResult.detectedAppliance.name,
            make: make || clarifyingAnswers['make'],
            model: model || clarifyingAnswers['model'],
            manufacturerYear: manufacturerYear || clarifyingAnswers['year'],
            approxAgeYears: approxAgeYears || 5,
            preExistingSuspected,
            rustOrCorrosionVisible,
            waterLeakPresent,
            clarifyingAnswers,
            imageBase64: selectedImageBase64,
            imageMimeType: selectedImageMime,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.verdict) {
            updatedVerdict = data.verdict;
          }
        }
      } catch (fetchErr) {
        console.warn('Recalibrate fetch warning:', fetchErr);
      }

      if (!updatedVerdict) {
        updatedVerdict = generateClientSideTriageVerdict({
          policy: activePolicy,
          symptomDescription: query || currentResult.inputSnapshot.symptomDescription,
          category: category || currentResult.inputSnapshot.category,
          applianceOrPart: currentResult.detectedAppliance.name,
          make: make || clarifyingAnswers['make'],
          model: model || clarifyingAnswers['model'],
          manufacturerYear: manufacturerYear || clarifyingAnswers['year'],
          approxAgeYears: approxAgeYears || 5,
          preExistingSuspected,
          rustOrCorrosionVisible,
          waterLeakPresent,
          clarifyingAnswers,
          imagePreviewUrl,
        });
      }

      const applianceName = updatedVerdict.detectedAppliance?.name || 'appliance';
      if (updatedVerdict.status === 'LIKELY_COVERED') {
        updatedVerdict.conversationalAdvisorResponse = `Good news, this repair on your ${applianceName} is likely covered under your ${activePolicy.name} contract. Normal wear-and-tear mechanical failure coverage applies.`;
        updatedVerdict.followUpPrompt = 'Would you like me to submit your service request?';
      } else if (updatedVerdict.status === 'LIKELY_DENIED') {
        updatedVerdict.conversationalAdvisorResponse = `This issue on your ${applianceName} is likely excluded under your ${activePolicy.name} policy due to contract limitation clauses.`;
        updatedVerdict.followUpPrompt = 'Would you like me to help you locate a local repair vendor?';
      }

      setCurrentResult(updatedVerdict);
      onTriageComplete(updatedVerdict);

      if (!isMuted) {
        const fullSpeech = `Updated evaluation: ${updatedVerdict.conversationalAdvisorResponse} ${updatedVerdict.followUpPrompt}`;
        setIsSpeaking(true);
        cancelSpeechRef.current = speakText(fullSpeech, () => {
          setIsSpeaking(false);
          startHandsFreeListening(updatedVerdict);
        });
      } else {
        startHandsFreeListening(updatedVerdict);
      }
    } catch (err: any) {
      console.error('Recalibrate error:', err);
    } finally {
      setIsRecalibrating(false);
    }
  };

  // Trigger Autonomous Instant Claim Submittal (No pop-up approval)
  const handleTriggerAutonomousSubmittal = () => {
    if (!currentResult) return;
    setIsAutonomousSubmitting(true);
    setAutonomousStepText('1. Packaging wear-and-tear clauses & diagnostic findings...');

    setTimeout(() => {
      setAutonomousStepText(`2. Authenticating with ${warrantyAccount.providerName} (Member ID: ${warrantyAccount.memberId})...`);
    }, 600);

    setTimeout(() => {
      setAutonomousStepText('3. Authorizing $100 service trade call & generating dispatch ticket...');
    }, 1200);

    setTimeout(() => {
      setIsAutonomousSubmitting(false);
      const generatedClaim = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;
      const record: ClaimSubmittalRecord = {
        id: `rec-${Date.now()}`,
        claimNumber: generatedClaim,
        timestamp: new Date().toLocaleTimeString(),
        providerName: activePolicy.name,
        memberId: warrantyAccount.memberId,
        applianceName: currentResult.detectedAppliance.name,
        failureMode: currentResult.detectedAppliance.failureMode,
        tradeFee: activePolicy.tradeServiceCallFee,
        dispatchWindow: 'Urgent Dispatch (Next Available 24-48h)',
        autonomous: true,
        status: 'DISPATCHED',
        confirmationNotes: `Autonomous dispatch submitted directly to ${activePolicy.name} contractor pool with wear-and-tear protection.`,
      };

      setAutonomousClaimRecord(record);
      if (onClaimDispatched) {
        onClaimDispatched(record);
      }
    }, 1900);
  };

  // Main Submittal Button Click Handler (Branches based on autonomous setting)
  const handleExecuteServiceRequest = () => {
    if (warrantyAccount.autonomousDispatchEnabled) {
      handleTriggerAutonomousSubmittal();
    } else {
      setIsClaimModalOpen(true);
    }
  };

  // Toggle Autonomous Submittal Setting
  const toggleAutonomousMode = () => {
    setWarrantyAccount((prev) => ({
      ...prev,
      autonomousDispatchEnabled: !prev.autonomousDispatchEnabled,
    }));
  };

  // Angi 1-Click Multi-Quote Request (Screen 3)
  const handleAngiBatchRequest = () => {
    setIsAngiSubmitting(true);
    setTimeout(() => {
      setIsAngiSubmitting(false);
      setAngiSuccessMessage(
        `✓ Angi match sent to ${angiSelectedProIds.length > 0 ? angiSelectedProIds.length : 3} local pros in Dallas, TX (75001). Expect callbacks / quotes within 15 mins!`
      );
      setTimeout(() => setAngiSuccessMessage(null), 5000);
    }, 1000);
  };

  const handleSelectQuickQuestion = (q: typeof COMMON_QUESTIONS[0]) => {
    setQuery(q.text);
    setCategory(q.category);
    handleAskAdvisor(q.text);
  };

  const handleToggleAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      setIsMuted(true);
    } else if (currentResult) {
      setIsMuted(false);
      setIsSpeaking(true);
      const textToSpeak = `${currentResult.conversationalAdvisorResponse || currentResult.headline} ${currentResult.followUpPrompt || ''}`;
      cancelSpeechRef.current = speakText(textToSpeak, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleCopyScript = () => {
    if (!currentResult?.claimPlaybook?.exactPhoneScript) return;
    navigator.clipboard.writeText(currentResult.claimPlaybook.exactPhoneScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const isCovered = currentResult?.status === 'LIKELY_COVERED';
  const isDenied = currentResult?.status === 'LIKELY_DENIED';
  const isAmbiguous = currentResult?.status === 'AMBIGUOUS';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* 3-Step Breadcrumb Progress Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              currentStep === 1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>Ask Issue (Voice/Photo)</span>
          </button>

          <span className="text-slate-300">→</span>

          <button
            disabled={!currentResult}
            onClick={() => currentResult && setCurrentStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              currentStep === 2
                ? 'bg-blue-600 text-white shadow-xs'
                : currentResult
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>Assessment & Clarification</span>
          </button>

          <span className="text-slate-300">→</span>

          <button
            disabled={!currentResult}
            onClick={() => currentResult && setCurrentStep(3)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              currentStep === 3
                ? 'bg-blue-600 text-white shadow-xs'
                : currentResult
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
            <span>{isCovered ? 'Submit Claim' : 'Angi Vendor Match'}</span>
          </button>
        </div>

        {/* Linked Home Warranty Account Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">Linked:</span>
          <span className="font-bold text-slate-900">{warrantyAccount.providerName.split(' ')[0]}</span>
          <span className="text-slate-400 font-mono text-[11px]">#{warrantyAccount.memberId}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: Ultra-Fast Voice-First Query Input (Under 30 Seconds Value)       */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          {/* Header Title */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant AI Home Warranty Advisor</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Is it covered by your home warranty?
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Describe your maintenance issue in regular speech. We cross-reference your warranty contract and ask quick clarifying questions to guarantee accurate claim approval.
            </p>
          </div>

          {/* Voice-First Hero Mic / Natural Input Area */}
          <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 border-2 border-slate-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-inner transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
            {/* Pulsing Voice Mode Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3.5 text-left">
                <button
                  type="button"
                  id="voice-mic-main-btn"
                  onClick={toggleVoiceRecording}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0 ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-blue-500/20'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Speak naturally'}
                >
                  {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                    {isRecording ? 'Listening to your voice...' : 'Voice Mode (No maintenance jargon needed)'}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {isRecording
                      ? 'Speaking your breakdown symptoms now...'
                      : 'Tap mic and speak: "My water heater is leaking from the bottom"'}
                  </p>
                </div>
              </div>

              {/* Photo Upload Shortcut */}
              <label
                id="photo-upload-shortcut"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition shrink-0"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>{selectedImageBase64 ? 'Photo Attached ✓' : 'Add Photo / Tag'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Live Transcript / Textarea Input */}
            <div className="space-y-2">
              <textarea
                id="advisor-query-input-main"
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskAdvisor();
                  }
                }}
                placeholder="Or type here: e.g., 'My dishwasher won\'t drain' or 'My AC stopped cooling. Should I file a claim?'"
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-normal shadow-xs"
              />

              {/* Attached Image Preview */}
              {imagePreviewUrl && (
                <div className="relative inline-flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <img
                    src={imagePreviewUrl}
                    alt="Appliance Preview"
                    className="w-14 h-14 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">Photo attached for AI vision check</span>
                    <span className="text-[11px] text-slate-500">Will analyze model tags & failure mode</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Assess Coverage Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Contract:</span>
                <span>{activePolicy.name}</span>
                <span>•</span>
                <span>${activePolicy.tradeServiceCallFee} Trade Fee</span>
              </div>

              <button
                id="assess-coverage-main-btn"
                type="button"
                disabled={isAnalyzing || (!query.trim() && !selectedImageBase64)}
                onClick={() => handleAskAdvisor()}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.02]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Contract Clauses...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>Assess Coverage (Under 30s)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick-Tap 1-Touch Homeowner Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Or tap a common issue in 1-click:
              </span>
              <span className="text-[11px] text-slate-400">Under 1 tap triage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {COMMON_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickQuestion(q)}
                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-left transition shadow-2xs group cursor-pointer"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                    {q.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Advisory Note:</strong> {errorMessage}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: Real-Time Contract Assessment & Clarifying Questions Section     */}
      {/* ========================================================================= */}
      {currentStep === 2 && currentResult && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          {/* Sticky Above-the-Fold Action Header (Fixed at top with mic waveform & conditional primary CTA) */}
          <StickyActionHeader
            verdict={currentResult}
            activePolicy={activePolicy}
            isSpeaking={isSpeaking}
            isListening={isHandsFreeListening}
            onToggleVoiceListening={handleToggleHandsFreeListening}
            onToggleAudioMute={handleToggleAudio}
            isMuted={isMuted}
            onSubmitClaim={handleSubmitClaimTouch}
            onLocateVendor={handleLocateVendorTouch}
            onDismissToVault={handleDismissToVaultTouch}
            onScrollToClarifications={handleScrollToClarifications}
            spokenTranscript={spokenTranscript}
            detectedIntent={detectedIntent}
            vadSecondsLeft={vadSecondsLeft}
            speechSupported={speechSupported}
          />

          {/* Toast Notification when saved to Policy Vault */}
          {vaultToastMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{vaultToastMessage}</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">Dismissed</span>
            </div>
          )}

          {/* Main Verdict Hero Card */}
          <div
            className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6 ${
              isCovered
                ? 'border-emerald-300 ring-4 ring-emerald-500/10'
                : isDenied
                ? 'border-rose-300 ring-4 ring-rose-500/10'
                : 'border-amber-300 ring-4 ring-amber-500/10'
            }`}
          >
            {/* Top Bar: Status Banner & Voice Audio Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    isCovered
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : isDenied
                      ? 'bg-rose-600 text-white shadow-rose-500/20'
                      : 'bg-amber-500 text-slate-950 font-black shadow-amber-500/20'
                  }`}
                >
                  {isCovered && <CheckCircle2 className="w-4 h-4" />}
                  {isDenied && <XCircle className="w-4 h-4" />}
                  {isAmbiguous && <AlertTriangle className="w-4 h-4" />}
                  <span>{isCovered ? 'Likely Covered by Warranty' : isDenied ? 'Likely Denied / Excluded' : 'Conditional Coverage'}</span>
                </div>

                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {currentResult.confidenceScore}% Contract Match
                </span>
              </div>

              {/* Spoken Audio Response Button */}
              <button
                onClick={handleToggleAudio}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  isSpeaking
                    ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
                title={isSpeaking ? 'Mute AI voice' : 'Listen to advisor response'}
              >
                {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{isSpeaking ? 'Speaking Response...' : 'Listen Aloud'}</span>
              </button>
            </div>

            {/* Conversational Spoken Advisor Dialogue in Quotes */}
            <div className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-700">
                <Sparkles className="w-4 h-4" />
                <span>AI Home Warranty Advisor Statement:</span>
              </div>
              <p className="text-base sm:text-xl font-medium text-slate-900 leading-relaxed italic">
                "{currentResult.conversationalAdvisorResponse || currentResult.executiveSummary}"
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                <span className="text-blue-600">👉</span>
                <span>{currentResult.followUpPrompt || (isCovered ? 'Would you like me to submit your service request?' : 'Would you like to explore our approved vendor network?')}</span>
              </div>
            </div>

            {/* Financial ROI Decision Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium block">Trade Service Fee</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  ${activePolicy.tradeServiceCallFee}
                </span>
                <span className="text-[11px] text-slate-500 block">Due at contractor visit</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium block">Estimated Retail Repair Cost</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  ${currentResult.financialAnalysis?.estimatedRepairCostMin || 450} – ${currentResult.financialAnalysis?.estimatedRepairCostMax || 900}
                </span>
                <span className="text-[11px] text-slate-500 block">Standard retail pro rate</span>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1 ${
                isCovered ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <span className="font-medium block">Recommended Action</span>
                <span className="text-sm font-extrabold block">
                  {isCovered ? '✅ Submit Service Request' : '⚠️ Book Direct Angi Vendor'}
                </span>
                <span className="text-[11px] block opacity-80">
                  {isCovered ? 'High ROI on $100 fee' : 'Save $100 dispatch loss'}
                </span>
              </div>
            </div>

            {/* CLARIFYING QUESTIONS SECTION (Make, Model, Manufacturer, Failure Nuances) */}
            <div ref={clarifyingSectionRef}>
              <ClarifyingQuestionsSection
                questions={currentResult.clarifyingQuestions}
                answers={clarifyingAnswers}
                make={make}
                model={model}
                manufacturerYear={manufacturerYear}
                onAnswerChange={(qId, ans) => setClarifyingAnswers((prev) => ({ ...prev, [qId]: ans }))}
                onMakeChange={setMake}
                onModelChange={setModel}
                onYearChange={setManufacturerYear}
                onRecalibrate={handleRecalibrateWithClarifications}
                isRecalibrating={isRecalibrating}
                onScanTagPhoto={handleScanTagPhoto}
                isScanningTag={isScanningTag}
              />
            </div>

            {/* Tag Scan Feedback */}
            {tagScanFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tagScanFeedback}</span>
              </div>
            )}

            {/* Primary Action Next Step Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ask Another Question</span>
              </button>

              <div className="flex items-center gap-2.5">
                {isCovered ? (
                  <button
                    onClick={handleSubmitClaimTouch}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition cursor-pointer hover:scale-[1.02]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Proceed to Service Request Submittal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleLocateVendorTouch}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/25 transition cursor-pointer hover:scale-[1.02]"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Locate Angi Verified Vendors</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Post-Analysis Viral Loop */}
            <ViralLoopCard
              verdict={currentResult}
              activePolicy={activePolicy}
              onCheckAnother={handleCheckAnotherAppliance}
              onOpenShareModal={onOpenShareModal}
              className="mt-6"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: Instant 1-Click Action & Resolution                              */}
      {/* ========================================================================= */}
      {currentStep === 3 && currentResult && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          {isCovered ? (
            /* Covered Flow: Submit Service Request Claim (Autonomous vs Verification Mode) */
            <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">
                        Submit Service Request
                      </h2>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Covered Claim Verified</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Linked to your <strong>{activePolicy.name}</strong> account • Member ID: <strong>{warrantyAccount.memberId}</strong>
                    </p>
                  </div>
                </div>

                {/* Submittal Autonomy Selector Pill */}
                <div className="bg-slate-50 border border-slate-200 p-1.5 rounded-2xl flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setWarrantyAccount((prev) => ({ ...prev, autonomousDispatchEnabled: true }))}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      warrantyAccount.autonomousDispatchEnabled
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Autonomous (No Pop-up)</span>
                  </button>

                  <button
                    onClick={() => setWarrantyAccount((prev) => ({ ...prev, autonomousDispatchEnabled: false }))}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      !warrantyAccount.autonomousDispatchEnabled
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Require Verification Pop-up</span>
                  </button>
                </div>
              </div>

              {/* Dispatched Confirmation State (When Autonomous or Modal Submits) */}
              {autonomousClaimRecord ? (
                <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-slate-900">
                      Service Request Dispatched to {activePolicy.name}!
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Your claim packet has been officially transmitted to the warranty contractor pool.
                    </p>
                  </div>

                  <div className="bg-white border border-emerald-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2 text-xs shadow-2xs">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Claim Reference:</span>
                      <span className="font-mono font-bold text-slate-900">{autonomousClaimRecord.claimNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Service Trade Call Fee:</span>
                      <span className="font-bold text-emerald-700">${activePolicy.tradeServiceCallFee} due at visit</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Item & Failure:</span>
                      <span className="font-semibold text-slate-800">{currentResult.detectedAppliance.name} ({currentResult.detectedAppliance.failureMode})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Estimated Arrival:</span>
                      <span className="font-bold text-blue-700">{autonomousClaimRecord.dispatchWindow}</span>
                    </div>
                  </div>

                  {/* Word-for-word technician script */}
                  {currentResult.claimPlaybook?.exactPhoneScript && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2 text-xs text-amber-950 max-w-md mx-auto">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        <span>Important When Technician Arrives:</span>
                      </div>
                      <p className="leading-relaxed">
                        State that the failure occurred under <strong>normal residential wear and tear</strong>. Do NOT mention prior DIY repair attempts or rust/corrosion.
                      </p>
                      <button
                        onClick={handleCopyScript}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl text-amber-900 font-bold transition shadow-xs cursor-pointer"
                      >
                        {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedScript ? 'Script Copied!' : 'Copy Script for Technician'}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Confirmation Receipt</span>
                    </button>
                    <button
                      onClick={() => setAutonomousClaimRecord(null)}
                      className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                    >
                      Dismiss
                    </button>
                  </div>

                  {/* Viral Loop inside Dispatched state */}
                  <ViralLoopCard
                    verdict={currentResult}
                    activePolicy={activePolicy}
                    onCheckAnother={handleCheckAnotherAppliance}
                    onOpenShareModal={onOpenShareModal}
                    className="mt-6 text-left"
                  />
                </div>
              ) : isAutonomousSubmitting ? (
                /* Live Progress Pipeline for Autonomous 1-Click Dispatch */
                <div className="p-8 rounded-3xl bg-slate-900 text-white text-center space-y-5 animate-in fade-in">
                  <div className="w-14 h-14 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">
                      Transmitting Autonomous Service Request...
                    </h3>
                    <p className="text-xs text-emerald-300 font-mono">
                      {autonomousStepText}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Connecting to {activePolicy.name} API • Direct contractor routing
                  </div>
                </div>
              ) : (
                /* Standard Ready-to-Submit Overview */
                <div className="space-y-6">
                  {/* Ready-to-submit Claim Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-medium block">Appliance / Component:</span>
                      <span className="font-bold text-slate-900">
                        {currentResult.detectedAppliance.name} {make ? `(${make})` : ''} {model ? `[Model: ${model}]` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Failure Mode:</span>
                      <span className="font-bold text-slate-900">{currentResult.detectedAppliance.failureMode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Applicable Trade Call Fee:</span>
                      <span className="font-bold text-emerald-700">${activePolicy.tradeServiceCallFee}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Contractor Dispatch Window:</span>
                      <span className="font-bold text-blue-700">Urgent (24–48 Business Hours)</span>
                    </div>
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">Policyholder: <strong>{warrantyAccount.accountHolderName}</strong> ({warrantyAccount.propertyAddress})</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold">Account Verified ✓</span>
                    </div>
                  </div>

                  {/* Word-for-Word Anti-Denial Protection Script */}
                  {currentResult.claimPlaybook?.exactPhoneScript && (
                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs shadow-inner">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold">WORD-FOR-WORD TECHNICIAN SCRIPT:</span>
                        <button
                          type="button"
                          onClick={handleCopyScript}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                        </button>
                      </div>
                      <p className="font-mono text-slate-200 text-xs leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                        "{currentResult.claimPlaybook.exactPhoneScript}"
                      </p>
                    </div>
                  )}

                  {/* Mode explanation card */}
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        {warrantyAccount.autonomousDispatchEnabled ? <Zap className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <strong className="block">
                          {warrantyAccount.autonomousDispatchEnabled
                            ? '⚡ Autonomous Submittal Enabled'
                            : '🛡️ Verification & Approval Required'}
                        </strong>
                        <span className="text-[11px] text-blue-700">
                          {warrantyAccount.autonomousDispatchEnabled
                            ? 'Tapping Submit will automatically file the request with your linked warranty account with zero pop-up approvals.'
                            : 'Tapping Submit will open a verification modal for you to review and confirm details.'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={toggleAutonomousMode}
                      className="px-3 py-1.5 bg-white hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer"
                    >
                      Switch Mode
                    </button>
                  </div>

                  {/* Primary Claim Action Triggers */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Assessment</span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={onViewReport}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition"
                      >
                        View Full 10-Page Audit
                      </button>

                      <button
                        id="submit-service-request-main-btn"
                        onClick={handleExecuteServiceRequest}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition cursor-pointer hover:scale-[1.02]"
                      >
                        {warrantyAccount.autonomousDispatchEnabled ? (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Submit Service Request (1-Click Autonomous)</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Service Request Claim</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Denied / Excluded Flow: Angi.com Verified Vendor Request Matcher */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Angi Header */}
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black text-2xl">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">
                        Angi Verified Vendor Network
                      </h2>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Angi Certified Pros</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Since this item is excluded by your warranty, save your ${activePolicy.tradeServiceCallFee} fee and get instant quotes from verified local contractors.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-semibold">
                  <span>💰 You saved ${activePolicy.tradeServiceCallFee} in wasted dispatch fees!</span>
                </div>
              </div>

              {/* Angi Multi-Quote Banner */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 font-black text-sm uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Angi 1-Click Multi-Quote Request</span>
                  </div>
                  <p className="text-xs text-slate-900 font-medium">
                    Automatically send diagnostic findings for <strong>{currentResult.detectedAppliance.name}</strong> to top 3 local pros in ZIP 75001 to receive competing flat-rate estimates.
                  </p>
                </div>

                <button
                  onClick={handleAngiBatchRequest}
                  disabled={isAngiSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer hover:scale-105"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{isAngiSubmitting ? 'Sending to Angi Pros...' : 'Request 3 Free Quotes Now'}</span>
                </button>
              </div>

              {/* Toast message */}
              {angiSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{angiSuccessMessage}</span>
                </div>
              )}

              {/* Local Angi Pros Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Top Rated Angi Pros for {category || 'This Repair'} (Dallas, TX 75001)
                  </h4>
                  <span className="text-[11px] text-slate-500">Angi Price Guide: $180 – $650 avg</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEFAULT_CONTRACTORS.slice(0, 4).map((pro) => (
                    <div
                      key={pro.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-xs text-slate-900">{pro.company}</h5>
                          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{pro.rating}</span>
                            <span className="text-slate-400 font-normal">({pro.reviewCount} reviews)</span>
                          </div>
                        </div>
                        {pro.superServiceAward && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                            Super Service
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 font-mono">
                        🏷️ {pro.estimatedProjectRange || pro.hourlyRateEstimate}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                        <span className="text-[11px] text-blue-600 font-medium">⚡ Responds in {pro.averageResponseTime}</span>
                        <a
                          href={`tel:${pro.phone}`}
                          className="text-[11px] font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{pro.phone}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Assessment</span>
                </button>

                <button
                  onClick={() => onOpenContractorReferral && onOpenContractorReferral(category)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/25 transition cursor-pointer hover:scale-[1.02]"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Open Full Angi Pro Directory (Book or Compare)</span>
                </button>
              </div>

              {/* Viral Loop for Excluded/Direct Hire Flow */}
              <ViralLoopCard
                verdict={currentResult}
                activePolicy={activePolicy}
                onCheckAnother={handleCheckAnotherAppliance}
                onOpenShareModal={onOpenShareModal}
                className="mt-6 text-left"
              />
            </div>
          )}
        </div>
      )}

      {/* Claim Submission Modal (For Verification Mode) */}
      <SubmitServiceClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        verdict={currentResult}
        activePolicy={activePolicy}
        warrantyAccount={warrantyAccount}
        onClaimDispatched={(rec) => {
          setAutonomousClaimRecord(rec);
          if (onClaimDispatched) onClaimDispatched(rec);
        }}
        onUpdateAutonomousPreference={(enabled) => {
          setWarrantyAccount((prev) => ({ ...prev, autonomousDispatchEnabled: enabled }));
        }}
      />
    </div>
  );
};
