import { CheckCircle2, CircleDashed, LoaderCircle, ShieldAlert } from 'lucide-react';
import { PipelineState } from '@/lib/types/trustui';

const metrics = [
  ['functional', 'Functional correctness'], ['visual', 'Visual fidelity'], ['accessibility', 'Accessibility'], ['compliance', 'Requirement compliance'], ['security', 'Code & security'],
] as const;

export function Scorecard({ state }: { state: PipelineState | null }) {
  const score = state?.scores.overall ?? 0;
  return <aside className="space-y-4">
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-panel">
      <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Trust score</p><h2 className="mt-1 text-lg font-semibold text-white">Verification result</h2></div><span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-400">T = Σ wᵢsᵢ</span></div>
      <div className="my-6 grid place-items-center"><div className="score-ring grid h-36 w-36 place-items-center rounded-full transition-all duration-700" style={{ '--score': score * 100 } as React.CSSProperties}><div className="grid h-28 w-28 place-items-center rounded-full bg-slate-900 text-center"><strong className="text-3xl text-white">{Math.round(score * 100)}</strong><span className="text-[10px] uppercase tracking-widest text-slate-500">/ 100 trust</span></div></div></div>
      <div className="space-y-3">{metrics.map(([key, label]) => { const value = state?.scores[key] ?? 0; return <div key={key}><div className="mb-1 flex justify-between text-xs"><span className="text-slate-400">{label}</span><span className="font-medium text-slate-200">{Math.round(value * 100)}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className={`${value >= .85 ? 'bg-emerald-400' : 'bg-amber-400'} h-full rounded-full transition-all duration-700 ease-out`} style={{ width: `${value * 100}%` }} /></div></div>; })}</div>
    </section>
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Closed-loop repair</p><div className="mt-4 space-y-3">{[1, 2, 3].map((cycle) => { const cycleState = state?.cycleStates?.[cycle] ?? 'idle'; const resolved = cycleState === 'resolved'; const active = cycleState === 'active'; const fix = state?.repairLogs.find((log) => log.cycle === cycle)?.localizedIssues[0]?.message; return <div key={cycle} className="flex gap-3 text-sm"><span className={resolved ? 'text-emerald-400' : active ? 'text-indigo-300' : 'text-slate-600'}>{resolved ? <CheckCircle2 size={18} /> : active ? <LoaderCircle size={18} className="animate-spin" /> : <CircleDashed size={18} />}</span><div><span className={`font-medium ${active ? 'text-indigo-200' : 'text-slate-200'}`}>Cycle {cycle}</span><p className={`text-xs ${active ? 'text-indigo-300' : 'text-slate-500'}`}>{resolved ? `Resolved: ${fix ?? 'Repair applied and rescored'}` : active ? state?.activeRepairMessage : 'Standing by'}</p></div></div>; })}</div></section>
    {state?.status === 'FAILED_HUMAN_REVIEW' && <section className="flex gap-3 rounded-xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-200"><ShieldAlert size={20} className="shrink-0" />Threshold not reached after three repair cycles. Human review required.</section>}
  </aside>;
}
