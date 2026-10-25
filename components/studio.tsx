'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Braces, Code2, Eye, LoaderCircle, Play, Sparkles } from 'lucide-react';
import { PipelineState, PipelineStatus } from '@/lib/types/trustui';
import { Scorecard } from '@/components/scorecard';
import { Button } from '@/components/ui/button';
import { analyseRequirements } from '@/lib/services/requirement-agent';
import { generateComponent } from '@/lib/services/code-gen-agent';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false, loading: () => <div className="h-full animate-pulse bg-slate-950" /> });
const example = 'Build a responsive customer-support request form with a clear primary action and confirmation state.';
const blankScores = { functional: 0, visual: 0, accessibility: 0, compliance: 0, security: 0, overall: 0 };
const trustedScores = { functional: .98, visual: .95, accessibility: 1, compliance: 1, security: 1, overall: .98 };
const firstRepairScores = { functional: .9, visual: .8, accessibility: .4, compliance: 1, security: .3, overall: .68 };
const cycleOneScores = { functional: .9, visual: .8, accessibility: .95, compliance: 1, security: .3, overall: .79 };
const cycleTwoScores = { functional: .9, visual: .8, accessibility: .95, compliance: 1, security: 1, overall: .93 };

type Simulation = { id: number; prompt: string; repair: boolean };
const statusLabels: Record<PipelineStatus, string> = { ANALYZING: 'ANALYZING…', GENERATING: 'GENERATING…', VERIFYING: 'VERIFYING…', REPAIRING: 'REPAIRING', TRUSTED: 'TRUSTED', FAILED_HUMAN_REVIEW: 'HUMAN REVIEW' };

const previewDocument = (title: string) => `<!doctype html><html><head><style>html{font-family:Arial,sans-serif;background:#020617;color:#e2e8f0}*{box-sizing:border-box}body{margin:0;padding:24px}.card{max-width:560px;margin:auto;background:#0f172a;border:1px solid #334155;border-radius:16px;padding:24px;box-shadow:0 16px 40px #0006}.eyebrow{color:#a5b4fc;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}h1{margin:8px 0;font-size:24px}p{color:#cbd5e1;font-size:14px;line-height:1.55}label{display:block;margin-top:22px;font-size:14px;font-weight:600}textarea{width:100%;min-height:96px;margin-top:8px;border:1px solid #475569;border-radius:8px;background:#020617;color:#fff;padding:12px;resize:vertical}button{margin-top:14px;border:0;border-radius:8px;background:#6366f1;color:#fff;padding:10px 14px;font-weight:700;cursor:pointer}.status{color:#6ee7b7;margin-top:12px;display:none}</style></head><body><main class="card" aria-labelledby="title"><div class="eyebrow">Verified interface</div><h1 id="title">${title.replace(/[<>]/g, '')}</h1><p>A focused, accessible experience generated from your requirements.</p><form id="request"><label for="message">How can we help?</label><textarea id="message" required placeholder="Tell us what you need"></textarea><button type="submit">Send request</button><div class="status" role="status">Request received. We’ll be in touch shortly.</div></form></main><script>document.querySelector('#request').addEventListener('submit',e=>{e.preventDefault();document.querySelector('.status').style.display='block'})</script></body></html>`;

