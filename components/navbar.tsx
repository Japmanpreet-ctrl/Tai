import Link from 'next/link';
import { Activity, ShieldCheck } from 'lucide-react';

const links = [{ href: '/', label: 'Studio' }, { href: '/analytics', label: 'Verification analytics' }, { href: '/logs', label: 'Audit logs' }];

export function Navbar() {
  return <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/85 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-[1700px] items-center gap-6 px-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500"><ShieldCheck size={18} /></span>TrustUI</Link>
      <nav className="hidden items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 p-1 md:flex">{links.map((link) => <Link key={link.href} href={link.href} className="rounded-md px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">{link.label}</Link>)}</nav>
      <div className="ml-auto flex items-center gap-2 rounded-full border border-emerald-900/70 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-300"><Activity size={13} /> Verification system online</div>
    </div>
  </header>;
}
