import assert from 'node:assert/strict';
import test from 'node:test';
import {
    getCurrentMonthRange,
    resolveDateRange,
} from './period-range.ts';

test('getCurrentMonthRange returns the first day of the current month through today', () => {
    const range = getCurrentMonthRange(new Date('2026-06-03T15:00:00Z'));

    assert.deepEqual(range, {
        from: '2026-06-01',
        to: '2026-06-03',
    });
});

test('resolveDateRange uses the current month range for current-month', () => {
    const range = resolveDateRange(
        'current-month',
        { from: '', to: '' },
        new Date('2026-06-18T09:30:00Z'),
    );

    assert.deepEqual(range, {
        from: '2026-06-01',
        to: '2026-06-18',
    });
});

test('resolveDateRange keeps the custom period unchanged', () => {
    const range = resolveDateRange(
        'custom',
        { from: '2026-05-10', to: '2026-05-20' },
        new Date('2026-06-18T09:30:00Z'),
    );

    assert.deepEqual(range, {
        from: '2026-05-10',
        to: '2026-05-20',
    });
});
