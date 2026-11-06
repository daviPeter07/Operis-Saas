import assert from 'node:assert/strict';
import test from 'node:test';
import {
    bucketKeyFor,
    buildSeriesBuckets,
    comparePeriods,
    formatComparisonRange,
    formatRangeLabel,
    getCurrentMonthRange,
    resolveDateRange,
    resolvePreviousRange,
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

test('resolvePreviousRange compares the current month with the same days of last month', () => {
    assert.deepEqual(
        resolvePreviousRange('current-month', {
            from: '2026-11-01',
            to: '2026-11-05',
        }),
        { from: '2026-10-01', to: '2026-10-05' },
    );
    assert.deepEqual(
        resolvePreviousRange('current-month', {
            from: '2026-03-01',
            to: '2026-03-31',
        }),
        { from: '2026-02-01', to: '2026-02-28' },
    );
});

test('resolvePreviousRange uses the window of the same length right before rolling periods', () => {
    assert.deepEqual(
        resolvePreviousRange('7d', { from: '2026-11-01', to: '2026-11-07' }),
        { from: '2026-10-25', to: '2026-10-31' },
    );
    assert.equal(resolvePreviousRange('all', null), null);
    assert.equal(
        resolvePreviousRange('next-month', {
            from: '2026-11-05',
            to: '2026-12-05',
        }),
        null,
    );
});

test('comparePeriods reports growth, drops and missing baselines', () => {
    assert.deepEqual(comparePeriods(150, 100), {
        direction: 'up',
        percent: 50,
    });
    assert.deepEqual(comparePeriods(50, 100), {
        direction: 'down',
        percent: -50,
    });
    assert.deepEqual(comparePeriods(100, 100), {
        direction: 'flat',
        percent: 0,
    });
    assert.deepEqual(comparePeriods(80, 0), { direction: 'up', percent: null });
    assert.deepEqual(comparePeriods(0, 0), {
        direction: 'flat',
        percent: null,
    });
});

test('buildSeriesBuckets uses days for short ranges and months for long ones', () => {
    const daily = buildSeriesBuckets({ from: '2026-11-01', to: '2026-11-05' });
    assert.equal(daily.length, 5);
    assert.deepEqual(daily[0], { key: '2026-11-01', label: '01/11' });
    assert.equal(bucketKeyFor('2026-11-03', daily), '2026-11-03');

    const monthly = buildSeriesBuckets({
        from: '2025-11-05',
        to: '2026-11-05',
    });
    assert.equal(monthly.length, 13);
    assert.deepEqual(monthly[0], { key: '2025-11', label: '11/25' });
    assert.equal(bucketKeyFor('2026-02-17', monthly), '2026-02');
});

test('formatRangeLabel writes the period in Brazilian format', () => {
    assert.equal(
        formatRangeLabel({ from: '2026-11-01', to: '2026-11-05' }),
        '01/11/2026 a 05/11/2026',
    );
});

test('formatComparisonRange shows day and month, and the year only across years', () => {
    assert.equal(
        formatComparisonRange({ from: '2026-10-01', to: '2026-10-06' }),
        '01/10 a 06/10',
    );
    assert.equal(
        formatComparisonRange({ from: '2025-11-07', to: '2026-11-06' }),
        '07/11/25 a 06/11/26',
    );
    assert.equal(
        formatComparisonRange({ from: '2026-10-05', to: '2026-10-05' }),
        '05/10',
    );
});
