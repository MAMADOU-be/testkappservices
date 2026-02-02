import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Loader2 } from 'lucide-react';

interface ChatLoginProps {
  onSubmit: (displayName: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatLogin = ({ onSubmit, isLoading }: ChatLoginProps) => {
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      await onSubmit(displayName.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <MessageCircle className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Bienvenue sur notre chat</h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Entrez votre nom pour démarrer une conversation avec notre équipe.
      </p>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <Input
          placeholder="Votre nom"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isLoading}
          className="w-full"
          required
        />
        <Button type="submit" className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg" disabled={isLoading || !displayName.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : (
            'Démarrer le chat'
          )}
        </Button>
      </form>
    </div>
  );
};
