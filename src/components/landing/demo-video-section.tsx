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
            onError={handleError}
            className="aspect-video w-full bg-black"
          />

          {/* Branded overlay — fades out when isPlaying */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${
              isPlaying ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
            style={{
              background:
                "linear-gradient(135deg, var(--landing-coral) 0%, #FFB88C 50%, var(--landing-peach-wash) 100%)",
            }}
          >
            <button
              onClick={handlePlay}
              aria-label={t("playAriaLabel")}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Play className="ml-1 h-8 w-8 text-landing-coral" fill="currentColor" />
            </button>
            <p className="mt-4 text-sm font-medium tracking-wide text-white/80 uppercase">
              Podaruj.me
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
