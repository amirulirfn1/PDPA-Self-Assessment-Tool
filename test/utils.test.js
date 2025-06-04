import { calculateScore } from '../src/js/utils';

describe('calculateScore', () => {
  test('computes score and improvement areas', () => {
    const responses = {
      q1: 'Yes',
      q2: 'No',
      q3: 'Partially',
      q4: 'No'
    };
    const { normalizedScore, improvementAreas } = calculateScore(responses, 4);
    expect(normalizedScore).toBeCloseTo(((2 + 0 + 1 + 0) / 8) * 100);
    expect(improvementAreas).toEqual(['q2', 'q4']);
  });
});
