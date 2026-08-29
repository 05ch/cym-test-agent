import { CompositeScoreBreakdown } from './entities.js';

export interface ScoreInputs {
  correctness: number;    // 0 - 100 (Hard assertions, build & tests passing)
  mutationPower: number;  // 0 - 100 (Mutation killed rate)
  scopeDiscipline: number;// 0 - 100 (No out-of-scope modifications)
  efficiency: number;     // 0 - 100 (Token & Tool efficiency score)
  stability: number;      // 0 - 100 (Deterministic reproducibility)
}

export function calculateCompositeScore(inputs: ScoreInputs): CompositeScoreBreakdown {
  const compositeScore = Number((
    0.40 * inputs.correctness +
    0.25 * inputs.mutationPower +
    0.15 * inputs.scopeDiscipline +
    0.10 * inputs.efficiency +
    0.10 * inputs.stability
  ).toFixed(2));

  return {
    correctness: inputs.correctness,
    mutationPower: inputs.mutationPower,
    scopeDiscipline: inputs.scopeDiscipline,
    efficiency: inputs.efficiency,
    stability: inputs.stability,
    compositeScore
  };
}
