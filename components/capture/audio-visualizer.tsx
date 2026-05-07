"use client";
import { useEffect, useRef } from "react";

type Props = {
  active: boolean;
  bars?: number;
  className?: string;
};

// Live amplitude bars driven by getUserMedia + AnalyserNode.
// Mounts only when `active=true`; tears down stream/context on unmount or false.
export function AudioVisualizer({ active, bars = 18, className }: Props) {
  const barsRef = useRef<Array<HTMLDivElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        ctxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);
        analyserRef.current = analyser;

        const buffer = new Uint8Array(analyser.frequencyBinCount);

        function tick() {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(buffer);
          const total = buffer.length;
          const step = Math.max(1, Math.floor(total / bars));
          for (let i = 0; i < bars; i++) {
            const el = barsRef.current[i];
            if (!el) continue;
            let sum = 0;
            const start = i * step;
            const end = Math.min(total, start + step);
            for (let j = start; j < end; j++) sum += buffer[j] ?? 0;
            const avg = sum / Math.max(1, end - start);
            const pct = Math.min(100, Math.max(10, (avg / 200) * 100));
            el.style.height = `${pct}%`;
          }
          rafRef.current = requestAnimationFrame(tick);
        }
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        console.warn("AudioVisualizer: getUserMedia failed", e);
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try {
        sourceRef.current?.disconnect();
      } catch {
        // already disconnected
      }
      sourceRef.current = null;
      analyserRef.current = null;
      const ctx = ctxRef.current;
      ctxRef.current = null;
      if (ctx && ctx.state !== "closed") ctx.close().catch(() => {});
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [active, bars]);

  if (!active) return null;

  return (
    <div
      className={(className ?? "") + " inline-flex h-7 items-center gap-[3px] px-2"}
      aria-label="Sinal de áudio"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className="w-[3px] rounded-full bg-red-500/80 transition-[height] duration-75 ease-out dark:bg-red-400/80"
          style={{ height: "10%" }}
        />
      ))}
    </div>
  );
}
