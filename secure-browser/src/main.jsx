/* Configure Monaco workers without the plugin */
self.MonacoEnvironment = {
  getWorker(_, label) {
    const workers = {
      json:  'monaco-editor/esm/vs/language/json/json.worker?worker',
      css:   'monaco-editor/esm/vs/language/css/css.worker?worker',
      html:  'monaco-editor/esm/vs/language/html/html.worker?worker',
      ts:    'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
    };
    const url = workers[label] ||
      'monaco-editor/esm/vs/editor/editor.worker?worker';
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
