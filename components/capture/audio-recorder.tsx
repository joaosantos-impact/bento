"use client";
import { useEffect, useRef, useState } from "react";
import { AudioVisualizer } from "./audio-visualizer";

// Web Speech API types are not in the default TS lib. Minimal subset we use here.
type SpeechRecognitionResult = {
  isFinal: boolean;
  0: { transcript: string };
};
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResult>;
};
type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (e: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (e: { error?: string }) => void;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type Props = {
  onTranscript: (text: string) => void;
  language?: string;
  className?: string;
};

export function AudioRecorder({ onTranscript, language = "pt-PT", className }: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const r = new SR();
    r.lang = language;
    r.interimResults = false;
    r.continuous = true;
    r.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res?.isFinal) transcript += res[0].transcript;
      }
      const trimmed = transcript.trim();
      if (trimmed) onTranscriptRef.current(trimmed);
    };
    r.onend = () => setRecording(false);
    r.onerror = () => setRecording(false);
    recRef.current = r;
    return () => {
      try {
        r.stop();
      } catch {
        // already stopped
      }
    };
  }, [language]);

  function toggle() {
    const r = recRef.current;
    if (!r) return;
    if (recording) {
      r.stop();
    } else {
      try {
        r.start();
        setRecording(true);
      } catch {
        // sometimes throws if already running
      }
    }
  }

  if (supported === false) {
    return (
      <span className="text-xs text-zinc-400">
        Reconhecimento de voz indisponível neste browser.
      </span>
    );
  }

  return (
    <div className={(className ?? "") + " inline-flex items-center gap-2"}>
      <button
        type="button"
        onClick={toggle}
        className={
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition " +
          (recording
            ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200")
        }
      >
        <span
          className={
            "inline-block h-2 w-2 rounded-full " +
            (recording ? "bg-red-500 animate-pulse" : "bg-zinc-400")
          }
        />
        {recording ? "Parar" : "Gravar voz"}
      </button>
      {recording && (
        <div className="flex items-center rounded-md border border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30">
          <AudioVisualizer active={recording} />
        </div>
      )}
    </div>
  );
}
