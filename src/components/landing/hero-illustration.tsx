export function HeroIllustration() {
  return (
    <div className="relative h-[350px] w-full sm:h-[400px] lg:h-[450px]">
      {/* Decorative blobs */}
      <div className="animate-float-slow absolute top-4 right-8 h-20 w-20 rounded-full bg-landing-lavender/20" />
      <div className="animate-float absolute bottom-8 left-4 h-16 w-16 rounded-full bg-landing-coral/20" />
      <div className="animate-breathe absolute top-1/3 right-1/4 h-12 w-12 rounded-full bg-landing-mint/20" />

      {/* Main checklist SVG */}
      <svg
        viewBox="0 0 320 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-float mx-auto h-full"
        aria-hidden="true"
      >
        {/* Card background */}
        <rect x="40" y="30" width="240" height="320" rx="20" fill="white" />
        <rect x="40" y="30" width="240" height="320" rx="20" stroke="#F5F0FF" strokeWidth="2" />

        {/* Header bar */}
        <rect x="40" y="30" width="240" height="60" rx="20" fill="#FFF5F0" />
        <rect x="60" y="50" width="80" height="8" rx="4" fill="#F97066" />
        <rect x="60" y="64" width="120" height="6" rx="3" fill="#F97066" opacity="0.3" />

        {/* Item 1 - checked */}
        <rect x="60" y="110" width="200" height="50" rx="12" fill="#F5F0FF" />
        <rect x="72" y="124" width="22" height="22" rx="6" fill="#6EE7B7" />
        <path d="M78 135L82 139L90 131" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="104" y="128" width="90" height="7" rx="3.5" fill="#1F1717" opacity="0.15" />
        <rect x="104" y="140" width="60" height="5" rx="2.5" fill="#1F1717" opacity="0.08" />

        {/* Item 2 - checked */}
        <rect x="60" y="172" width="200" height="50" rx="12" fill="#FFF5F0" />
        <rect x="72" y="186" width="22" height="22" rx="6" fill="#6EE7B7" />
        <path d="M78 197L82 201L90 193" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="104" y="190" width="110" height="7" rx="3.5" fill="#1F1717" opacity="0.15" />
        <rect x="104" y="202" width="70" height="5" rx="2.5" fill="#1F1717" opacity="0.08" />

        {/* Item 3 - unchecked */}
        <rect x="60" y="234" width="200" height="50" rx="12" fill="white" />
        <rect x="60" y="234" width="200" height="50" rx="12" stroke="#E8E0E0" strokeWidth="1.5" />
        <rect x="72" y="248" width="22" height="22" rx="6" stroke="#E8E0E0" strokeWidth="1.5" fill="none" />
        <rect x="104" y="252" width="80" height="7" rx="3.5" fill="#1F1717" opacity="0.15" />
        <rect x="104" y="264" width="50" height="5" rx="2.5" fill="#1F1717" opacity="0.08" />

        {/* Item 4 - unchecked */}
        <rect x="60" y="296" width="200" height="50" rx="12" fill="white" />
        <rect x="60" y="296" width="200" height="50" rx="12" stroke="#E8E0E0" strokeWidth="1.5" />
        <rect x="72" y="310" width="22" height="22" rx="6" stroke="#E8E0E0" strokeWidth="1.5" fill="none" />
        <rect x="104" y="314" width="100" height="7" rx="3.5" fill="#1F1717" opacity="0.15" />
        <rect x="104" y="326" width="65" height="5" rx="2.5" fill="#1F1717" opacity="0.08" />

        {/* Floating gift box */}
        <g transform="translate(250, 10)">
          <rect width="36" height="30" y="6" rx="4" fill="#F97066" />
          <rect width="36" height="8" rx="4" fill="#E7635A" />
          <rect x="15" width="6" height="36" rx="2" fill="#FFF5F0" />
          <path d="M18 0C18 0 12 -6 8 -4C4 -2 6 2 10 4" stroke="#F97066" strokeWidth="2" fill="none" />
          <path d="M18 0C18 0 24 -6 28 -4C32 -2 30 2 26 4" stroke="#F97066" strokeWidth="2" fill="none" />
        </g>

        {/* Star decorations */}
        <circle cx="30" cy="180" r="4" fill="#A78BFA" opacity="0.4" />
        <circle cx="295" cy="250" r="3" fill="#F97066" opacity="0.4" />
        <circle cx="25" cy="300" r="3" fill="#6EE7B7" opacity="0.4" />
      </svg>

      {/* Small floating gift */}
      <div className="animate-float-slow absolute right-4 bottom-12">
        <svg width="40" height="46" viewBox="0 0 40 46" fill="none" aria-hidden="true">
          {/* Gift box body */}
          <rect y="18" width="40" height="28" rx="6" fill="#7C3AED" />
          {/* Gift box lid */}
          <rect width="40" height="10" y="16" rx="5" fill="#6D28D9" />
          {/* Vertical ribbon */}
          <rect x="17" y="16" width="6" height="30" rx="2" fill="#FBBF24" />
          {/* Bow - left loop */}
          <path d="M20 16C20 16 14 10 10 12C6 14 8 18 12 20" stroke="#FBBF24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Bow - right loop */}
          <path d="M20 16C20 16 26 10 30 12C34 14 32 18 28 20" stroke="#FBBF24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
