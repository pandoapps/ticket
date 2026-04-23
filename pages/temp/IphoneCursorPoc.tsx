import { useEffect, useRef, useState } from 'react';

const MIN_SIZE = 80;
const STEP = 20;
const YT_ID = 'pjs-eZq2MyE';

const getMaxSize = () => Math.min(window.innerWidth, window.innerHeight);

export function IphoneCursorPoc() {
  const [size, setSize] = useState(180);
  const [visible, setVisible] = useState(false);
  const cursorRef = useRef<HTMLImageElement>(null);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  useEffect(() => {
    document.body.style.cursor = 'none';

    const onMove = (e: MouseEvent) => {
      setVisible(true);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - sizeRef.current / 2}px, ${e.clientY - sizeRef.current / 2}px)`;
      }
    };

    const onLeave = () => setVisible(false);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setSize((prev) => {
        const next = prev + (e.deltaY < 0 ? STEP : -STEP);
        return Math.min(getMaxSize(), Math.max(MIN_SIZE, next));
      });
    };

    const onResize = () => {
      setSize((prev) => Math.min(getMaxSize(), prev));
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <iframe
        className="absolute inset-0 w-full h-full pointer-events-none"
        src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${YT_ID}&modestbranding=1&rel=0`}
        title="POC"
        allow="autoplay; encrypted-media"
      />

      <div className="absolute top-4 left-4 z-10 text-white/70 text-sm font-mono bg-black/40 px-3 py-2 rounded pointer-events-none">
        scroll para redimensionar o iphone · tamanho: {size}px
      </div>

      <img
        ref={cursorRef}
        src="/images/iphone-cursor.png"
        alt=""
        style={{
          width: size,
          height: size,
          opacity: visible ? 1 : 0,
          willChange: 'transform',
        }}
        className="fixed top-0 left-0 pointer-events-none select-none object-contain z-50 transition-[width,height,opacity] duration-75"
      />
    </div>
  );
}
