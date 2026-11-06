import assert from 'node:assert/strict';
import test from 'node:test';
import {
    formatInstantInAppTimeZone,
    nowInAppTimeZone,
    todayInAppTimeZone,
} from './app-timezone.ts';

test('todayInAppTimeZone uses the Manaus date, not UTC', () => {
    // 01:30 UTC on Nov 6 is still 21:30 on Nov 5 in Manaus (UTC-4).
    assert.equal(
        todayInAppTimeZone(new Date('2026-11-06T01:30:00Z')),
        '2026-11-05',
    );
    assert.equal(
        todayInAppTimeZone(new Date('2026-11-06T04:00:00Z')),
        '2026-11-06',
    );
});

test('nowInAppTimeZone returns the Manaus wall clock', () => {
    const now = nowInAppTimeZone(new Date('2026-11-06T01:30:00Z'));

    assert.equal(now.getFullYear(), 2026);
    assert.equal(now.getMonth(), 10);
    assert.equal(now.getDate(), 5);
    assert.equal(now.getHours(), 21);
    assert.equal(now.getMinutes(), 30);
});

test('formatInstantInAppTimeZone converts instants to Manaus time', () => {
    assert.equal(
        formatInstantInAppTimeZone('2026-11-06T01:30:00.000000Z'),
        '05/11/2026 21:30',
    );
    assert.equal(formatInstantInAppTimeZone('not a date'), null);
});
