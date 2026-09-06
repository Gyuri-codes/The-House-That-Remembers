import React from 'react';
import { X, Volume2, Sliders, Monitor, Shield, RotateCcw } from 'lucide-react';
import { GameSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onReturnToMenu?: () => void;
  isPauseMode?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onReturnToMenu,
  isPauseMode = false,
}) => {
  if (!isOpen) return null;

  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div id="settings-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-xl bg-[#080808] border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 overflow-y-auto max-h-[90vh]">
        {/* Corner Reticles */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-neutral-700 opacity-40 pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-neutral-700 opacity-40 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-neutral-700 opacity-40 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-neutral-700 opacity-40 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] tracking-[0.25em] text-red-600 uppercase font-mono">
                {isPauseMode ? 'SUSPENDED • SURVEILLANCE PAUSED' : 'SYSTEM CALIBRATION'}
              </span>
            </div>
            <h2 className="text-lg font-bold font-['Cinzel'] text-neutral-100 tracking-wider">
              {isPauseMode ? 'INVESTIGATION PAUSED' : 'PREFERENCES & IMMERSION'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#050505] border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6 text-sm text-neutral-300">
          {/* Audio Section */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-400 font-bold flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-red-500" />
              <span>Acoustic Levels</span>
            </h3>

            {/* Master Volume */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-neutral-400 font-mono">
                <span>Master Volume</span>
                <span className="text-neutral-200">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => handleChange('masterVolume', parseFloat(e.target.value))}
                className="w-full accent-red-600 bg-neutral-900 rounded"
              />
            </div>

            {/* Music / Ambient Volume */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-neutral-400 font-mono">
                <span>Ambient Drone & Tension</span>
                <span className="text-neutral-200">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => handleChange('musicVolume', parseFloat(e.target.value))}
                className="w-full accent-red-600 bg-neutral-900 rounded"
              />
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-neutral-400 font-mono">
                <span>Environmental SFX & Screams</span>
                <span className="text-neutral-200">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => handleChange('sfxVolume', parseFloat(e.target.value))}
                className="w-full accent-red-600 bg-neutral-900 rounded"
              />
            </div>
          </div>

          {/* Controls Sensitivity */}
          <div className="space-y-3 pt-4 border-t border-neutral-900">
            <h3 className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-400 font-bold flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-red-500" />
              <span>Optic & Sensor Controls</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs mb-1 text-neutral-400 font-mono">
                <span>Mouse Sensitivity (PC)</span>
                <span className="text-neutral-200">{settings.mouseSensitivity}</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={settings.mouseSensitivity}
                onChange={(e) => handleChange('mouseSensitivity', parseInt(e.target.value))}
                className="w-full accent-red-600 bg-neutral-900 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 text-neutral-400 font-mono">
                <span>Touch Sensitivity (Mobile)</span>
                <span className="text-neutral-200">{settings.touchSensitivity}</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={settings.touchSensitivity}
                onChange={(e) => handleChange('touchSensitivity', parseInt(e.target.value))}
                className="w-full accent-red-600 bg-neutral-900 rounded"
              />
            </div>
          </div>

          {/* Display & Quality */}
          <div className="space-y-3 pt-4 border-t border-neutral-900">
            <h3 className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-400 font-bold flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-red-500" />
              <span>Optic Calibration</span>
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Rendering Profile</span>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleChange('graphicsQuality', q)}
                    className={`px-3 py-1 text-xs uppercase font-mono tracking-wider border transition-colors ${
                      settings.graphicsQuality === q
                        ? 'bg-red-950/80 text-red-200 font-bold border-red-700 shadow-[0_0_10px_rgba(220,38,38,0.3)]'
                        : 'bg-[#050505] border-neutral-800 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 text-neutral-400 font-mono">
                <span>Display Gamma / Brightness</span>
                <span className="text-neutral-200">{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                step="5"
                value={settings.brightness}
                onChange={(e) => handleChange('brightness', parseInt(e.target.value))}
                className="w-full accent-red-600 bg-neutral-900 rounded"
              />
            </div>
          </div>

          {/* Accessibility & Toggles */}
          <div className="space-y-3 pt-4 border-t border-neutral-900">
            <h3 className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-400 font-bold flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span>Safety & Telemetry</span>
            </h3>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs text-neutral-400">Investigation Subtitles</span>
              <input
                type="checkbox"
                checked={settings.subtitles}
                onChange={(e) => handleChange('subtitles', e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded bg-neutral-900"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs text-neutral-400">Cinematic Camera Tremor</span>
              <input
                type="checkbox"
                checked={settings.cameraShake}
                onChange={(e) => handleChange('cameraShake', e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded bg-neutral-900"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs text-neutral-400">Photosensitivity Safe Mode (Reduced Flashes)</span>
              <input
                type="checkbox"
                checked={settings.reducedFlashing}
                onChange={(e) => handleChange('reducedFlashing', e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded bg-neutral-900"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-900 flex justify-between items-center">
          {isPauseMode && onReturnToMenu && (
            <button
              onClick={onReturnToMenu}
              className="px-4 py-2.5 bg-[#050505] hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-mono flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-500" />
              <span className="tracking-[0.15em] uppercase">ABORT TO MENU</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="group relative ml-auto px-6 py-2.5 bg-[#080808] border border-neutral-800 hover:border-red-900 text-neutral-200 text-xs font-mono tracking-[0.25em] uppercase transition-all shadow-xl active:scale-95"
          >
            <span>{isPauseMode ? 'RESUME FEED' : 'APPLY CONFIG'}</span>
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

