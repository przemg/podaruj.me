"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Play, ClipboardList, Share2, Gift } from "lucide-react";
import { LANDING_MAX_WIDTH } from "@/lib/layout";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const VIDEO_SOURCES: Record<string, string> = {
  en: "/demo/demo-en.mp4",
  pl: "/demo/demo-pl.mp4",
};

const STEPS = [
  { key: "step1", icon: ClipboardList, color: "bg-landing-coral/10 text-landing-coral" },
  { key: "step2", icon: Share2, color: "bg-landing-lavender/10 text-landing-lavender" },
  { key: "step3", icon: Gift, color: "bg-landing-mint/10 text-landing-mint" },
] as const;

export function DemoVideoSection({ locale }: { locale: string }) {
  const t = useTranslations("landing.howItWorks");
  const td = useTranslations("landing.demoVideo");
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 200 });

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
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: LANDING_MAX_WIDTH }}
      >
        {/* Section heading */}
        <h2 className="text-center text-3xl font-bold text-landing-text sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-landing-text-muted">
          {t("subtitle")}
        </p>

        {/* Steps */}
        <div
          className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3"
          ref={revealRef}
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="scroll-reveal relative text-center">
                {index < STEPS.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+40px)] hidden h-[2px] w-[calc(100%-80px)] border-t-2 border-dashed border-landing-text/10 md:block" />
                )}
                <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-landing-peach-wash text-sm font-bold text-landing-coral">
                  {index + 1}
                </div>
                <div
                  className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl ${step.color}`}
                >
                  <Icon className="h-9 w-9" />
                </div>
                <h3 className="text-xl font-semibold text-landing-text">
                  {t(`${step.key}Title`)}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-landing-text-muted">
                  {t(`${step.key}Description`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Gradient video box */}
        <div
          id="demo-video"
          className="mt-20 rounded-3xl p-8 sm:p-12"
          style={{
            background:
              "linear-gradient(135deg, var(--landing-coral) 0%, var(--landing-coral-light) 50%, var(--landing-peach-wash) 100%)",
          }}
        >
          <h3 className="mb-8 text-center text-2xl font-bold text-white sm:text-3xl">
            {td("title")}
          </h3>

          {/* Video player */}
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              playsInline
              onError={handleError}
              className="aspect-video w-full bg-black"
            />

            <div
              aria-hidden={isPlaying}
              className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${
                isPlaying ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <button
                onClick={handlePlay}
                aria-label={td("playAriaLabel")}
                tabIndex={isPlaying ? -1 : 0}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:ring-[3px] focus-visible:ring-white/80"
              >
                <Play className="ml-1 h-8 w-8 text-landing-coral" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
