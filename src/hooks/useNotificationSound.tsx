import { useState, useCallback, useEffect } from 'react';

export interface SoundPreset {
  id: string;
  name: string;
  frequency: number;
  volume: number;
  duration: number;
}

export const SOUND_PRESETS: SoundPreset[] = [
  { id: 'gentle', name: 'Doux', frequency: 520, volume: 0.08, duration: 0.4 },
  { id: 'classic', name: 'Classique', frequency: 800, volume: 0.15, duration: 0.3 },
  { id: 'alert', name: 'Alerte', frequency: 1200, volume: 0.25, duration: 0.2 },
  { id: 'silent', name: 'Silencieux', frequency: 0, volume: 0, duration: 0 },
];

export interface SoundSettings {
  presetId: string;
  frequency: number;
  volume: number;
  duration: number;
}

const STORAGE_KEY = 'chat-sound-settings';

const DEFAULT_SETTINGS: SoundSettings = {
  presetId: 'classic',
  frequency: 800,
  volume: 0.15,
  duration: 0.3,
};

function loadSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_SETTINGS;
}

export const useNotificationSound = () => {
  const [settings, setSettings] = useState<SoundSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = SOUND_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSettings({
        presetId: preset.id,
        frequency: preset.frequency,
        volume: preset.volume,
        duration: preset.duration,
      });
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof SoundSettings>(key: K, value: SoundSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value, presetId: 'custom' }));
  }, []);

  const playSound = useCallback(() => {
    if (settings.volume === 0 || settings.duration === 0) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = settings.frequency;
      gain.gain.value = settings.volume;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + settings.duration);
      osc.stop(ctx.currentTime + settings.duration);
    } catch {
      // Audio not available
    }
  }, [settings]);

  return { settings, applyPreset, updateSetting, playSound };
};
