// Speech recognition & audio recording helper
export interface SpeechRecognitionHelper {
  isSupported: boolean;
  start: (onTranscript: (text: string, isFinal: boolean) => void, onError: (err: string) => void) => void;
  stop: () => void;
  isActive: () => boolean;
}

export function createSpeechRecognition(): SpeechRecognitionHelper {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      isSupported: false,
      start: () => {},
      stop: () => {},
      isActive: () => false,
    };
  }

  let recognition: any = null;
  let isRunning = false;

  return {
    isSupported: true,
    isActive: () => isRunning,
    start: (onTranscript, onError) => {
      try {
        if (recognition && isRunning) {
          try {
            recognition.stop();
          } catch {
            // ignore
          }
        }

        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          isRunning = true;
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const combined = (finalTranscript + ' ' + interimTranscript).trim();
          onTranscript(combined, Boolean(finalTranscript));
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice/error:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            isRunning = false;
            onError('Microphone permission denied');
          } else if (event.error !== 'no-speech') {
            onError(event.error);
          }
        };

        recognition.onend = () => {
          isRunning = false;
        };

        recognition.start();
      } catch (err: any) {
        isRunning = false;
        console.warn('Speech recognition start error:', err);
        onError(err.message || 'Microphone error');
      }
    },
    stop: () => {
      isRunning = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
        recognition = null;
      }
    },
  };
}
