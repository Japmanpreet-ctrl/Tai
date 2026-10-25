import { analyseRequirements } from '@/lib/services/requirement-agent';
import { generateComponent } from '@/lib/services/code-gen-agent';
import { verifyCode } from '@/lib/services/trust-verifier';
import { PipelineState } from '@/lib/types/trustui';

const emptyScores = { functional: 0, visual: 0, accessibility: 0, compliance: 0, security: 0, overall: 0 };
const uid = () => `trust-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export async function runClosedLoopPipeline(prompt: string, updateCb?: (state: PipelineState) => void): Promise<PipelineState> {
  const state: PipelineState = { id: uid(), userPrompt: prompt, generatedCode: '', scores: emptyScores, repairLogs: [], issues: [], status: 'ANALYZING', updatedAt: new Date().toISOString() };
  updateCb?.(state);
  state.uiSpec = analyseRequirements(prompt);
  state.status = 'GENERATING';
  state.generatedCode = generateComponent(state.uiSpec);
  updateCb?.({ ...state });
  state.status = 'VERIFYING';
  let result = verifyCode(state.generatedCode, state.uiSpec);
  state.initialScores = result.scores;
  state.scores = result.scores;
  state.issues = result.issues;
  for (let cycle = 1; state.scores.overall < .85 && cycle <= 3; cycle += 1) {
    state.status = 'REPAIRING';
    const previousScore = state.scores.overall;
    const fixes = state.issues.map((issue) => `${issue.target}: ${issue.message}`);
    state.generatedCode = generateComponent(state.uiSpec, fixes);
    result = verifyCode(state.generatedCode, state.uiSpec);
    state.repairLogs.push({ cycle, previousScore, localizedIssues: state.issues, repairedCode: state.generatedCode, newScore: result.scores.overall });
    state.scores = result.scores;
    state.issues = result.issues;
    updateCb?.({ ...state });
  }
  state.status = state.scores.overall >= .85 ? 'TRUSTED' : 'FAILED_HUMAN_REVIEW';
  state.updatedAt = new Date().toISOString();
  updateCb?.(state);
  return state;
}
