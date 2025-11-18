'use client';

import { useEffect, useRef, useState } from "react";
import type React from "react";

type LineContent = string | React.ReactNode;

type Line = {
  id: number;
  content: LineContent;
};

type TerminalProps = {
  ip: string;
};

const HELP_LINES: LineContent[] = [
  "Available commands:",
  "  help   - Show this help message",
  "  about  - Learn more about me",
  "  resume - View my resume information",
  "  clear  - Clear the terminal output",
  "  social - View my social links",
];

const ABOUT_LINES: LineContent[] = [
  "Arman Rai",
  "Lalitpur, Nepal 🇳🇵",
  "BSc.CSIT student and CTF player.",
  "Interested in web application security, networking and pentesting.",
];

const RESUME_LINES: LineContent[] = [
  "Experience:",
  "  Trainee - NCA Nepal (Remote, Kathmandu)",
  "    Mar 2025 - Sep 2025 · 7 months",
  "",
  "  L1 Support Specialist - Vianet Communication (On-site, Lalitpur)",
  "    Feb 2025 - May 2025 · 4 months",
  "",
  "Education:",
  "  BSc.CSIT, Information Technology - IOST, Tribhuvan University (2024-2028)",
  "  Prasadi Academy - Mathematics and Computer Science (2021-2023, Grade: A)",
];

const SOCIAL_LINES: LineContent[] = [
  "Social:",
  (
    <>
      {"  GitHub:   "}
      <a
        href="https://github.com/arman-rai/"
        target="_blank"
        rel="noreferrer"
        className="text-emerald-300 underline decoration-emerald-400"
      >
        github.com/arman-rai
      </a>
    </>
  ),
  (
    <>
      {"  LinkedIn: "}
      <a
        href="https://www.linkedin.com/in/rai-arman/"
        target="_blank"
        rel="noreferrer"
        className="text-emerald-300 underline decoration-emerald-400"
      >
        linkedin.com/in/rai-arman
      </a>
    </>
  ),
];

export default function Terminal({ ip }: TerminalProps) {
  const nextIdRef = useRef(0);

  const createLine = (content: LineContent): Line => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return { id, content };
  };

  const [history, setHistory] = useState<Line[]>(() => [
    createLine("Welcome to my terminal portfolio."),
    createLine("Type 'help' to see available commands."),
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const prompt = `visitor@${ip}:~$`;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => {
        window.clearTimeout(id);
      });
    };
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history]);

  function pushLines(
    lines: LineContent[],
    options?: {
      animated?: boolean;
      delayMs?: number;
    },
  ) {
    if (!options?.animated) {
      setHistory((prev) => [
        ...prev,
        ...lines.map((line) => createLine(line)),
      ]);
      return;
    }

    const delay = options.delayMs ?? 40;

    lines.forEach((line, index) => {
      const timeoutId = window.setTimeout(() => {
        setHistory((prev) => [...prev, createLine(line)]);
      }, index * delay);
      timeoutsRef.current.push(timeoutId);
    });
  }

  function pushPrompt(command: string) {
    pushLines([`${prompt} ${command}`]);
  }

  function handleCommand(raw: string) {
    const value = raw.trim();

    if (!value) {
      pushLines([""]);
      return;
    }

    const [cmd] = value.split(/\s+/);
    const command = cmd.toLowerCase();

    if (command === "clear") {
      timeoutsRef.current.forEach((id) => {
        window.clearTimeout(id);
      });
      timeoutsRef.current = [];
      setHistory([]);
      return;
    }

    pushPrompt(value);

    switch (command) {
      case "help": {
        pushLines(HELP_LINES, { animated: true, delayMs: 40 });
        break;
      }
      case "about": {
        pushLines(ABOUT_LINES, { animated: true, delayMs: 40 });
        break;
      }
      case "resume": {
        pushLines(RESUME_LINES, { animated: true, delayMs: 40 });
        break;
      }
      case "social": {
        pushLines(SOCIAL_LINES, { animated: true, delayMs: 40 });
        break;
      }
      default: {
        pushLines([`Command not found: ${command}`], {
          animated: true,
          delayMs: 40,
        });
        break;
      }
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const current = input;
      setInput("");
      if (current.trim().length > 0) {
        setCommandHistory((prev) => [...prev, current]);
        setHistoryIndex(null);
      }
      handleCommand(current);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHistoryIndex((prev) => {
        if (commandHistory.length === 0) return prev;
        if (prev === null) {
          const index = commandHistory.length - 1;
          setInput(commandHistory[index] ?? "");
          return index;
        }
        const nextIndex = Math.max(0, prev - 1);
        setInput(commandHistory[nextIndex] ?? "");
        return nextIndex;
      });
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHistoryIndex((prev) => {
        if (commandHistory.length === 0) return prev;
        if (prev === null) return prev;
        if (prev >= commandHistory.length - 1) {
          setInput("");
          return null;
        }
        const nextIndex = prev + 1;
        setInput(commandHistory[nextIndex] ?? "");
        return nextIndex;
      });
    }
  }

  return (
    <div className="group relative flex h-[88vh] w-[95vw] max-w-6xl flex-col rounded-lg border border-white/20 bg-gradient-to-br from-white/5 via-transparent to-emerald-500/5 text-sm text-emerald-100 shadow-[0_8px_32px_0_rgba(16,185,129,0.15),0_0_1px_0_rgba(255,255,255,0.2)_inset,0_1px_3px_0_rgba(0,0,0,0.3)] backdrop-blur-[40px] transition-all duration-500 hover:shadow-[0_8px_48px_0_rgba(16,185,129,0.25),0_0_1px_0_rgba(255,255,255,0.3)_inset,0_1px_3px_0_rgba(0,0,0,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-emerald-500/10 before:via-transparent before:to-blue-500/10 before:opacity-50 before:transition-opacity before:duration-500 hover:before:opacity-70">
      <div className="relative flex items-center justify-between border-b border-white/20 bg-gradient-to-b from-white/10 to-transparent px-4 py-3 text-xs text-zinc-100 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-shadow duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-shadow duration-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
          <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-shadow duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          <span className="ml-3 font-medium tracking-wide">Arman's Terminal</span>
        </div>
        <span className="font-mono text-[10px] text-zinc-400/80 tracking-wider">Next.js · Tailwind CSS</span>
      </div>
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto bg-gradient-to-b from-black/20 via-black/30 to-black/40 px-6 py-4 font-mono backdrop-blur-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line) => (
          <div key={line.id} className="whitespace-pre-wrap leading-relaxed text-emerald-100/90">
            {line.content}
          </div>
        ))}
        <div className="mt-1 flex items-center">
          <span className="mr-2 font-semibold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">{prompt}</span>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent font-medium text-emerald-300 outline-none caret-emerald-400 placeholder:text-emerald-400/30 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
