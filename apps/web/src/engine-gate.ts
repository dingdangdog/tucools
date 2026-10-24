export interface ToolGate {
  phase: "checking" | "down" | "blocked" | "ready";
  available: string[];
}
