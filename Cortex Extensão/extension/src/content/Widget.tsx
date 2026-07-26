import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, GripHorizontal, Maximize2, Minimize2 } from 'lucide-react';

const CortexWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Calcula limites da tela
  const getConstraints = () => ({
    left: 10,
    top: 10,
    right: window.innerWidth - 390, // largura (380) + margem
    bottom: window.innerHeight - (isMinimized ? 60 : 510) // altura + margem
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999]">
      {/* Botão Flutuante Principal */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto fixed bottom-6 right-6 w-14 h-14 bg-accent rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer hover:bg-accent/90 transition-colors border-4 border-white dark:border-notion-bgDark"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Janela Flutuante Draggable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={getConstraints()}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            initial={{ 
              opacity: 0, 
              scale: 0.95,
              x: window.innerWidth - 400,
              y: window.innerHeight - 520
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px',
              width: '380px'
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-auto fixed top-0 left-0 bg-white dark:bg-notion-bgDark rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
            style={{ touchAction: 'none' }}
          >
            {/* Header / Drag Handle */}
            <div className="flex items-center justify-between px-4 py-3 bg-notion-hover dark:bg-white/5 cursor-grab active:cursor-grabbing border-b border-border select-none">
              <div className="flex items-center gap-2">
                <GripHorizontal size={16} className="text-notion-text/40" />
                <span className="text-xs font-bold text-notion-text-h dark:text-white uppercase tracking-wider">Cortex AI</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors pointer-events-auto"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-notion-text/40 hover:text-red-500 rounded-md transition-colors pointer-events-auto"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Conteúdo da Janela */}
            {!isMinimized && (
              <div className="flex-1 flex flex-col bg-notion-bgLight dark:bg-notion-bgDark relative">
                {/* Overlay transparente para evitar que o iframe capture o mouse durante o drag */}
                {isDragging && <div className="absolute inset-0 z-10 bg-transparent" />}
                
                <iframe 
                  src={chrome.runtime.getURL('index.html')} 
                  className="w-full h-full border-none"
                  title="Cortex Content"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CortexWidget;
