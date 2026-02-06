import { useState } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWindow } from './ChatWindow';
import { useChat } from '@/hooks/useChat.tsx';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { currentRoom, currentParticipant, isLoading, joinOrCreateRoom, leaveChat } = useChat();
  const { user } = useAuth();
  const { profile } = useProfile();

  const handleClose = async () => {
    await leaveChat();
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleStartChat = async () => {
    if (!user) return;
    const displayName = profile?.display_name || user.email?.split('@')[0] || 'Utilisateur';
    await joinOrCreateRoom(displayName, 'client');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50 transition-all duration-300 hover:scale-110 hover:shadow-xl"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Ouvrir le chat</span>
      </Button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-background border rounded-lg shadow-2xl z-50 transition-all duration-300 ${
        isMinimized ? 'w-80 h-14' : 'w-80 sm:w-96 h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Chat en direct</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary-foreground/20 text-primary-foreground"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary-foreground/20 text-primary-foreground"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="h-[calc(100%-56px)]">
          {!user ? (
            <ChatLoginRequired />
          ) : !currentRoom || !currentParticipant ? (
            <ChatStartPrompt onStart={handleStartChat} isLoading={isLoading} displayName={profile?.display_name || user.email?.split('@')[0] || ''} />
          ) : (
            <ChatWindow />
          )}
        </div>
      )}
    </div>
  );
};

const ChatLoginRequired = () => {
  // Use window.location for navigation since this component is outside Router sometimes
  const handleGoToAuth = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <LogIn className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Connexion requise</h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Connectez-vous ou créez un compte pour discuter avec notre équipe.
      </p>
      <Button onClick={handleGoToAuth} className="w-full">
        <LogIn className="mr-2 h-4 w-4" />
        Se connecter
      </Button>
    </div>
  );
};

interface ChatStartPromptProps {
  onStart: () => Promise<void>;
  isLoading: boolean;
  displayName: string;
}

const ChatStartPrompt = ({ onStart, isLoading, displayName }: ChatStartPromptProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <MessageCircle className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Bonjour {displayName} 👋</h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Démarrez une conversation avec notre équipe. Nous sommes là pour vous aider !
      </p>
      <Button onClick={onStart} className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg" disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Démarrer le chat'}
      </Button>
    </div>
  );
};
