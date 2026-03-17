"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Play, ClipboardList, Share2, Gift, X } from "lucide-react";
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
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 200 });

  const videoSrc = VIDEO_SOURCES[locale] ?? VIDEO_SOURCES["en"];

  // Close modal on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  function openModal() {
    bgVideoRef.current?.pause();
    setIsModalOpen(true);
  }

  function closeModal() {
    const modalVideo = modalVideoRef.current;
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.currentTime = 0;
    }
    setIsModalOpen(false);
    const bgVideo = bgVideoRef.current;
    if (bgVideo) {
      bgVideo.playbackRate = 0.5;
      void bgVideo.play();
    }
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

        {/* Video card — background video with overlay, opens modal on click */}
        <div
          id="demo-video"
          className="relative mt-20 overflow-hidden rounded-3xl cursor-pointer group h-[240px] sm:h-[320px] lg:h-[380px]"
          onClick={openModal}
        >
          <video
            ref={bgVideoRef}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            onPlay={(e) => { (e.currentTarget as HTMLVideoElement).playbackRate = 0.5; }}
            className="absolute inset-0 h-full w-full object-cover block"
            style={{ objectPosition: "50% 60%" }}
          />

          <div
            className="absolute inset-0 transition-opacity duration-200 group-hover:opacity-90"
            style={{
              background:
                "linear-gradient(to right, rgba(15,10,10,0.72) 0%, rgba(15,10,10,0.52) 55%, rgba(15,10,10,0.38) 100%)",
            }}
          />

          <div className="absolute inset-0 flex items-center pl-8 sm:pl-12 lg:pl-16">
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

            <div className="flex flex-1 items-center justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); openModal(); }}
                aria-label={td("playAriaLabel")}
                className="animate-pulse-soft flex h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-full bg-landing-coral shadow-2xl transition-all duration-200 hover:scale-105 hover:bg-landing-coral-dark hover:shadow-xl active:scale-95 focus-visible:ring-[3px] focus-visible:ring-white/80"
              >
                <Play className="ml-1 h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video modal */}
      {isModalOpen && typeof window !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              aria-label={td("closeAriaLabel")}
              className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <X className="h-4 w-4" />
            </button>
            <video
              ref={modalVideoRef}
              src={videoSrc}
              controls
              autoPlay
              playsInline
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
