import { engagedMsSince, IDLE_TIMEOUT_MS, onResumeFromIdle } from '../user-activity';

describe('user activity idle detection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stops counting engaged time once the visitor goes idle', () => {
    const unsubscribe = onResumeFromIdle(() => {});
    window.dispatchEvent(new Event('pointermove'));
    const start = Date.now();

    jest.setSystemTime(start + 10 * 60_000);
    expect(engagedMsSince(start)).toBe(IDLE_TIMEOUT_MS);
    unsubscribe();
  });

  it('reports when idling began on the next input', () => {
    const listener = jest.fn();
    const unsubscribe = onResumeFromIdle(listener);
    window.dispatchEvent(new Event('pointermove'));
    const lastInput = Date.now();

    jest.setSystemTime(lastInput + 5 * 60_000);
    window.dispatchEvent(new Event('keydown'));
    expect(listener).toHaveBeenCalledWith(lastInput + IDLE_TIMEOUT_MS);
    unsubscribe();
  });

  it('does not report a resume for continuous activity', () => {
    const listener = jest.fn();
    const unsubscribe = onResumeFromIdle(listener);
    window.dispatchEvent(new Event('pointermove'));

    jest.setSystemTime(Date.now() + 5_000);
    window.dispatchEvent(new Event('pointermove'));
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});
