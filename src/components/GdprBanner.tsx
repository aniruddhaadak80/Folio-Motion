import { useEffect, useState } from 'react';
import styles from './GdprBanner.module.css';

export const GdprBanner = () => {
  const [showBanner, setShowBanner] = useState(() => {
    return typeof window !== 'undefined' && !localStorage.getItem('gdprConsent');
  });

  const accept = () => {
    localStorage.setItem('gdprConsent', 'true');
    setShowBanner(false);
    // Optionally trigger a custom event
    window.dispatchEvent(new Event('gdprAccept'));
  };

  const decline = () => {
    localStorage.setItem('gdprConsent', 'false');
    setShowBanner(false);
    window.dispatchEvent(new Event('gdprDecline'));
  };

  // No need for effect; initial state already set.

  if (!showBanner) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <p className={styles.message}>
          We use cookies to ensure you get the best experience on our website. By
          clicking &quot;Accept&quot;, you consent to the use of ALL cookies.
        </p>
        <div className={styles.actions}>
          <button className={styles.button} onClick={decline}>
            Decline
          </button>
          <button className={styles.button} onClick={accept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};