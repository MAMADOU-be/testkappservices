import { useState } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWindow } from './ChatWindow';
import { ChatLogin } from './ChatLogin';
import { useChat } from '@/hooks/useChat.tsx';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { currentRoom, currentParticipant, isLoading, joinOrCreateRoom, leaveChat } = useChat();

  const handleClose = async () => {
    await leaveChat();
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleStartChat = async (displayName: string) => {
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
          {!currentRoom || !currentParticipant ? (
            <ChatLogin onSubmit={handleStartChat} isLoading={isLoading} />
          ) : (
            <ChatWindow />
          )}
        </div>
      )}
    </div>
  );
};
