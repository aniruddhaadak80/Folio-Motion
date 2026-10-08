import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GdprBanner } from '../GdprBanner';

describe('GdprBanner', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  it('shows banner when no consent given', () => {
    render(<GdprBanner />);
    expect(screen.getByText(/we use cookies/i)).toBeInstanceOf(HTMLElement);
  });

  it('hides banner after accepting', async () => {
    render(<GdprBanner />);
    const acceptBtn = screen.getByRole('button', { name: /accept/i });
    await userEvent.click(acceptBtn);
    expect(screen.queryByText(/we use cookies/i)).toBeNull();
    expect(localStorage.getItem('gdprConsent')).toBe('true');
  });

  it('hides banner after declining', async () => {
    render(<GdprBanner />);
    const declineBtn = screen.getByRole('button', { name: /decline/i });
    await userEvent.click(declineBtn);
    expect(screen.queryByText(/we use cookies/i)).toBeNull();
    expect(localStorage.getItem('gdprConsent')).toBe('false');
  });

  it('does not show banner when consent already given', () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gdprConsent', 'true');
    }
    render(<GdprBanner />);
    expect(screen.queryByText(/we use cookies/i)).toBeNull();
  });
});