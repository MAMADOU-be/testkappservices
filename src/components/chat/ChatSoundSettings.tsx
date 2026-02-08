import { Volume2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { SOUND_PRESETS, type SoundSettings } from '@/hooks/useNotificationSound';
import { cn } from '@/lib/utils';

interface ChatSoundSettingsProps {
  settings: SoundSettings;
  onApplyPreset: (presetId: string) => void;
  onUpdateSetting: <K extends keyof SoundSettings>(key: K, value: SoundSettings[K]) => void;
  onPlayTest: () => void;
}

export const ChatSoundSettings = ({ settings, onApplyPreset, onUpdateSetting, onPlayTest }: ChatSoundSettingsProps) => {
  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-1">
        <Volume2 className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">Son de notification</span>
      </div>

      {/* Presets */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Présélections</Label>
        <div className="grid grid-cols-2 gap-2">
          {SOUND_PRESETS.map(preset => (
            <Button
              key={preset.id}
              variant={settings.presetId === preset.id ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-8"
              onClick={() => onApplyPreset(preset.id)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Fine-tune sliders */}
      <div className="space-y-3 pt-1">
        <Label className="text-xs text-muted-foreground">Réglages fins</Label>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Tonalité</span>
            <span className="text-muted-foreground">{settings.frequency} Hz</span>
          </div>
          <Slider
            min={200}
            max={2000}
            step={10}
            value={[settings.frequency]}
            onValueChange={([v]) => onUpdateSetting('frequency', v)}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Volume</span>
            <span className="text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
          </div>
          <Slider
            min={0}
            max={0.5}
            step={0.01}
            value={[settings.volume]}
            onValueChange={([v]) => onUpdateSetting('volume', v)}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Durée</span>
            <span className="text-muted-foreground">{settings.duration.toFixed(1)}s</span>
          </div>
          <Slider
            min={0.1}
            max={1.5}
            step={0.1}
            value={[settings.duration]}
            onValueChange={([v]) => onUpdateSetting('duration', v)}
          />
        </div>
      </div>

      {/* Test button */}
      <Button variant="outline" size="sm" className="w-full gap-2" onClick={onPlayTest}>
        <Play className="h-3.5 w-3.5" />
        Tester le son
      </Button>
    </div>
  );
};
