export const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { ViraProvider } from '@vira-ui/ui';
import { App } from './App';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ViraProvider hideDataDesign={false} theme="default">
      <App />
    </ViraProvider>
  </React.StrictMode>
);
`;