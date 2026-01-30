import { describe, it, expect } from 'vitest';
import { formatTime, formatTimeWithCentiseconds } from './timeFormat';

describe('formatTime', () => {
  it('should format 0 seconds as 0:00', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('should format 5 seconds as 0:05 (zero-padded seconds)', () => {
    expect(formatTime(5)).toBe('0:05');
  });

  it('should format 65 seconds as 1:05', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('should format 125 seconds as 2:05', () => {
    expect(formatTime(125)).toBe('2:05');
  });

  it('should format 90 seconds as 1:30', () => {
    expect(formatTime(90)).toBe('1:30');
  });

  it('should format 765 seconds as 12:45', () => {
    expect(formatTime(765)).toBe('12:45');
  });

  it('should format 3599 seconds as 59:59', () => {
    expect(formatTime(3599)).toBe('59:59');
  });

  it('should format 3600 seconds as 60:00 (past 59:59)', () => {
    expect(formatTime(3600)).toBe('60:00');
  });

  it('should format 7200 seconds as 120:00 (two hours)', () => {
    expect(formatTime(7200)).toBe('120:00');
  });

  it('should format 10 seconds as 0:10', () => {
    expect(formatTime(10)).toBe('0:10');
  });

  it('should format 59 seconds as 0:59', () => {
    expect(formatTime(59)).toBe('0:59');
  });

  it('should format 60 seconds as 1:00', () => {
    expect(formatTime(60)).toBe('1:00');
  });
});

describe('formatTimeWithCentiseconds', () => {
  it('should format 0 centiseconds as 0:00.00', () => {
    expect(formatTimeWithCentiseconds(0)).toBe('0:00.00');
  });

  it('should format 50 centiseconds as 0:00.50', () => {
    expect(formatTimeWithCentiseconds(50)).toBe('0:00.50');
  });

  it('should format 100 centiseconds (1 second) as 0:01.00', () => {
    expect(formatTimeWithCentiseconds(100)).toBe('0:01.00');
  });

  it('should format 6523 centiseconds (65.23 seconds) as 1:05.23', () => {
    expect(formatTimeWithCentiseconds(6523)).toBe('1:05.23');
  });

  it('should format 12545 centiseconds (125.45 seconds) as 2:05.45', () => {
    expect(formatTimeWithCentiseconds(12545)).toBe('2:05.45');
  });

  it('should format 9099 centiseconds (90.99 seconds) as 1:30.99', () => {
    expect(formatTimeWithCentiseconds(9099)).toBe('1:30.99');
  });

  it('should format 76501 centiseconds (765.01 seconds) as 12:45.01', () => {
    expect(formatTimeWithCentiseconds(76501)).toBe('12:45.01');
  });

  it('should format 5 centiseconds as 0:00.05', () => {
    expect(formatTimeWithCentiseconds(5)).toBe('0:00.05');
  });
});
