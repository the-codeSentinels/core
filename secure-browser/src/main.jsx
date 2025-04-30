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
import { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import Editor from '@monaco-editor/react';

function App() {
  const options = useMemo(() => ({ minimap: { enabled: false } }), []);
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue="// Happy coding!"
        theme="vs-dark"
        options={options}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
