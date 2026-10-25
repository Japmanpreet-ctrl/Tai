export interface StructuredUISpec {
  componentName: string;
  functionalRequirements: string[];
  designRequirements: { theme: string; responsive: boolean; layout: string };
  technicalConstraints: string[];
  accessibilityStandards: string[];
}

export interface VerificationScores {
  functional: number;
  visual: number;
  accessibility: number;
  compliance: number;
  security: number;
  overall: number;
}

export interface LocalizedIssue { category: string; target: string; message: string }

export interface RepairCycleLog {
  cycle: number;
  previousScore: number;
  localizedIssues: LocalizedIssue[];
  repairedCode: string;
  newScore: number;
}

export type PipelineStatus = 'ANALYZING' | 'GENERATING' | 'VERIFYING' | 'REPAIRING' | 'TRUSTED' | 'FAILED_HUMAN_REVIEW';
export type RepairCycleState = 'idle' | 'active' | 'resolved';

export interface PipelineState {
  id: string;
  userPrompt: string;
  uiSpec?: StructuredUISpec;
  generatedCode: string;
  scores: VerificationScores;
  initialScores?: VerificationScores;
  repairLogs: RepairCycleLog[];
  cycleStates?: Record<number, RepairCycleState>;
  activeRepairMessage?: string;
  issues: LocalizedIssue[];
  status: PipelineStatus;
  updatedAt: string;
}
