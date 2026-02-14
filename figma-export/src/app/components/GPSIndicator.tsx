import { motion } from 'motion/react';

interface GPSIndicatorProps {
  position: { lat: number; lng: number };
  heading: number; // degrees
  orientationMode: 'north-up' | 'heading-up';
}

export function GPSIndicator({ position, heading, orientationMode }: GPSIndicatorProps) {
  // Position in center of screen for demo
  const screenX = '50%';
  const screenY = '50%';

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        left: screenX,
        top: screenY,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Heading Arrow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: 1 }}
        animate={{ rotate: orientationMode === 'north-up' ? heading : 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Solid Arrow Shape */}
        <div
          className="w-0 h-0"
          style={{
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderBottom: '32px solid #2B6E2F',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,1))',
            opacity: 1,
          }}
        />
      </motion.div>
    </div>
  );
}