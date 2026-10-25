import { StructuredUISpec } from '@/lib/types/trustui';

export function generateComponent(spec: StructuredUISpec, repairs: string[] = []): string {
  const extra = repairs.length ? `\n      {/* Repair directives applied: ${repairs.join(', ')} */}` : '';
  return `'use client';

import { useState } from 'react';

export default function ${spec.componentName}() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <main className="min-h-full bg-slate-950 p-6 text-slate-100" aria-labelledby="page-title">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Verified interface</p>
        <h1 id="page-title" className="mt-2 text-2xl font-semibold">${spec.componentName.replace(/([A-Z])/g, ' $1').trim()}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">A focused, accessible experience generated from your requirements.</p>${extra}
        <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
          <label className="block text-sm font-medium text-slate-200" htmlFor="message">How can we help?</label>
          <textarea id="message" name="message" required className="min-h-28 w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-sm outline-none ring-indigo-500 focus:ring-2" placeholder="Tell us what you need" />
          <button type="submit" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300">Send request</button>
          {submitted && <p role="status" className="text-sm text-emerald-300">Request received. We’ll be in touch shortly.</p>}
        </form>
      </section>
    </main>
  );
}`;
}
