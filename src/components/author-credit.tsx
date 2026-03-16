import { Github, Linkedin } from "lucide-react";

export function AuthorCredit({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-sm sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-2 sm:gap-y-1">
      <span>{label}</span>
      <span className="hidden sm:inline" aria-hidden="true">·</span>
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
        <a
          href="https://github.com/przemg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 underline decoration-current/30 underline-offset-2 transition-colors hover:decoration-current/60 sm:min-h-0 sm:px-0 sm:py-1"
        >
          <Github className="h-4 w-4" />
          <span>GitHub</span>
        </a>
        <a
          href="https://www.linkedin.com/in/przemyslawgwozdz/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 underline decoration-current/30 underline-offset-2 transition-colors hover:decoration-current/60 sm:min-h-0 sm:px-0 sm:py-1"
        >
          <Linkedin className="h-4 w-4" />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
}
