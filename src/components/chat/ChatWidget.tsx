import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, LogIn, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWindow } from './ChatWindow';
import { ChatSoundSettings } from './ChatSoundSettings';
import { useChat } from '@/hooks/useChat.tsx';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const { currentRoom, currentParticipant, isLoading, joinOrCreateRoom, leaveChat, unreadCount, resetUnread, notificationSound } = useChat();
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

  // Trigger pulse animation when unreadCount increases
  const prevUnread = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevUnread.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 1500);
      return () => clearTimeout(timer);
    }
    prevUnread.current = unreadCount;
  }, [unreadCount]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsPulsing(false);
    resetUnread();
  };

  const handleToggleMinimize = () => {
    const next = !isMinimized;
    setIsMinimized(next);
    if (!next) {
      setIsPulsing(false);
      resetUnread();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpen}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50 transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          isPulsing ? 'animate-chat-pulse' : ''
        }`}
        size="icon"
      >
        <MessageCircle className={`h-6 w-6 ${isPulsing ? 'animate-chat-shake' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
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
            onClick={() => setShowSettings(prev => !prev)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary-foreground/20 text-primary-foreground"
            onClick={handleToggleMinimize}
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
          {showSettings ? (
            <ChatSoundSettings
              settings={notificationSound.settings}
              onApplyPreset={notificationSound.applyPreset}
              onUpdateSetting={notificationSound.updateSetting}
              onPlayTest={notificationSound.playSound}
            />
          ) : !user ? (
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
