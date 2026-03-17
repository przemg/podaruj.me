"use client";

import { useRef, useState } from "react";
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

  function handlePlay() {
    setIsPlaying(true);
    void videoRef.current?.play();
  }

  function handlePlayEnd() {
    setIsPlaying(false);
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
          {/* Native video — always in DOM, src set immediately */}
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            playsInline
            onEnded={handlePlayEnd}
            onPause={handlePlayEnd}
            onError={handleError}
            className="aspect-video w-full bg-black"
          />

          {/* Branded overlay — fades out when isPlaying */}
          <div
            aria-hidden={isPlaying}
            className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${
              isPlaying ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(10,4,4,0.38) 0%, rgba(155,35,22,0.72) 60%, rgba(130,25,15,0.90) 100%)",
            }}
          >
            <button
              onClick={handlePlay}
              aria-label={t("playAriaLabel")}
              tabIndex={isPlaying ? -1 : 0}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:ring-[3px] focus-visible:ring-white/80"
            >
              <Play className="ml-1.5 h-9 w-9 text-landing-coral" fill="currentColor" />
            </button>
            <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
              Podaruj.me
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
