import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

function Console() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9000');
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      setEvents(evts => [msg, ...evts.slice(0, 99)]);
    };
    return () => ws.close();
  }, []);

  // Map event types to styles
  const typeStyles = {
    overlay:  { background: '#ffdddd', border: '1px solid #f00' },
    recorder: { background: '#ffe2b8', border: '1px solid #f90' },
    blur:     { background: '#ddddee', border: '1px solid #00f' },
    screen:   { background: '#eef7ff', border: '1px solid #09f' }
  };

  return (
    <div>
      <h2 style={{ margin: '10px 16px' }}>Live Telemetry</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map(ev => {
          const baseStyle = typeStyles[ev.type] || { background: '#fff', border: '1px solid #ccc' };
          return (
            <li
              key={ev.ts}
              style={{
                background: baseStyle.background,
                border: baseStyle.border,
                margin: '4px 16px',
                padding: '8px',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ flexGrow: 1 }}>
                  {new Date(ev.ts).toLocaleTimeString()} — {ev.line}
                </span>
              </div>
              {ev.type === 'screen' && ev.img && (
                <img
                  src={`data:image/png;base64,${ev.img}`}
                  alt="screenshot"
                  style={{
                    display: 'block',
                    marginTop: '8px',
                    maxWidth: '200px',
                    maxHeight: '150px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.body).render(<Console />);
