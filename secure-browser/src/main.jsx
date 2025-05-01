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

import React from 'react';
import ReactDOM from 'react-dom/client';
import Editor from '@monaco-editor/react';
import Timer from './Timer.jsx';
import { broadcast } from '../relay.js';

function App() {
  // 90 minutes in milliseconds
  const examLength = 90 * 60 * 1000;

  // called when timer reaches zero
  const handleExpire = () => {
    broadcast({ ts: Date.now(), type: 'examEnd', line: 'Timer expired' });
    // replace the entire UI with a "Time is up!" message
    ReactDOM.createRoot(document.getElementById('root')).render(
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: 32,
        fontFamily: 'sans-serif'
      }}>
        Time is up!
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {/* Countdown timer in top-right */}
      <Timer durationMs={examLength}   onExpire={handleExpire}/>

      {/* Your Monaco editor */}
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue="// Happy coding!"
        theme="vs-dark"
        options={{ minimap: { enabled: false } }}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
