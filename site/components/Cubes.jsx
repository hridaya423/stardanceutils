'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import './Cubes.css';

const Cubes = ({
  gridSize = 10,
  cubeSize,
  maxAngle = 45,
  radius = 3,
  cellGap,
  borderStyle = '1px solid #fff',
  faceColor = '#120F17',
  shadow = false,
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor = '#fff',
  rippleSpeed = 2
}) => {
  const sceneRef = useRef(null);
  const rafRef = useRef(0);
  const idleTimerRef = useRef(null);
  const userActiveRef = useRef(false);
  const autoAnimateRef = useRef(autoAnimate);
  const simPosRef = useRef({ x: 0, y: 0 });
  const simTargetRef = useRef({ x: 0, y: 0 });
  const cubeDataRef = useRef([]);
  const boundsRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const pointerRef = useRef({ row: 0, col: 0, dirty: false });

  const colGap = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.col !== undefined ? `${cellGap.col}px` : '5%';
  const rowGap = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.row !== undefined ? `${cellGap.row}px` : '5%';

  const configRef = useRef({ gridSize, radius, maxAngle });

  useEffect(() => {
    autoAnimateRef.current = autoAnimate;
    configRef.current = { gridSize, radius, maxAngle };
  }, [autoAnimate, gridSize, radius, maxAngle]);

  // Single RAF loop: advances the idle sim, retargets cubes, and lerps each
  // cube's angle via a cached quickSetter — no per-frame tween allocation.
  const startLoop = useCallback(() => {
    if (rafRef.current) return;

    const tick = () => {
      const cubeData = cubeDataRef.current;
      if (!cubeData.length) {
        rafRef.current = 0;
        return;
      }
      const { gridSize: grid, radius: rad, maxAngle: maxAng } = configRef.current;

      const simActive = autoAnimateRef.current && !userActiveRef.current;
      if (simActive) {
        const pos = simPosRef.current;
        const tgt = simTargetRef.current;
        pos.x += (tgt.x - pos.x) * 0.02;
        pos.y += (tgt.y - pos.y) * 0.02;
        if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
          simTargetRef.current = { x: Math.random() * grid, y: Math.random() * grid };
        }
        pointerRef.current.row = pos.y;
        pointerRef.current.col = pos.x;
        pointerRef.current.dirty = true;
      }

      if (pointerRef.current.dirty) {
        pointerRef.current.dirty = false;
        const { row: rowCenter, col: colCenter } = pointerRef.current;
        for (let i = 0; i < cubeData.length; i += 1) {
          const entry = cubeData[i];
          const dist = Math.hypot(entry.row - rowCenter, entry.col - colCenter);
          entry.tgt = dist <= rad ? (1 - dist / rad) * maxAng : 0;
        }
      }

      let anyMoving = false;
      for (let i = 0; i < cubeData.length; i += 1) {
        const entry = cubeData[i];
        const delta = entry.tgt - entry.cur;
        if (delta === 0) continue;
        if (Math.abs(delta) < 0.1) {
          entry.cur = entry.tgt;
        } else {
          entry.cur += delta * (entry.tgt > entry.cur ? 0.22 : 0.1);
          anyMoving = true;
        }
        entry.setX(-entry.cur);
        entry.setY(entry.cur);
      }

      if (anyMoving || simActive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = 0;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const updateBounds = useCallback(() => {
    if (sceneRef.current) {
      boundsRef.current = sceneRef.current.getBoundingClientRect();
    }
  }, []);

  const pointAt = useCallback(
    (clientX, clientY) => {
      const rect = boundsRef.current;
      if (!rect.width || !rect.height) return;
      pointerRef.current.col = ((clientX - rect.left) / rect.width) * gridSize;
      pointerRef.current.row = ((clientY - rect.top) / rect.height) * gridSize;
      pointerRef.current.dirty = true;
      startLoop();
    },
    [gridSize, startLoop]
  );

  const markUserActive = useCallback(() => {
    userActiveRef.current = true;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      userActiveRef.current = false;
      startLoop();
    }, 3000);
  }, [startLoop]);

  const onPointerMove = useCallback(
    e => {
      updateBounds();
      markUserActive();
      pointAt(e.clientX, e.clientY);
    },
    [updateBounds, markUserActive, pointAt]
  );

  const resetAll = useCallback(() => {
    const cubeData = cubeDataRef.current;
    for (let i = 0; i < cubeData.length; i += 1) cubeData[i].tgt = 0;
    startLoop();
  }, [startLoop]);

  const onTouchMove = useCallback(
    e => {
      e.preventDefault();
      updateBounds();
      markUserActive();
      const touch = e.touches[0];
      pointAt(touch.clientX, touch.clientY);
    },
    [updateBounds, markUserActive, pointAt]
  );

  const onTouchStart = useCallback(() => {
    userActiveRef.current = true;
  }, []);

  const onTouchEnd = useCallback(() => {
    resetAll();
  }, [resetAll]);

  const onClick = useCallback(
    e => {
      if (!rippleOnClick || !sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const colHit = Math.floor((clientX - rect.left) / cellW);
      const rowHit = Math.floor((clientY - rect.top) / cellH);

      const baseRingDelay = 0.15;
      const baseAnimDur = 0.3;
      const baseHold = 0.6;

      const spreadDelay = baseRingDelay / rippleSpeed;
      const animDuration = baseAnimDur / rippleSpeed;
      const holdTime = baseHold / rippleSpeed;

      const rings = {};
      cubeDataRef.current.forEach(cubeData => {
        const { row: r, col: c } = cubeData;
        const dist = Math.hypot(r - rowHit, c - colHit);
        const ring = Math.round(dist);
        if (!rings[ring]) rings[ring] = [];
        rings[ring].push(cubeData.faces);
      });

      Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(ring => {
          const delay = ring * spreadDelay;
          const faces = rings[ring].flat();

          gsap.to(faces, {
            backgroundColor: rippleColor,
            duration: animDuration,
            delay,
            ease: 'power3.out'
          });
          gsap.to(faces, {
            backgroundColor: faceColor,
            duration: animDuration,
            delay: delay + animDuration + holdTime,
            ease: 'power3.out'
          });
        });
    },
    [rippleOnClick, gridSize, faceColor, rippleColor, rippleSpeed]
  );

  useEffect(() => {
    if (!autoAnimate) return;
    simPosRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
    simTargetRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
    startLoop();
  }, [autoAnimate, gridSize, startLoop]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    cubeDataRef.current = Array.from(el.querySelectorAll('.cube')).map(cube => ({
      el: cube,
      row: Number(cube.dataset.row),
      col: Number(cube.dataset.col),
      faces: Array.from(cube.querySelectorAll('.cube-face')),
      cur: 0,
      tgt: 0,
      setX: gsap.quickSetter(cube, 'rotateX', 'deg'),
      setY: gsap.quickSetter(cube, 'rotateY', 'deg')
    }));

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(el);
    updateBounds();

    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerleave', resetAll, { passive: true });
    el.addEventListener('click', onClick);

    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', resetAll);
      el.removeEventListener('click', onClick);

      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);

      cubeDataRef.current = [];

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [updateBounds, onPointerMove, resetAll, onClick, onTouchMove, onTouchStart, onTouchEnd]);

  const cells = Array.from({ length: gridSize });
  const sceneStyle = useMemo(() => ({
    gridTemplateColumns: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
    columnGap: colGap,
    rowGap: rowGap
  }), [gridSize, cubeSize, colGap, rowGap]);
  const wrapperStyle = useMemo(() => ({
    '--cube-face-border': borderStyle,
    '--cube-face-bg': faceColor,
    '--cube-face-shadow': shadow === true ? '0 0 6px rgba(0,0,0,.5)' : shadow || 'none',
    ...(cubeSize
      ? {
          width: `${gridSize * cubeSize}px`,
          height: `${gridSize * cubeSize}px`
        }
      : {})
  }), [borderStyle, faceColor, shadow, cubeSize, gridSize]);

  return (
    <div className="default-animation" style={wrapperStyle}>
      <div ref={sceneRef} className="default-animation--scene" style={sceneStyle}>
        {cells.map((_, r) =>
          cells.map((__, c) => (
            <div key={`${r}-${c}`} className="cube" data-row={r} data-col={c}>
              <div className="cube-face cube-face--top" />
              <div className="cube-face cube-face--bottom" />
              <div className="cube-face cube-face--left" />
              <div className="cube-face cube-face--right" />
              <div className="cube-face cube-face--front" />
              <div className="cube-face cube-face--back" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Cubes;
