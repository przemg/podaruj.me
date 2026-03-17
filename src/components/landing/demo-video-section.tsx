"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { LANDING_MAX_WIDTH } from "@/lib/layout";

const VIDEO_SOURCES: Record<string, string> = {
  en: "/demo/demo-en.mp4",
  pl: "/demo/demo-pl.mp4",
};

export function DemoVideoSection({ locale }: { locale: string }) {
  const t = useTranslations("landing.demoVideo");
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSrc = VIDEO_SOURCES[locale] ?? VIDEO_SOURCES["en"];

  useEffect(() => {
    function onFullscreenChange() {
      if (!document.fullscreenElement) {
        setIsPlaying(false);
        videoRef.current?.pause();
      }
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  function handlePlay() {
    const video = videoRef.current;
    if (!video) return;
    setIsPlaying(true);
    void video.play();
    const el = video as HTMLVideoElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    void (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.());
  }

  function handleError() {
    setIsPlaying(false);
  }

  return (
    <section id="demo-video" className="bg-white py-20 sm:py-28">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: LANDING_MAX_WIDTH }}
      >
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>

        <div className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl shadow-xl">
          {/* Native video — always in DOM */}
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            playsInline
            onError={handleError}
            className="aspect-video w-full bg-black"
          />

          {/* Overlay — simple dark scrim, shows poster, hides when playing */}
          <div
            aria-hidden={isPlaying}
            className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${
              isPlaying ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <button
              onClick={handlePlay}
              aria-label={t("playAriaLabel")}
              tabIndex={isPlaying ? -1 : 0}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-landing-coral shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:ring-[3px] focus-visible:ring-white/80"
            >
              <Play className="ml-1 h-8 w-8 text-white" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
