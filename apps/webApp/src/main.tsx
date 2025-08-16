import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { App } from './app/app';
import { ClerkProvider } from './app/providers/ClerkProvider';
import { QueryProvider } from './app/providers/QueryProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <ClerkProvider>
          <App />
        </ClerkProvider>
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>
);
