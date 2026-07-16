import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
  /** 小数位数；不传则根据 value 自动推断（整数 0 位，小数最多 2 位） */
  decimals?: number;
}

function resolveDecimals(value: number, decimals?: number): number {
  if (decimals !== undefined) return decimals;
  if (Number.isInteger(value)) return 0;
  const fraction = String(value).split('.')[1] || '';
  return Math.min(fraction.length, 2);
}

export default function CountUp({ value, duration = 450, className, decimals }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = currentRef.current;
    const to = value;

    if (from === to) {
      setDisplay(to);
      return;
    }

    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      currentRef.current = current;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        currentRef.current = to;
        setDisplay(to);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const d = resolveDecimals(value, decimals);
  return <span className={className}>{display.toFixed(d)}</span>;
}
