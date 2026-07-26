import React from 'react';
import { createRoot } from 'react-dom/client';
import CortexWidget from './Widget';
import '../index.css';

const init = () => {
  // Evita injeção duplicada
  if (document.getElementById('cortex-extension-root')) return;

  const container = document.createElement('div');
  container.id = 'cortex-extension-root';
  
  // Para garantir que o widget fique acima de tudo e não herde estilos estranhos
  container.style.position = 'fixed';
  container.style.zIndex = '999999';
  
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(React.createElement(CortexWidget));
};

// Aguarda o DOM estar pronto e injeta
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
