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
  { key: "step1", icon: ClipboardList, iconBg: "bg-gradient-to-br from-landing-coral/25 to-landing-peach-wash", iconColor: "text-landing-coral", badgeClass: "bg-landing-coral text-white" },
  { key: "step2", icon: Share2, iconBg: "bg-gradient-to-br from-landing-lavender/30 to-landing-lavender/15", iconColor: "text-landing-lavender", badgeClass: "bg-landing-lavender text-white" },
  { key: "step3", icon: Gift, iconBg: "bg-gradient-to-br from-landing-mint/25 to-landing-cream", iconColor: "text-landing-mint", badgeClass: "bg-landing-mint text-landing-text" },
] as const;

export function DemoVideoSection({ locale }: { locale: string }) {
  const t = useTranslations("landing.howItWorks");
  const td = useTranslations("landing.demoVideo");
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const revealRef = useScrollReveal<HTMLDivElement>({ staggerDelay: 200 });

  const videoSrc = VIDEO_SOURCES[locale] ?? VIDEO_SOURCES["en"];

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
      bgVideo.play().catch(() => {});
    }
  }

  // Close modal on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  return (
    <section id="how-it-works" className="bg-white pt-20 pb-10 sm:pt-28 sm:pb-14">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: LANDING_MAX_WIDTH }}
      >
        {/* Section label */}
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-landing-coral">
          {t("label")}
        </p>
        {/* Section heading */}
        <h2 className="text-center text-3xl font-bold leading-[1.1] text-landing-text sm:text-4xl lg:text-5xl">
          {t("titleTop")}
          <br />
          <span className="bg-gradient-to-r from-landing-coral to-landing-lavender bg-clip-text text-transparent">
            {t("titleBottom")}
          </span>
        </h2>

        {/* Steps */}
        <div
          className="mt-24 grid grid-cols-1 gap-12 md:grid-cols-3"
          ref={revealRef}
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="scroll-reveal relative flex flex-col items-center">
                {index < STEPS.length - 1 && (
                  <div
                    className="absolute top-10 left-[calc(50%+68px)] hidden h-[2px] w-[calc(100%-88px)] md:block"
                    style={{
                      background: index === 0
                        ? "linear-gradient(to right, rgba(249,112,102,0.4), rgba(167,139,250,0.3))"
                        : "linear-gradient(to right, rgba(167,139,250,0.3), rgba(110,231,183,0.3))",
                    }}
                  />
                )}
                {/* Icon box with number badge */}
                <div className="relative mb-5 inline-flex">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-2xl ${step.iconBg} ${step.iconColor}`}
                  >
                    <Icon className="h-9 w-9" />
                  </div>
                  <div
                    aria-label={`Step ${index + 1}`}
                    className={`absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${step.badgeClass}`}
                  >
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-center text-xl font-semibold text-landing-text">
                  {t(`${step.key}Title`)}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-center text-landing-text-muted">
                  {t(`${step.key}Description`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Video card — dark glassmorphism with centered content */}
        <div
          id="demo-video"
          className="group relative mt-28 cursor-pointer overflow-hidden rounded-3xl border border-white/10"
          style={{
            background: [
              "radial-gradient(ellipse at 30% 50%, rgba(249,112,102,0.12) 0%, transparent 60%)",
              "radial-gradient(ellipse at 70% 50%, rgba(56,189,248,0.08) 0%, transparent 60%)",
              "#151015",
            ].join(", "),
          }}
          onClick={openModal}
        >
          {/* Background video — subtle, low opacity */}
          <video
            ref={bgVideoRef}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            onPlay={(e) => { (e.currentTarget as HTMLVideoElement).playbackRate = 0.5; }}
            className="absolute inset-0 h-full w-full object-cover opacity-15"
            style={{ objectPosition: "50% 60%" }}
          />

          {/* Content */}
          <div className="relative flex flex-col items-center px-8 py-16 text-center sm:py-20 lg:py-24">
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              {td("title")}
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/50 sm:text-base">
              {td("subtitle")}
            </p>

            {/* Play button — large with pulsing glow ring */}
            <div className="relative mt-10">
              <div className="absolute inset-0 animate-ping rounded-full bg-landing-coral/20" style={{ animationDuration: "2s" }} />
              <div
                className="absolute -inset-3 rounded-full bg-landing-coral/10 blur-md"
                style={{ animation: "pulse 2s ease-in-out infinite" }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); openModal(); }}
                aria-label={td("playAriaLabel")}
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-landing-coral transition-all duration-200 hover:scale-110 active:scale-95 sm:h-24 sm:w-24"
                style={{ boxShadow: "0 0 80px rgba(249,112,102,0.5), 0 0 160px rgba(249,112,102,0.15)" }}
              >
                <Play className="ml-1 h-8 w-8 text-white sm:h-10 sm:w-10" fill="currentColor" />
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
            className="relative w-full max-w-[70rem]"
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
