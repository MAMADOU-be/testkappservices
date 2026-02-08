import { FileText, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  participant?: {
    display_name: string;
    role: string;
  };
}

const handleBlobDownload = (url: string, fileName: string) => {
  fetch(url)
    .then(r => r.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    })
    .catch(() => window.open(url, '_blank'));
};

const handleBlobOpen = (url: string) => {
  fetch(url)
    .then(r => r.blob())
    .then(blob => window.open(URL.createObjectURL(blob), '_blank'))
    .catch(() => window.open(url, '_blank'));
};

export const AdminChatMessage = ({ message }: { message: ChatMessage }) => {
  const isEmployee = message.participant?.role === 'employee';

  return (
    <div className={`flex ${isEmployee ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[75%] space-y-1`}>
        {/* Sender info */}
        <div className={`flex items-center gap-2 ${isEmployee ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs font-medium text-muted-foreground">
            {message.participant?.display_name}
          </span>
          <Badge
            variant={isEmployee ? 'default' : 'secondary'}
            className="text-[10px] px-1.5 py-0 h-4 font-normal"
          >
            {isEmployee ? 'Employé' : 'Client'}
          </Badge>
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isEmployee
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-card border border-border rounded-bl-md'
          }`}
        >
          {message.file_url ? (
            <>
              {message.content && !message.content.startsWith('📎') && (
                <p className="text-sm whitespace-pre-wrap break-words mb-2">{message.content}</p>
              )}
              {message.file_type?.startsWith('image/') ? (
                <button
                  onClick={() => handleBlobOpen(message.file_url!)}
                  className="block mt-1 cursor-pointer rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                >
                  <img
                    src={message.file_url}
                    alt={message.file_name || 'Image'}
                    className="max-w-full max-h-52 rounded-lg object-contain"
                  />
                </button>
              ) : (
                <button
                  onClick={() => handleBlobDownload(message.file_url!, message.file_name || 'Fichier')}
                  className={`flex items-center gap-3 mt-1 p-2.5 rounded-lg transition-colors w-full text-left ${
                    isEmployee
                      ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isEmployee ? 'bg-primary-foreground/20' : 'bg-primary/10'
                  }`}>
                    <FileText className={`h-4 w-4 ${isEmployee ? 'text-primary-foreground' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{message.file_name || 'Fichier'}</p>
                    <p className={`text-[10px] ${isEmployee ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      Cliquer pour télécharger
                    </p>
                  </div>
                  <Download className={`h-4 w-4 shrink-0 ${isEmployee ? 'text-primary-foreground/60' : 'text-muted-foreground'}`} />
                </button>
              )}
            </>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          )}
        </div>

        {/* Time */}
        <p className={`text-[10px] text-muted-foreground ${isEmployee ? 'text-right' : 'text-left'}`}>
          {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
        </p>
      </div>
    </div>
  );
};
