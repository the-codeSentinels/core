// src/Timer.jsx
import React, { useState, useEffect } from 'react';

/**
 * Timer component
 * • If durationMs is provided, starts immediately.
 * • Otherwise shows an interviewer panel to pick minutes and start.
 * After countdown reaches zero, calls onExpire(), disables editing,
 * shows a 5s "closing" overlay, then closes the window.
 */
export default function Timer({ durationMs, onExpire = () => {} }) {
  const [setupMinutes, setSetupMinutes] = useState(90);
  const [started, setStarted]         = useState(Boolean(durationMs));
  const [remaining, setRemaining]     = useState(durationMs ?? 0);
  const [expired, setExpired]         = useState(false);
  const [closingIn, setClosingIn]     = useState(5);

  useEffect(() => {
    if (!started || expired) return;
    if (remaining <= 0) {
      setExpired(true);
      onExpire();
      // start closing countdown
      let t = 5;
      const interval = setInterval(() => {
        t -= 1;
        setClosingIn(t);
        if (t <= 0) {
          clearInterval(interval);
          window.electronAPI?.quitAfterTimer?.();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
    const tick = setInterval(() => {
      setRemaining(r => Math.max(0, r - 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [started, remaining, expired, onExpire]);

  if (!started) {
    return (
      <div style={panelStyle}>
        <h3 style={{ margin: '0 0 8px 0' }}>Set exam timer</h3>
        <input
          type="number"
          min={10}
          max={180}
          step={5}
          value={setupMinutes}
          onChange={e => setSetupMinutes(Number(e.target.value))}
          style={inputStyle}
        />
        <span style={{ marginLeft: 4 }}>minutes</span>
        <button
          style={buttonStyle}
          onClick={() => {
            setRemaining(setupMinutes * 60_000);
            setStarted(true);
          }}
        >
          Start
        </button>
      </div>
    );
  }

  // expired overlay
  if (expired) {
    return (
      <div style={overlayStyle}>
        <p>Time is up! The editor is now locked.</p>
        <p>Closing in {closingIn} second{closingIn === 1 ? '' : 's'}…</p>
        <p style={{ marginTop: 20, fontSize: 18 }}>Thank you for participating.</p>
      </div>
    );
  }

  // running countdown
  const mins = Math.floor(remaining / 60_000);
  const secs = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, '0');
  return (
    <div style={timerStyle}>
      {mins}:{secs}
    </div>
  );
}

const timerStyle = {
  position: 'absolute', top: 10, right: 10,
  background: 'rgba(0,0,0,0.6)', color: '#fff',
  padding: '4px 8px', borderRadius: 4,
  fontFamily: 'monospace', zIndex: 999
};
const panelStyle = {
  position: 'absolute', top: 10, right: 10,
  background: 'rgba(0,0,0,0.8)', color: '#fff',
  padding: '12px 16px', borderRadius: 6,
  fontFamily: 'sans-serif', zIndex: 999,
  display: 'flex', alignItems: 'center', gap: 8
};
const inputStyle = {
  width: 64, padding: '2px 4px', borderRadius: 4,
  border: '1px solid #888', fontSize: 14
};
const buttonStyle = {
  marginLeft: 8, padding: '4px 10px',
  background: '#2e90ff', border: 'none',
  borderRadius: 4, color: '#fff', cursor: 'pointer',
  fontSize: 14
};
const overlayStyle = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.8)', color: '#fff',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  fontSize: 24, zIndex: 9999, textAlign: 'center'
};
