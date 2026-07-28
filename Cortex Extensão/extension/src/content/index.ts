import React from 'react';
import { createRoot } from 'react-dom/client';
import CortexWidget from './Widget';
import cssText from '../index.css?inline';

const init = () => {
  // Evita injeção duplicada
  if (document.getElementById('cortex-extension-root')) return;

  const host = (window.location.hostname || '').toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.startsWith('192.168.')
  ) {
    return;
  }

  const container = document.createElement('div');
  container.id = 'cortex-extension-root';
  
  // Para garantir que o widget fique acima de tudo e não herde estilos estranhos
  container.style.position = 'fixed';
  container.style.zIndex = '999999';
  
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = cssText;
  shadow.appendChild(style);

  const mount = document.createElement('div');
  shadow.appendChild(mount);

  const root = createRoot(mount);
  root.render(React.createElement(CortexWidget));
};

// Aguarda o DOM estar pronto e injeta
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
