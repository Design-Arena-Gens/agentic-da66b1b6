import { AgentDashboard } from "@/components/AgentDashboard";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-900/80 bg-slate-950/80 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Marketplace Sales AI Agent</h1>
            <p className="text-sm text-slate-300">
              फेसबुक मार्केटप्लेस लिस्टिंग को ऑप्टिमाइज़ करें, सही कीवर्ड टैग चुनें और खरीदारों से स्मार्ट बातचीत करें।
            </p>
          </div>
          <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-xs font-medium text-brand-100">
            Real-time growth coaching · Hindi + English support
          </div>
        </div>
      </header>
      <AgentDashboard />
    </main>
  );
}
