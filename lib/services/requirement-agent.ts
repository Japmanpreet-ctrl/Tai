import { StructuredUISpec } from '@/lib/types/trustui';

const titleCase = (value: string) => {
  const name = value.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/).slice(0, 3).map((word) => word[0]?.toUpperCase() + word.slice(1)).join('') || 'GeneratedInterface';
  return /^[$A-Z_]/i.test(name) ? name : `Generated${name}`;
};

export function analyseRequirements(prompt: string): StructuredUISpec {
  const text = prompt.toLowerCase();
  const requests = [
    text.includes('form') ? 'Provide a usable form with labeled controls and clear validation states.' : null,
    text.includes('dashboard') || text.includes('analytics') ? 'Present key information in scannable dashboard sections.' : null,
    text.includes('button') || text.includes('action') ? 'Expose a clear primary action with keyboard access.' : null,
    'Maintain a deliberate visual hierarchy and responsive layout.',
  ].filter(Boolean) as string[];
  return {
    componentName: titleCase(prompt),
    functionalRequirements: requests,
    designRequirements: { theme: 'Slate and neutral dark with indigo actions', responsive: true, layout: text.includes('dashboard') ? 'Responsive dashboard grid' : 'Responsive content card' },
    technicalConstraints: ['React component', 'Tailwind utility classes', 'No unsafe HTML injection'],
    accessibilityStandards: ['WCAG_2.1_AA', 'Keyboard navigation', 'Semantic landmarks'],
  };
}
