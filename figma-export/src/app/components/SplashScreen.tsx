import { motion } from 'motion/react';
import naviguideLogoImg from 'figma:asset/c665d1574960cb17d6384c8168d64f109367fd47.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#E8F5E9] via-[#F1F8F2] to-[#FFF3E0]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        setTimeout(onComplete, 2000);
      }}
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="splash-contours" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 0 50 Q 50 40 100 50 T 200 50" stroke="#2B6E2F" fill="none" strokeWidth="1" opacity="0.3" />
              <path d="M 0 100 Q 50 85 100 100 T 200 100" stroke="#2B6E2F" fill="none" strokeWidth="1.5" opacity="0.5" />
              <path d="M 0 150 Q 50 135 100 150 T 200 150" stroke="#2B6E2F" fill="none" strokeWidth="1" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#splash-contours)" />
        </svg>
      </div>

      {/* Logo Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10"
      >
        <img
          src={naviguideLogoImg}
          alt="NaviGuide"
          className="h-28 md:h-36 object-contain"
        />
      </motion.div>

      {/* Subtitle */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-6 text-center"
      >
        <h2 className="text-[#2B6E2F] text-lg md:text-xl font-semibold mb-1">
          NaviguideX
        </h2>
        <p className="text-[#5F7F61] text-sm md:text-base">
          Offroad Navigation for Israel
        </p>
      </motion.div>

      {/* Subtle Animated Compass Rings */}
      <motion.div
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 360, opacity: 0.15 }}
        transition={{ 
          rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
          opacity: { duration: 0.6, delay: 0.5 }
        }}
        className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full border border-[#81C784]"
      />

      <motion.div
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: -360, opacity: 0.1 }}
        transition={{ 
          rotate: { duration: 5, repeat: Infinity, ease: 'linear' },
          opacity: { duration: 0.6, delay: 0.6 }
        }}
        className="absolute w-96 h-96 md:w-[28rem] md:h-[28rem] rounded-full border border-[#FFB74D]"
      />

      {/* Minimal Loading Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-24 flex flex-col items-center"
      >
        <div className="flex gap-2 mb-2">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
            className="w-1.5 h-1.5 rounded-full bg-[#81C784]"
          />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-[#81C784]"
          />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            className="w-1.5 h-1.5 rounded-full bg-[#81C784]"
          />
        </div>
        <p className="text-[#7A7267] text-xs">Loading...</p>
      </motion.div>

      {/* Attribution */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 text-[#9E9E9E] text-xs text-center px-4 italic"
      >
        Carrying forward a legacy of offroad navigation
      </motion.p>
    </motion.div>
  );
}