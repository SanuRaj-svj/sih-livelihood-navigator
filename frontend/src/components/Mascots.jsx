import React from 'react';
import { motion } from 'framer-motion';

/*
  BACKGROUND & TEXT COLOR CONTRACT DECLARATION (MASCOTS):
  - Primary Accent: #E85D2E (Light) / #FF8B5E (Dark)
  - Secondary Accent: #0F766E (Light) / #2DD4BF (Dark)
  - Dark Navy Details: #1A1A2E
  - Light Contrast Details: #FAFAFA / #FFF8F0
*/

const floatAnimation = {
  animate: {
    y: [0, -7, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

const armWaveAnimation = {
  animate: {
    rotate: [0, 14, -4, 14, 0],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const WelcomeMascot = ({ className = "w-48 h-48" }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="#FFF8F0" opacity="0.9" />
      <circle cx="100" cy="100" r="65" fill="#0F766E" opacity="0.15" />

      <motion.g {...floatAnimation}>
        <ellipse cx="100" cy="175" rx="45" ry="8" fill="#8B8B9E" opacity="0.3" />
        <path d="M60 145 C60 115 75 100 100 100 C125 100 140 115 140 145 L140 170 H60 Z" fill="#0F766E" />
        <path d="M85 100 L100 120 L115 100 Z" fill="#FFF8F0" />
        <circle cx="100" cy="70" r="28" fill="#FF8B5E" />
        <path d="M72 65 C72 45 85 40 100 40 C115 40 128 45 128 65 C124 55 110 52 100 52 C90 52 76 55 72 65 Z" fill="#1A1A2E" />
        <circle cx="91" cy="68" r="3" fill="#1A1A2E" />
        <circle cx="109" cy="68" r="3" fill="#1A1A2E" />
        <path d="M91 76 Q100 84 109 76" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="85" cy="74" r="4" fill="#E85D2E" opacity="0.4" />
        <circle cx="115" cy="74" r="4" fill="#E85D2E" opacity="0.4" />

        <path d="M62 110 C50 125 52 140 60 150" stroke="#0F766E" strokeWidth="10" strokeLinecap="round" />

        <motion.g style={{ transformOrigin: '135px 110px' }} {...armWaveAnimation}>
          <path d="M138 110 L160 85" stroke="#0F766E" strokeWidth="10" strokeLinecap="round" />
          <circle cx="163" cy="82" r="7" fill="#FF8B5E" />
          <path d="M172 70 L176 74 M176 70 L172 74" stroke="#E85D2E" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      </motion.g>
    </svg>
  );
};

export const MatchMascot = ({ className = "w-40 h-40" }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="#FFF8F0" opacity="0.9" />
      
      <motion.g {...floatAnimation}>
        <ellipse cx="100" cy="172" rx="40" ry="7" fill="#8B8B9E" opacity="0.3" />
        <g opacity="0.9">
          <path d="M45 45 L49 55 L60 56 L52 64 L54 75 L45 69 L36 75 L38 64 L30 56 L41 55 Z" fill="#E85D2E" />
        </g>
        <rect x="65" y="90" width="70" height="75" rx="35" fill="#E85D2E" />
        <circle cx="86" cy="115" r="4" fill="#FFFFFF" />
        <circle cx="114" cy="115" r="4" fill="#FFFFFF" />
        <path d="M88 128 Q100 138 112 128" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M140 120 L155 110 C160 106 165 112 160 118 L145 130" stroke="#E85D2E" strokeWidth="9" strokeLinecap="round" />
        <circle cx="158" cy="108" r="6" fill="#FF8B5E" />
        <circle cx="150" cy="50" r="5" fill="#0F766E" />
        <circle cx="165" cy="70" r="3" fill="#E85D2E" />
      </motion.g>
    </svg>
  );
};

export const JourneyMascot = ({ className = "w-44 h-44" }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="#0F766E" opacity="0.15" />

      <motion.g {...floatAnimation}>
        <ellipse cx="100" cy="175" rx="45" ry="8" fill="#8B8B9E" opacity="0.3" />
        <line x1="145" y1="50" x2="145" y2="165" stroke="#4A4A5E" strokeWidth="4" strokeLinecap="round" />
        <path d="M145 52 L180 67 L145 82 Z" fill="#E85D2E" />
        <path d="M65 140 C65 115 80 100 100 100 C120 100 135 115 135 140 L135 165 H65 Z" fill="#0F766E" />
        <circle cx="100" cy="72" r="25" fill="#FF8B5E" />
        <path d="M70 65 L130 65 L125 52 C120 45 105 42 100 42 C95 42 80 45 75 52 Z" fill="#1A1A2E" />
        <circle cx="92" cy="72" r="3" fill="#FFFFFF" />
        <circle cx="108" cy="72" r="3" fill="#FFFFFF" />
        <path d="M93 80 Q100 86 107 80" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="60" cy="135" r="14" fill="#FFFFFF" stroke="#E85D2E" strokeWidth="3" />
        <path d="M60 126 L64 135 L60 144 L56 135 Z" fill="#E85D2E" />
      </motion.g>
    </svg>
  );
};

export const OfficerMascot = ({ className = "w-28 h-28" }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="#1E1E2E" opacity="0.8" />

      <motion.g {...floatAnimation}>
        <path d="M60 145 C60 115 75 100 100 100 C125 100 140 115 140 145 L140 170 H60 Z" fill="#0F766E" />
        <path d="M88 100 L100 130 L112 100 Z" fill="#FAFAFA" />
        <path d="M96 105 L104 105 L102 128 L100 132 L98 128 Z" fill="#E85D2E" />
        <circle cx="100" cy="68" r="26" fill="#FF8B5E" />
        <path d="M74 62 C74 46 86 42 100 42 C114 42 126 46 126 62 Z" fill="#1A1A2E" />
        <rect x="83" y="62" width="14" height="10" rx="3" fill="none" stroke="#2DD4BF" strokeWidth="2.5" />
        <rect x="103" y="62" width="14" height="10" rx="3" fill="none" stroke="#2DD4BF" strokeWidth="2.5" />
        <line x1="97" y1="67" x2="103" y2="67" stroke="#2DD4BF" strokeWidth="2.5" />
        <path d="M93 78 Q100 84 107 78" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" fill="none" />
      </motion.g>
    </svg>
  );
};

export const EmptyStateMascot = ({ className = "w-36 h-36" }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" fill="#FFF8F0" opacity="0.9" />
      
      <motion.g {...floatAnimation}>
        <circle cx="100" cy="55" r="16" fill="#E85D2E" />
        <path d="M94 70 H106 V74 H94 Z" fill="#8B8B9E" />
        <path d="M97 50 L103 60 M103 50 L97 60" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="100" cy="125" r="35" fill="#0F766E" />
        <circle cx="90" cy="118" r="4" fill="#FFFFFF" />
        <circle cx="110" cy="118" r="4" fill="#FFFFFF" />
        <circle cx="91" cy="118" r="2" fill="#1A1A2E" />
        <circle cx="111" cy="118" r="2" fill="#1A1A2E" />
        <circle cx="100" cy="132" r="4" fill="#FFFFFF" />
      </motion.g>
    </svg>
  );
};
