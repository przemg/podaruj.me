import { Github, Linkedin } from "lucide-react";

export function AuthorCredit() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-xs">
      <span>Built by Przemysław Gwóźdź</span>
      <span className="hidden sm:inline" aria-hidden="true">·</span>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/przemg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="inline-flex items-center gap-1 py-1 transition-opacity hover:opacity-70"
        >
          <Github className="h-3 w-3" />
          <span className="sr-only sm:not-sr-only">GitHub</span>
        </a>
        <a
          href="https://www.linkedin.com/in/przemyslawgwozdz/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="inline-flex items-center gap-1 py-1 transition-opacity hover:opacity-70"
        >
          <Linkedin className="h-3 w-3" />
          <span className="sr-only sm:not-sr-only">LinkedIn</span>
        </a>
      </div>
    </div>
  );
}
