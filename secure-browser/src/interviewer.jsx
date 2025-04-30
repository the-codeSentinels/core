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
      <h2 style={{margin:'10px 16px'}}>Live Telemetry</h2>
      <ul style={{listStyle:'none',padding:0}}>
        {events.map(ev => (
          <li key={ev.ts}
              style={{background:'#ffecec',margin:'4px 16px',padding:'4px 8px',
                      border:'1px solid #f00',borderRadius:'4px'}}>
            {new Date(ev.ts).toLocaleTimeString()} — {ev.line}
          </li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.body).render(<Console />);
