/* Configure Monaco workers without the plugin */
self.MonacoEnvironment = {
  getWorker(_, label) {
    const workers = {
      json:  '/vs/language/json/json.worker.js',
      css:   '/vs/language/css/css.worker.js',
      html:  '/vs/language/html/html.worker.js',
      ts:    '/vs/language/typescript/ts.worker.js'
    };
    const defaultWorker = '/vs/editor/editor.worker.js';
    const url = workers[label] || defaultWorker;
    return new Worker(new URL(url, import.meta.url), { type: 'module' });
  }
};

import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import Editor from '@monaco-editor/react';
import Timer from './Timer.jsx';
import { broadcast } from '../relay.js';

function App() {
  // 90 minutes in milliseconds
  const examLength = 90 * 60 * 1000;

  // editor ref to capture code snapshot
  const editorRef = useRef(null);

  // state for expired and closing countdown
  const [expired, setExpired] = useState(false);
  const [closingIn, setClosingIn] = useState(5);

  // called when timer reaches zero
  const handleExpire = () => {
    // broadcast examEnd event
    broadcast({ ts: Date.now(), type: 'examEnd', line: 'Timer expired' });

    // capture and upload code snapshot
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      const blob = new Blob([code], { type: 'text/plain' });
      const form = new FormData();
      form.append('snapshot', blob, 'answer.txt');
      fetch('http://localhost:9002/upload', { method: 'POST', body: form })
        .catch(console.error);
    }

    // show expired overlay and start closing countdown
    setExpired(true);
    let t = 5;
    const id = setInterval(() => {
      t -= 1;
      setClosingIn(t);
      if (t <= 0) {
        clearInterval(id);
        // request Electron to quit via IPC
        window.electronAPI?.quitAfterTimer?.();
      }
    }, 1000);
  };

  // save editor instance on mount
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Countdown timer in top-right */}
      <Timer durationMs={examLength} onExpire={handleExpire} />

      {/* Your Monaco editor (read-only when expired) */}
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue="// Happy coding!"
        theme="vs-dark"
        options={{ minimap: { enabled: false }, readOnly: expired }}
        onMount={handleEditorMount}
      />

      {/* Expired overlay */}
      {expired && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', color: '#fff',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 24, zIndex: 9999, textAlign: 'center'
        }}>
          <p>Time is up! The editor is now locked.</p>
          <p>Closing in {closingIn} second{closingIn === 1 ? '' : 's'}…</p>
          <p style={{ marginTop: 20, fontSize: 18 }}>Thank you for participating.</p>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
