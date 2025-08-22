import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { App } from './app/app';
import { ClerkProvider } from './app/providers/ClerkProvider';
import { QueryProvider } from './app/providers/QueryProvider';
import { ServicesProvider } from './app/providers/ServicesProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <QueryProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ClerkProvider>
          <ServicesProvider>
            <App />
          </ServicesProvider>
        </ClerkProvider>
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>
);
