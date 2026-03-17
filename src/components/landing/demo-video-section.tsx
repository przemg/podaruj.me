"use client";

import { useEffect, useRef } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 200 });

  const videoSrc = VIDEO_SOURCES[locale] ?? VIDEO_SOURCES["en"];

  useEffect(() => {
    function onFullscreenChange() {
      const video = videoRef.current;
      if (!video) return;
      if (!document.fullscreenElement) {
        video.controls = false;
        video.pause();
        video.currentTime = 0;
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
    video.controls = true;
    void video.play();
    const el = video as HTMLVideoElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    void (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.());
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

        {/* Video-first card — video background, text left, play button right */}
        <div
          id="demo-video"
          className="relative mt-20 overflow-hidden rounded-3xl cursor-pointer group h-[240px] sm:h-[320px] lg:h-[380px]"
          onClick={handlePlay}
        >
          {/* Video fills the entire card */}
          <video
            ref={videoRef}
            src={videoSrc}
            preload="metadata"
            playsInline
            className="absolute inset-0 h-full w-full object-cover block"
          />

          {/* Dark gradient overlay — heavier on left for text contrast, lighter on right */}
          <div
            className="absolute inset-0 transition-opacity duration-200 group-hover:opacity-90"
            style={{
              background:
                "linear-gradient(to right, rgba(15,10,10,0.72) 0%, rgba(15,10,10,0.52) 55%, rgba(15,10,10,0.38) 100%)",
            }}
          />

          {/* Content: text left (~half), play button centered in remaining space */}
          <div className="absolute inset-0 flex items-center pl-8 sm:pl-12 lg:pl-16">
            {/* Left: heading + description — fixed width */}
            <div className="w-1/2 max-w-sm sm:max-w-md pr-4">
              <h3
                className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl leading-tight"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
              >
                {td("title")}
              </h3>
              <p
                className="mt-3 text-sm text-white/80 sm:text-base"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
              >
                {td("subtitle")}
              </p>
            </div>

            {/* Right: button centered in remaining space */}
            <div className="flex flex-1 items-center justify-center">
              <button
                onClick={handlePlay}
                aria-label={td("playAriaLabel")}
                className="animate-pulse-soft flex h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-full bg-landing-coral shadow-2xl transition-all duration-200 hover:scale-105 hover:bg-landing-coral-dark hover:shadow-xl active:scale-95 focus-visible:ring-[3px] focus-visible:ring-white/80"
              >
                <Play className="ml-1 h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