export function Studio() {
  const [prompt, setPrompt] = useState(example);
  const [state, setState] = useState<PipelineState | null>(null);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  useEffect(() => { const saved = window.localStorage.getItem('trustui:last-run'); if (saved) { const value = JSON.parse(saved) as PipelineState; setState(value); setCode(value.generatedCode); } }, []);
  const spec = useMemo(() => state?.uiSpec ? JSON.stringify(state.uiSpec, null, 2) : '{\n  "waiting": "Run a prompt to produce the source-of-truth spec"\n}', [state]);
  useEffect(() => {
    if (!simulation) return;
    const { prompt: currentPrompt, repair } = simulation;
    const uiSpec = analyseRequirements(currentPrompt);
    const baseCode = generateComponent(uiSpec);
    const draftCode = repair ? `${baseCode}\n\n// Draft analyzer note: contrast and user-provided input need repair.` : baseCode;
    const schedule = (delay: number, callback: () => void) => window.setTimeout(callback, delay);
    const timers = [
      schedule(2000, () => { setState((current) => current ? { ...current, status: 'GENERATING', generatedCode: draftCode } : current); setCode(draftCode); }),
      schedule(4000, () => setState((current) => current ? { ...current, status: 'VERIFYING' } : current)),
      schedule(5000, () => setState((current) => current ? { ...current, initialScores: repair ? firstRepairScores : trustedScores, scores: repair ? firstRepairScores : trustedScores, status: repair ? 'VERIFYING' : 'TRUSTED', updatedAt: new Date().toISOString() } : current)),
    ];
    if (repair) {
      timers.push(
        schedule(6000, () => setState((current) => current ? { ...current, status: 'REPAIRING', cycleStates: { 1: 'active', 2: 'idle', 3: 'idle' }, activeRepairMessage: 'Issue found: Low contrast ratio (WCAG AA failure). Fixing...' } : current)),
        schedule(9000, () => setState((current) => current ? { ...current, scores: cycleOneScores, cycleStates: { 1: 'resolved', 2: 'idle', 3: 'idle' }, activeRepairMessage: undefined, repairLogs: [...current.repairLogs, { cycle: 1, previousScore: .68, localizedIssues: [{ category: 'Accessibility', target: 'color contrast', message: 'Low contrast ratio (WCAG AA failure).' }], repairedCode: baseCode, newScore: .79 }] } : current)),
        schedule(10000, () => setState((current) => current ? { ...current, status: 'REPAIRING', cycleStates: { 1: 'resolved', 2: 'active', 3: 'idle' }, activeRepairMessage: 'Issue found: Unsanitized input prop detected. Applying sanitization...' } : current)),
        schedule(13000, () => { setCode(baseCode); setState((current) => current ? { ...current, generatedCode: baseCode, scores: cycleTwoScores, cycleStates: { 1: 'resolved', 2: 'resolved', 3: 'idle' }, activeRepairMessage: undefined, repairLogs: [...current.repairLogs, { cycle: 2, previousScore: .79, localizedIssues: [{ category: 'Security', target: 'input prop', message: 'Unsanitized input prop detected.' }], repairedCode: baseCode, newScore: .93 }] } : current); }),
        schedule(14000, () => { setState((current) => current ? { ...current, status: 'TRUSTED', updatedAt: new Date().toISOString() } : current); setPending(false); }),
      );
    } else timers.push(schedule(5000, () => setPending(false)));
    return () => timers.forEach(window.clearTimeout);
  }, [simulation]);
  useEffect(() => { if (state?.status === 'TRUSTED') window.localStorage.setItem('trustui:last-run', JSON.stringify(state)); }, [state]);
  function runPipeline() {
    if (prompt.trim().length < 8) { setError('Enter a prompt of at least 8 characters.'); return; }
    const repair = /\b(complex|vulnerable)\b/i.test(prompt);
    setError(''); setPending(true); setCode('');
    setState({ id: `demo-${Date.now().toString(36)}`, userPrompt: prompt, uiSpec: analyseRequirements(prompt), generatedCode: '', scores: blankScores, repairLogs: [], cycleStates: { 1: 'idle', 2: 'idle', 3: 'idle' }, issues: [], status: 'ANALYZING', updatedAt: new Date().toISOString() });
    setSimulation({ id: Date.now(), prompt, repair });
  }
  return <main className="grid-noise min-h-[calc(100vh-64px)]"><div className="mx-auto max-w-[1700px] px-4 py-6 sm:px-6"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-300">Studio workspace</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Generate with proof, not just polish.</h1></div><p className="max-w-md text-sm leading-5 text-slate-400">Every draft is checked against functional, visual, accessibility, compliance, and security signals before delivery.</p></div>
    <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)_300px]">
      <section className="space-y-4"><div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-panel"><div className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles size={16} className="text-indigo-300" /> Prompt input</div><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mt-4 min-h-44 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /><Button onClick={runPipeline} disabled={pending} className="mt-3 w-full">{pending ? <LoaderCircle size={16} className="animate-spin" /> : <Play size={16} />} {pending ? 'Verifying draft…' : 'Run trust pipeline'}</Button>{error && <p className="mt-3 text-xs text-rose-300">{error}</p>}</div>
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-panel"><div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white"><Braces size={16} className="text-emerald-300" /> Source of truth</div><pre className="max-h-[420px] overflow-auto p-4 text-xs leading-5 text-slate-400">{spec}</pre></div></section>
      <section className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-panel"><div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><div className="flex gap-1 rounded-lg bg-slate-950 p-1"><button onClick={() => setActiveTab('preview')} className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${activeTab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><Eye size={14} /> Preview</button><button onClick={() => setActiveTab('code')} className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${activeTab === 'code' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><Code2 size={14} /> Code</button></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${state?.status === 'TRUSTED' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{state ? statusLabels[state.status] : 'AWAITING INPUT'}</span></div>
        <div className="h-[680px] bg-slate-950">{activeTab === 'preview' ? <iframe title="Interactive generated component preview" sandbox="allow-scripts" srcDoc={previewDocument(state?.uiSpec?.componentName ?? 'Your verified preview')} className="h-full w-full border-0" /> : <Editor height="680px" theme="vs-dark" language="typescript" value={code} onChange={(value) => setCode(value ?? '')} options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on', padding: { top: 16 } }} />}</div>
        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-xs text-slate-500"><span>Sandboxed interactive preview</span><span>{code ? `${code.split('\n').length} lines · editable` : 'No source generated'}</span></div></section>
      <Scorecard state={state} />
    </div></div></main>;
}
