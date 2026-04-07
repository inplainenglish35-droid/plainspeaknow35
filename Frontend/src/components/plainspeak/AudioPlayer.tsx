import React, { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";

interface AudioPlayerProps {
  audioUrl: string | null;
  text: string;
  isGenerating: boolean;
  onGenerate: () => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  text,
  isGenerating,
  onGenerate,
  className,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);

  /* ================================
     TEXT PROCESSING
  ================================= */

  const words = useMemo(() => {
    return text ? text.split(/(\s+)/).filter(Boolean) : [];
  }, [text]);

  const wordTimings = useMemo(() => {
    if (!duration || words.length === 0) return [];

    const cleanWords = words.filter((w) => w.trim());
    const avg = duration / cleanWords.length;

    let count = 0;

    return words.map((word) => {
      if (!word.trim()) return { start: 0, end: 0, isSpace: true };

      const start = count * avg;
      const end = (count + 1) * avg;
      count++;

      return { start, end, isSpace: false };
    });
  }, [duration, words]);

  /* ================================
     AUDIO EVENTS
  ================================= */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setHighlightedWordIndex(-1);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  /* ================================
     FORCE AUDIO RELOAD (IMPORTANT)
  ================================= */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.load(); // 🔥 ensures new src is recognized

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHighlightedWordIndex(-1);
  }, [audioUrl]);

  /* ================================
     PLAYBACK RATE
  ================================= */

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  /* ================================
     WORD HIGHLIGHTING (STABLE)
  ================================= */

  useEffect(() => {
    if (!isPlaying || !duration) return;

    const index = wordTimings.findIndex(
      (t) => !t.isSpace && currentTime >= t.start && currentTime < t.end
    );

    if (index !== highlightedWordIndex) {
      setHighlightedWordIndex(index);
    }
  }, [currentTime, isPlaying, duration, wordTimings]);

  /* ================================
     CONTROLS
  ================================= */

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Playback failed:", err);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setHighlightedWordIndex(-1);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  /* ================================
     RENDER
  ================================= */

  return (
    <div className={cn("space-y-4", className)}>

      {/* AUDIO ELEMENT */}
      {audioUrl && (
        <audio
          key={audioUrl} // 🔥 forces React refresh
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}

      {/* TEXT DISPLAY */}
      {text && (
        <div
          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl max-h-48 overflow-y-auto"
          aria-live="polite"
        >
          <p className="text-base leading-relaxed">
            {words.map((word, i) => (
              <span
                key={i}
                className={cn(
                  "transition-all duration-150",
                  i === highlightedWordIndex &&
                    !word.match(/^\s+$/) &&
                    "bg-teal-200 dark:bg-teal-700 px-0.5 rounded"
                )}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* CONTROLS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 shadow-sm">

        {!audioUrl && !isGenerating ? (
          <button
            onClick={onGenerate}
            disabled={!text || isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-white disabled:opacity-50"
          >
            <Volume2 className="w-5 h-5" />
            Listen instead
          </button>
        ) : isGenerating ? (
          <div className="flex items-center justify-center gap-2 py-3">
            <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
            Generating audio...
          </div>
        ) : (
          <div className="space-y-3">

            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <button
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-teal-500 text-white"
                >
                  {isPlaying ? <Pause /> : <Play />}
                </button>

                <button onClick={handleRestart}>
                  <RotateCcw />
                </button>

                <button onClick={toggleMute}>
                  {isMuted ? <VolumeX /> : <Volume2 />}
                </button>

              </div>

              <div className="flex gap-1">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackRate(s)}
                    className={cn(
                      "px-2 py-1 text-xs rounded",
                      playbackRate === s
                        ? "bg-teal-100 text-teal-700"
                        : "text-gray-500"
                    )}
                  >
                    {s}x
                  </button>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
