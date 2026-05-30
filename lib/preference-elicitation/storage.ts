import { OPENING_QUESTION } from "@/lib/preference-elicitation/constants";
import type { ElicitationSession } from "@/lib/preference-elicitation/types";

import { ELICITATION_STORAGE_KEY } from "./constants";

type Listener = () => void;

const listeners = new Set<Listener>();

function createFlowKey(): string {
  return String(Date.now());
}

const INITIAL_SESSION: ElicitationSession = {
  status: "in_progress",
  turns: [],
  pendingQuestion: OPENING_QUESTION,
  flowKey: "initial",
};

let cachedSnapshot: ElicitationSession = INITIAL_SESSION;
let cachedRaw: string | null = null;

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function isValidSession(value: unknown): value is ElicitationSession {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const session = value as ElicitationSession;
  const validStatus =
    session.status === "in_progress" || session.status === "complete";

  return validStatus && typeof session.flowKey === "string";
}

function normalizeSession(session: ElicitationSession): ElicitationSession {
  return {
    ...session,
    flowKey: session.flowKey ?? createFlowKey(),
  };
}

function updateCache(session: ElicitationSession, raw: string | null): ElicitationSession {
  cachedSnapshot = session;
  cachedRaw = raw;
  return cachedSnapshot;
}

function readSessionFromStorage(): ElicitationSession {
  if (typeof window === "undefined") {
    return INITIAL_SESSION;
  }

  const raw = window.localStorage.getItem(ELICITATION_STORAGE_KEY);

  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  if (!raw) {
    return updateCache(INITIAL_SESSION, null);
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValidSession(parsed)) {
      return updateCache(normalizeSession(parsed), raw);
    }
  } catch {
    // fall through to reset
  }

  return updateCache(INITIAL_SESSION, null);
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSessionSnapshot(): ElicitationSession {
  return readSessionFromStorage();
}

export function getServerSessionSnapshot(): ElicitationSession {
  return INITIAL_SESSION;
}

export function createInitialSession(): ElicitationSession {
  return INITIAL_SESSION;
}

export function loadSession(): ElicitationSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const snapshot = readSessionFromStorage();
  return snapshot === INITIAL_SESSION && cachedRaw === null ? null : snapshot;
}

export function saveSession(session: ElicitationSession): void {
  if (typeof window === "undefined") {
    return;
  }

  const raw = JSON.stringify(session);
  window.localStorage.setItem(ELICITATION_STORAGE_KEY, raw);
  updateCache(session, raw);
  notifyListeners();
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ELICITATION_STORAGE_KEY);
  updateCache(INITIAL_SESSION, null);
  notifyListeners();
}

export function restartSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  saveSession({
    status: "in_progress",
    turns: [],
    pendingQuestion: OPENING_QUESTION,
    flowKey: createFlowKey(),
  });
}
