"use client";

import { useEffect, useRef } from "react";

export interface KeyboardShortcutHandlers {
  onNewScreening?: () => void;
  onFocusSearch?: () => void;
  onEscape?: () => void;
  onNextRow?: () => void;
  onPrevRow?: () => void;
  onEscalate?: () => void;
}

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

/**
 * Global keyboard shortcuts for the screening console. Compliance teams live in
 * the keyboard, so the bindings are single-key where possible:
 *   n → new screening   · / → focus search · Esc → close/blur
 *   j / ↓ → next row     · k / ↑ → prev row · e → escalate selected
 * Typing in a field suppresses everything except Escape.
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  const ref = useRef(handlers);
  // Keep the latest handlers in the ref without re-subscribing the key listener.
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const h = ref.current;
      const editing = isEditableTarget(e.target);

      if (e.key === "Escape") {
        h.onEscape?.();
        if (editing && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }

      if (editing || e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "n":
        case "N":
          e.preventDefault();
          h.onNewScreening?.();
          break;
        case "/":
          e.preventDefault();
          h.onFocusSearch?.();
          break;
        case "j":
        case "ArrowDown":
          e.preventDefault();
          h.onNextRow?.();
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          h.onPrevRow?.();
          break;
        case "e":
        case "E":
          e.preventDefault();
          h.onEscalate?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
