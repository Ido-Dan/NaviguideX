import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface CompassOverlayProps {
  mode: 'north-up' | 'heading-up';
  onToggle: () => void;
}

export function CompassOverlay({ mode, onToggle }: CompassOverlayProps) {
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    setShowLabel(true);
    const timer = setTimeout(() => setShowLabel(false), 1500);
    return () => clearTimeout(timer);
  }, [mode]);

  return (
    <div className="absolute top-4 right-4 z-30">
      <button
        onClick={onToggle}
        className="relative w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/50 transition-colors"
        aria-label={`Toggle orientation mode (current: ${mode})`}
      >
        {/* Compass Background - Gradient Circle */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#4CAF50] to-[#2B6E2F] opacity-90" />
        
        {/* Compass Rose */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: mode === 'heading-up' ? -45 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* North Arrow (Orange) */}
          <div className="absolute w-12 h-12">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '24px solid #F57C00',
              }}
            />
          </div>
          
          {/* South Arrow (White) */}
          <div className="absolute w-12 h-12 rotate-180">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 opacity-70"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '24px solid white',
              }}
            />
          </div>

          {/* Cardinal Direction Letters */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-white text-xs font-bold">
            N
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-white/70 text-xs font-bold">
            S
          </div>
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 text-white/70 text-xs font-bold">
            W
          </div>
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 text-white/70 text-xs font-bold">
            E
          </div>
        </motion.div>

        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-sm" />
      </button>

      {/* Mode Label (appears briefly on toggle) */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full"
        >
          {mode === 'north-up' ? 'North Up' : 'Heading Up'}
        </motion.div>
      )}
    </div>
  );
}