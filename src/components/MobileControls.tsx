import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen, Briefcase, Play, Zap, Eye } from 'lucide-react';

interface MobileControlsProps {
  onMove: (vector: { x: number; y: number }) => void;
  onLookDelta: (delta: { x: number; y: number }) => void;
  onInteract: () => void;
  onOpenInventory: () => void;
  onOpenJournal: () => void;
  onToggleRun: () => void;
  isRunning: boolean;
  interactPrompt: string | null;
  touchSensitivity: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onLookDelta,
  onInteract,
  onOpenInventory,
  onOpenJournal,
  onToggleRun,
  isRunning,
  interactPrompt,
  touchSensitivity,
}) => {
  // Joystick State
  const [joystickActive, setJoystickActive] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  // Look Touch State
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef({ x: 0, y: 0 });

  // Joystick touch handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setJoystickActive(true);
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2;

    const distance = Math.min(Math.hypot(dx, dy), maxRadius);
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * distance;
    const clampedY = Math.sin(angle) * distance;

    setStickPos({ x: clampedX, y: clampedY });

    // Normalized move vector: x = strafe (-1..1), y = forward (-1..1, inverted so up is positive)
    const normX = clampedX / maxRadius;
    const normY = -(clampedY / maxRadius);
    onMove({ x: normX, y: normY });
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setJoystickActive(false);
        setStickPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        break;
      }
    }
  };

  // Look zone touch handlers
  const handleLookTouchStart = (e: React.TouchEvent) => {
    if (lookTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    lookTouchIdRef.current = touch.identifier;
    lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        const dx = touch.clientX - lastLookPosRef.current.x;
        const dy = touch.clientY - lastLookPosRef.current.y;
        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };

        const factor = (touchSensitivity / 100) * 1.6;
        onLookDelta({ x: dx * factor, y: dy * factor });
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        break;
      }
    }
  };

  return (
    <div id="mobile-controls-layer" className="absolute inset-0 pointer-events-none select-none z-30">
      {/* Top Bar Buttons: Inventory & Journal */}
      <div className="absolute top-4 right-4 flex items-center gap-3 pointer-events-auto">
        <button
          id="btn-mobile-inventory"
          onClick={onOpenInventory}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#080808]/90 border border-neutral-800 text-neutral-300 active:border-red-800 text-xs font-mono uppercase tracking-[0.2em] transition-transform active:scale-95 shadow-xl"
        >
          <Briefcase className="w-3.5 h-3.5 text-red-500" />
          <span>RELICS</span>
        </button>

        <button
          id="btn-mobile-journal"
          onClick={onOpenJournal}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#080808]/90 border border-neutral-800 text-neutral-300 active:border-red-800 text-xs font-mono uppercase tracking-[0.2em] transition-transform active:scale-95 shadow-xl"
        >
          <BookOpen className="w-3.5 h-3.5 text-red-500" />
          <span>DOSSIER</span>
        </button>
      </div>

      {/* Large Bottom-Left Virtual Joystick Container */}
      <div
        id="virtual-joystick-zone"
        className="absolute bottom-6 left-6 w-40 h-40 flex items-center justify-center pointer-events-auto touch-none"
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
        onTouchCancel={handleJoystickTouchEnd}
      >
        <div
          ref={joystickBaseRef}
          className={`relative w-36 h-36 rounded-full border transition-colors flex items-center justify-center ${
            joystickActive
              ? 'border-neutral-400 bg-neutral-950/80 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
              : 'border-neutral-800/80 bg-[#050505]/60'
          }`}
        >
          {/* Inner stick nub */}
          <div
            className={`w-14 h-14 rounded-full border border-neutral-600 shadow-md transform transition-all ${
              joystickActive ? 'bg-red-950/80 border-red-500 scale-105' : 'bg-neutral-800/60'
            }`}
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
            }}
          />
        </div>
      </div>

      {/* Right Side Look Swipe Zone */}
      <div
        id="touch-look-zone"
        className="absolute top-20 right-0 bottom-28 w-1/2 pointer-events-auto touch-none"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
      />

      {/* Right Side Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-auto font-mono">
        {/* Run Toggle Button */}
        <button
          id="btn-mobile-run"
          onClick={onToggleRun}
          className={`flex items-center justify-center w-13 h-13 rounded-full border transition-all active:scale-90 shadow-xl ${
            isRunning
              ? 'bg-red-900/90 border-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)]'
              : 'bg-[#080808]/90 border-neutral-800 text-neutral-400'
          }`}
          title="Run / Sprint"
        >
          <Zap className="w-5 h-5" />
        </button>

        {/* Large INTERACT Button */}
        <button
          id="btn-mobile-interact"
          onClick={onInteract}
          className={`group relative flex items-center justify-center gap-2 px-6 py-3.5 border font-bold tracking-[0.25em] text-xs uppercase shadow-2xl transition-all active:scale-95 min-w-[150px] ${
            interactPrompt
              ? 'bg-[#080808] border-red-600 text-neutral-100 shadow-[0_0_25px_rgba(220,38,38,0.5)]'
              : 'bg-[#050505]/90 border-neutral-800 text-neutral-500'
          }`}
        >
          <Eye className={`w-4 h-4 ${interactPrompt ? 'text-red-500' : 'text-neutral-600'}`} />
          <span>{interactPrompt ? 'INTERACT' : 'EXAMINE'}</span>
          {interactPrompt && (
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-600" />
          )}
        </button>
      </div>
    </div>
  );
};
