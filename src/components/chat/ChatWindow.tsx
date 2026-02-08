import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, CheckCheck, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat.tsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ACCEPTED_FILE_TYPES = 'image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx';

const FilePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  const isImage = file.type.startsWith('image/');
  const preview = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/50">
      {isImage && preview ? (
        <img src={preview} alt={file.name} className="h-10 w-10 rounded object-cover" />
      ) : (
        <FileText className="h-5 w-5 text-muted-foreground" />
      )}
      <span className="text-xs truncate max-w-[150px]">{file.name}</span>
      <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={onRemove}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

const MessageFileAttachment = ({ fileUrl, fileName, fileType }: { fileUrl: string; fileName: string; fileType: string }) => {
  const isImage = fileType?.startsWith('image/');

  if (isImage) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block mt-1">
        <img src={fileUrl} alt={fileName} className="max-w-full max-h-48 rounded-md object-contain" />
      </a>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 mt-1 text-xs underline opacity-80 hover:opacity-100"
    >
      <FileText className="h-4 w-4" />
      {fileName}
    </a>
  );
};

export const ChatWindow = () => {
  const { messages, currentParticipant, sendMessage, participants, typingUsers, broadcastTyping, employeeLastReadAt, markAsRead } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingThrottle = useRef<number>(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && currentParticipant) {
      markAsRead();
    }
  }, [messages.length, currentParticipant, markAsRead]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    const success = await sendMessage(newMessage, selectedFile || undefined);
    if (success) {
      setNewMessage('');
      setSelectedFile(null);
    }
    setIsSending(false);
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    const now = Date.now();
    if (now - typingThrottle.current > 2000) {
      typingThrottle.current = now;
      broadcastTyping();
    }
  }, [broadcastTyping]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Fichier trop volumineux (maximum 10 Mo)');
        return;
      }
      setSelectedFile(file);
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            {messages.map((message, index) => {
              const isOwn = message.participant_id === currentParticipant?.id;
              const isEmployee = message.participant?.role === 'employee';
              const isClientMessage = !isEmployee;

              const isRead = isClientMessage && employeeLastReadAt && 
                new Date(message.created_at) <= new Date(employeeLastReadAt);
              const isLastReadClient = isRead && (() => {
                for (let i = index + 1; i < messages.length; i++) {
                  const next = messages[i];
                  if (next.participant?.role !== 'employee' && 
                      new Date(next.created_at) <= new Date(employeeLastReadAt!)) {
                    return false;
                  }
                }
                return true;
              })();

              const msg = message as any;

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
                    {message.content && !msg.file_url && (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    {msg.file_url && (
                      <>
                        {message.content && !message.content.startsWith('📎') && (
                          <p className="text-sm whitespace-pre-wrap break-words mb-1">{message.content}</p>
                        )}
                        <MessageFileAttachment
                          fileUrl={msg.file_url}
                          fileName={msg.file_name || 'Fichier'}
                          fileType={msg.file_type || ''}
                        />
                      </>
                    )}
                    {!msg.file_url && !message.content && (
                      <p className="text-sm text-muted-foreground italic">Message vide</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                    </span>
                    {isLastReadClient && (
                      <span className="flex items-center gap-0.5 text-xs text-primary">
                        <CheckCheck className="h-3 w-3" />
                        <span>Vu à {format(new Date(employeeLastReadAt!), 'HH:mm', { locale: fr })}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1.5 border-t border-b-0">
          <p className="text-xs text-muted-foreground italic flex items-center gap-1">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            {typingUsers.map(u => u.displayName).join(', ')} est en train d'écrire...
          </p>
        </div>
      )}

      {/* File preview */}
      {selectedFile && (
        <div className="px-3 pt-2">
          <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSend} className="p-3 border-t">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={handleInputChange}
              disabled={isSending}
              maxLength={5000}
              className="pr-16"
            />
            <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
              newMessage.length > 4500 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {newMessage.length}/5000
            </span>
          </div>
          <Button type="submit" size="icon" disabled={isSending || (!newMessage.trim() && !selectedFile)}>
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
