import { useState, useRef } from 'react';
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ACCEPTED_FILE_TYPES = 'image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface AdminChatInputProps {
  roomId: string;
  participantId: string;
  disabled?: boolean;
}

export const AdminChatInput = ({ roomId, participantId, disabled }: AdminChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: 'destructive', title: 'Fichier trop volumineux', description: 'Maximum 10 Mo' });
        return;
      }
      setSelectedFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || isSending || disabled) return;

    setIsSending(true);
    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;

      if (selectedFile) {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        const ext = selectedFile.name.split('.').pop();
        const path = `${userId}/${roomId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(path, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat-files')
          .getPublicUrl(path);

        fileUrl = urlData.publicUrl;
        fileName = selectedFile.name;
        fileType = selectedFile.type;
      }

      const content = message.trim() || (fileName ? `📎 ${fileName}` : '');

      const { error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        participant_id: participantId,
        content,
        ...(fileUrl && { file_url: fileUrl, file_name: fileName, file_type: fileType }),
      } as any);

      if (error) throw error;

      setMessage('');
      setSelectedFile(null);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'envoyer le message",
      });
    } finally {
      setIsSending(false);
    }
  };

  const isImage = selectedFile?.type.startsWith('image/');
  const preview = isImage && selectedFile ? URL.createObjectURL(selectedFile) : null;

  return (
    <div className="border-t bg-card">
      {/* File preview */}
      {selectedFile && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/60 border border-border">
            {isImage && preview ? (
              <img src={preview} alt={selectedFile.name} className="h-10 w-10 rounded object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(0)} Ko
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setSelectedFile(null)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSend} className="p-3 flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <div className="flex-1 relative">
          <Input
            placeholder="Tapez votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            maxLength={5000}
            className="pr-14 rounded-xl bg-muted/40 border-border focus-visible:ring-primary/30"
          />
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${
            message.length > 4500 ? 'text-destructive' : 'text-muted-foreground/50'
          }`}>
            {message.length > 0 ? `${message.length}/5000` : ''}
          </span>
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={isSending || (!message.trim() && !selectedFile)}
          className="shrink-0 h-10 w-10 rounded-xl"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
