import type { Metadata } from "next";
import { AgentConsole } from "@/components/agent-console";

export const metadata: Metadata = {
  title: "Agent console",
  description:
    "Drive Folio Motion over MCP-style JSON-RPC 2.0: analyze motion, persist specs, and replay the integrity chain from any AI agent.",
  alternates: { canonical: "/agent" },
};

export default function AgentPage() {
  return <AgentConsole />;
}
