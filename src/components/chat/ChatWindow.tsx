import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat.tsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ChatWindow = () => {
  const { messages, currentParticipant, sendMessage, participants } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
    setIsSending(false);
  };

  const onlineEmployees = participants.filter(p => p.role === 'employee' && p.is_online);

  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div className="px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2 text-sm">
          {onlineEmployees.length > 0 ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-muted-foreground">
                {onlineEmployees.length} employé(s) en ligne
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-muted-foreground">
                En attente d'un employé...
              </span>
            </>
          )}
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">
              Pas encore de messages.
            </p>
            <p className="text-muted-foreground text-sm">
              Un employé vous répondra bientôt !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.participant_id === currentParticipant?.id;
              const isEmployee = message.participant?.role === 'employee';

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${isEmployee ? 'text-primary' : 'text-muted-foreground'}`}>
                      {message.participant?.display_name || 'Anonyme'}
                      {isEmployee && ' (Employé)'}
                    </span>
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <form onSubmit={handleSend} className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
