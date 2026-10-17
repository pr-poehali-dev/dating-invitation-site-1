const COUNTER_ID = 113658434;

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

const sent = new Set<string>();

export function reachGoal(goal: string, params?: Record<string, unknown>) {
  if (sent.has(goal)) return;
  sent.add(goal);
  window.ym?.(COUNTER_ID, "reachGoal", goal, params);
}
