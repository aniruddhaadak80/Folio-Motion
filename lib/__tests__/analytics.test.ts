import { describe, it, expect } from 'vitest';
import { trackPageView, trackEvent } from '../analytics';

describe('analytics', () => {
  it('should track page view', () => {
    // Spy on console.log
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    trackPageView('/home');
    expect(logSpy).toHaveBeenCalledWith('Analytics: Page view tracked for /home');
    logSpy.mockRestore();
  });

  it('should track event', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    trackEvent('UI', 'click', 'button1', 42);
    expect(logSpy).toHaveBeenCalledWith('Analytics: Event tracked - Category: UI, Action: click, Label: button1, Value: 42');
    logSpy.mockRestore();
  });

  it('should handle optional parameters', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    trackEvent('UI', 'hover');
    expect(logSpy).toHaveBeenCalledWith('Analytics: Event tracked - Category: UI, Action: hover, Label: , Value: 0');
    logSpy.mockRestore();
  });
});