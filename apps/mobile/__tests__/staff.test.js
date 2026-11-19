import { resultPlan } from '../src/screens/PublishResultScreen';
import { staffActions } from '../src/screens/ReviewScreen';

const report = (state, reviewerId = null) => ({ state, reviewerId });

test('staff see only the actions valid for the state and their role in it', () => {
  expect(staffActions(report('submitted'), 'me')).toEqual(['claim']);
  expect(staffActions(report('in_review', 'me'), 'me')).toEqual(['respond', 'ask']);
  expect(staffActions(report('in_review', 'other'), 'me')).toEqual([]); // only the claimer responds
  expect(staffActions(report('awaiting_information', 'me'), 'me')).toEqual([]);
  expect(staffActions(report('responded', 'me'), 'me')).toEqual(['close', 'result']);
  expect(staffActions(report('responded', 'other'), 'me')).toEqual(['result']);
  expect(staffActions(report('closed', 'me'), 'me')).toEqual(['result']);
  expect(staffActions(report('cancelled'), 'me')).toEqual([]);
});

test('a result is drafted, previewed, then corrected as a new version', () => {
  expect(resultPlan([]).mode).toBe('new');
  const v1 = { id: 'a', status: 'published', version: 1 };
  expect(resultPlan([v1])).toMatchObject({ mode: 'correct', latest: v1 });
  const v2 = { id: 'b', status: 'draft', version: 2 };
  expect(resultPlan([v1, v2])).toMatchObject({ mode: 'publish', draft: v2, latest: v1 });
});
