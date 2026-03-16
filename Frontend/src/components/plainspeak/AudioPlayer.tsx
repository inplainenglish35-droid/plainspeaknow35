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

  /* ============================================================
     TEXT PROCESSING
  ============================================================ */

  const words = useMemo(() => {
    return text ? text.split(/(\s+)/).filter(Boolean) : [];
  }, [text]);

  const wordTimings = useMemo(() => {
    if (!duration || words.length === 0) return [];

    const wordCount = words.filter((w) => w.trim()).length;
    if (wordCount === 0) return [];

    const avgWordDuration = duration / wordCount;
    let wordCounter = 0;

    return words.map((word) => {
      if (!word.trim()) {
        return { start: 0, end: 0, isSpace: true };
      }

      const start = wordCounter * avgWordDuration;
      const end = (wordCounter + 1) * avgWordDuration;
      wordCounter++;

      return { start, end, isSpace: false };
    });
  }, [duration, words]);

  /* ============================================================
     AUDIO EVENT LISTENERS (ATTACH ONCE)
  ============================================================ */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setHighlightedWordIndex(-1);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  /* ============================================================
     RESET WHEN NEW AUDIO ARRIVES
  ============================================================ */

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHighlightedWordIndex(-1);
  }, [audioUrl]);

  /* ============================================================
     PLAYBACK RATE
  ============================================================ */

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  /* ============================================================
     WORD HIGHLIGHTING
  ============================================================ */

  useEffect(() => {
    if (!isPlaying || !duration) return;

    const currentIndex = wordTimings.findIndex(
      (timing) =>
        !timing.isSpace &&
        currentTime >= timing.start &&
        currentTime < timing.end
    );

    setHighlightedWordIndex(currentIndex);
  }, [currentTime, isPlaying, duration, wordTimings]);

  /* ============================================================
     CONTROLS
  ============================================================ */

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
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className={cn("space-y-4", className)}>
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}

      {text && (
        <div
          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl max-h-48 overflow-y-auto"
          aria-live="polite"
          aria-label="Text being read aloud"
        >
          <p className="text-base leading-relaxed">
            {words.map((word, index) => (
              <span
                key={index}
                className={cn(
                  "transition-all duration-150",
                  index === highlightedWordIndex &&
                    !word.match(/^\s+$/) &&
                    "bg-teal-200 dark:bg-teal-700 text-teal-900 dark:text-teal-100 rounded px-0.5"
                )}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        {!audioUrl && !isGenerating ? (
          <button
            onClick={onGenerate}
            disabled={!text}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
              "bg-gradient-to-r from-teal-500 to-blue-500 text-white",
              "hover:from-teal-600 hover:to-blue-600",
              "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Volume2 className="w-5 h-5" />
            Generate Audio
          </button>
        ) : isGenerating ? (
          <div className="flex items-center justify-center gap-2 py-3">
            <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
            <span className="text-gray-600 dark:text-gray-300">
              Generating audio...
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs text-gray-500 w-10">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleRestart}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-1">Speed:</span>
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackRate(speed)}
                    className={cn(
                      "px-2 py-1 text-xs rounded transition-colors",
                      playbackRate === speed
                        ? "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-medium"
                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {speed}x
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
