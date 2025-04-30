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

  return (
    <div>
      <h2 style={{ margin: '10px 16px' }}>Live Telemetry</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map(ev => {
          // pick colour by type for each event
          const backgroundColor =
            ev.type === 'overlay' ? '#ffdddd' /* light red */ : '#ffe2b8' /* light orange */;

          return (
            <li
              key={ev.ts}
              style={{
                background: backgroundColor,
                margin: '4px 16px',
                padding: '4px 8px',
                border: ev.type === 'overlay' ? '1px solid #f00' : '1px solid #f90',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}
            >
              {new Date(ev.ts).toLocaleTimeString()} — {ev.line}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.body).render(<Console />);
