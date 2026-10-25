import { LocalizedIssue, StructuredUISpec, VerificationScores } from '@/lib/types/trustui';

const clamp = (score: number) => Math.max(0, Math.min(1, score));

export function verifyCode(code: string, spec: StructuredUISpec): { scores: VerificationScores; issues: LocalizedIssue[] } {
  const issues: LocalizedIssue[] = [];
  const has = (expression: RegExp) => expression.test(code);
  let functional = 1;
  let visual = 1;
  let accessibility = 1;
  let compliance = 1;
  let security = 1;

  if (!has(/export\s+default\s+function|export\s+default\s*\(/)) { functional -= .45; issues.push({ category: 'Functional', target: 'module export', message: 'No default React component export was found.' }); }
  if (!has(/onClick|onSubmit|onChange/)) { functional -= .18; issues.push({ category: 'Functional', target: 'interactive control', message: 'No event handler was found for user interaction.' }); }
  if (!has(/className=/)) { visual -= .5; issues.push({ category: 'Visual', target: 'component', message: 'No visual utility classes were found.' }); }
  if (!has(/(?:sm:|md:|lg:|max-w-|w-full)/)) { visual -= .18; issues.push({ category: 'Visual', target: 'layout', message: 'Responsive sizing or breakpoint utility is missing.' }); }
  if (/<img(?![^>]*\balt=)/.test(code)) { accessibility -= .35; issues.push({ category: 'Accessibility', target: '<img>', message: 'Image requires descriptive alt text.' }); }
  if (/<button(?![^>]*\btype=)/.test(code)) { accessibility -= .12; issues.push({ category: 'Accessibility', target: '<button>', message: 'Button should declare its type.' }); }
  if (!has(/aria-|htmlFor=|role=/)) { accessibility -= .16; issues.push({ category: 'Accessibility', target: 'semantics', message: 'No ARIA, labels, or semantic status patterns were found.' }); }
  if (has(/dangerouslySetInnerHTML|\beval\s*\(|document\.write/)) { security -= .8; issues.push({ category: 'Security', target: 'unsafe API', message: 'Unsafe dynamic HTML or code execution is prohibited.' }); }
  if (has(/(?:api[_-]?key|secret|token)\s*[:=]\s*['"][^'"]{8,}/i)) { security -= .55; issues.push({ category: 'Security', target: 'source code', message: 'A possible hard-coded credential was detected.' }); }
  if (!has(new RegExp(spec.componentName, 'i'))) { compliance -= .18; issues.push({ category: 'Compliance', target: 'component identity', message: 'Generated component does not match the structured spec name.' }); }
  if (spec.functionalRequirements.some((requirement) => /form/i.test(requirement)) && !has(/<form|<input|<textarea/)) { compliance -= .25; issues.push({ category: 'Compliance', target: 'form requirement', message: 'Required form controls were not found.' }); }

  const scores = { functional: clamp(functional), visual: clamp(visual), accessibility: clamp(accessibility), compliance: clamp(compliance), security: clamp(security), overall: 0 };
  scores.overall = Number(((scores.functional + scores.visual + scores.accessibility + scores.compliance + scores.security) / 5).toFixed(2));
  return { scores, issues };
}
