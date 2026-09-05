import React, { useState, useEffect } from 'react';
import CountUpRaw from 'react-countup';

// Safe interop for react-countup default export
const CountUp = typeof CountUpRaw === 'function' 
  ? CountUpRaw 
  : (CountUpRaw && typeof CountUpRaw.default === 'function' ? CountUpRaw.default : null);

export const AnimatedCounter = ({ end = 0, start = 0, duration = 1.2, prefix = '', suffix = '' }) => {
  const [currentVal, setCurrentVal] = useState(start);

  useEffect(() => {
    let animationFrame;
    let startTime = null;

    const animate = (now) => {
      if (!startTime) startTime = now;
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const easedProgress = progress * (2 - progress);
      const nextVal = Math.round(start + (end - start) * easedProgress);

      setCurrentVal(nextVal);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, start, duration]);

  if (CountUp) {
    const Comp = CountUp;
    return <Comp start={start} end={end} duration={duration} prefix={prefix} suffix={suffix} />;
  }

  return (
    <span>
      {prefix}
      {currentVal.toLocaleString()}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
