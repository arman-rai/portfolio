'use client';

import { useEffect, useRef, useState } from "react";
import type React from "react";

type Line = {
  id: number;
  content: string;
};

type TerminalProps = {
  ip: string;
};

const HELP_LINES: string[] = [
  "Available commands:",
  "  help   - Show this help message",
  "  about  - Learn more about me",
  "  resume - View my resume information",
  "  clear  - Clear the terminal output",
  "  social - View my social links",
];

const ABOUT_LINES: string[] = [
  "Hi, I am Your Name.",
  "I am a developer who enjoys building clean UIs and useful tools.",
  "This is my terminal-style portfolio built with Next.js and Tailwind CSS.",
];

const RESUME_LINES: string[] = [
  "Resume:",
  "  Role: Software Developer",
  "  Skills: TypeScript, React, Next.js, Node.js, PostgreSQL",
  "  Experience: Update this section with your real experience.",
];

const SOCIAL_LINES: string[] = [
  "Social:",
  "  GitHub:  https://github.com/your-username",
  "  LinkedIn: https://www.linkedin.com/in/your-username",
  "  X/Twitter: https://x.com/your-username",
];

let nextId = 0;

function createLine(content: string): Line {
  return { id: nextId++, content };
}

export default function Terminal({ ip }: TerminalProps) {
  const [history, setHistory] = useState<Line[]>([
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
    lines: string[],
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
    <div className="flex h-[88vh] w-[95vw] max-w-6xl flex-col rounded-2xl border border-white/10 bg-white/5 text-sm text-emerald-200 shadow-[0_0_80px_rgba(16,185,129,0.35)] backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2 text-xs text-zinc-200">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="ml-3">terminal-portfolio</span>
        </div>
        <span className="font-mono text-[10px] text-zinc-500">Next.js · Tailwind CSS</span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-black/30 px-4 py-3 font-mono"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line) => (
          <div key={line.id} className="whitespace-pre-wrap">
            {line.content}
          </div>
        ))}
        <div className="mt-1 flex items-center">
          <span className="mr-2 text-green-400">{prompt}</span>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-green-400 outline-none caret-green-400"
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
