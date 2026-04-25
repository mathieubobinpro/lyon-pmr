import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { StyleguideScreen } from './components/screens/StyleguideScreen.tsx';
import './styles/index.css';

// /styleguide accessible en dev via /#styleguide
const isStyleguide = window.location.hash === '#styleguide';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isStyleguide ? <StyleguideScreen /> : <App />}
  </StrictMode>,
);
