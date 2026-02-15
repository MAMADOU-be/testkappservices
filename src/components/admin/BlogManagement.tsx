import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_id: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function BlogManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const loadPosts = useCallback(async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts((data || []) as BlogPost[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCoverImageUrl('');
    setIsPublished(false);
    setEditingPost(null);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || '');
    setContent(post.content);
    setCoverImageUrl(post.cover_image_url || '');
    setIsPublished(post.is_published);
    setIsDialogOpen(true);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingPost) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async () => {
    if (!user || !title.trim() || !content.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le titre et le contenu sont obligatoires.' });
      return;
    }

    setIsSaving(true);
    const postData = {
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      cover_image_url: coverImageUrl.trim() || null,
      is_published: isPublished,
      published_at: isPublished ? (editingPost?.published_at || new Date().toISOString()) : null,
      author_id: user.id,
    };

    let error;
    if (editingPost) {
      ({ error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id));
    } else {
      ({ error } = await supabase.from('blog_posts').insert(postData));
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message.includes('duplicate') ? 'Ce slug existe déjà.' : 'Impossible de sauvegarder.',
      });
    } else {
      toast({ title: editingPost ? 'Article modifié' : 'Article créé', description: isPublished ? 'L\'article est publié.' : 'L\'article est en brouillon.' });
      setIsDialogOpen(false);
      resetForm();
      loadPosts();
    }
    setIsSaving(false);
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Supprimer "${post.title}" ?`)) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
    if (!error) {
      toast({ title: 'Article supprimé' });
      loadPosts();
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const newState = !post.is_published;
    const { error } = await supabase
      .from('blog_posts')
      .update({
        is_published: newState,
        published_at: newState ? (post.published_at || new Date().toISOString()) : null,
      })
      .eq('id', post.id);
    if (!error) {
      toast({ title: newState ? '✅ Article publié' : '📝 Article dépublié' });
      loadPosts();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Articles ({posts.length})</h2>
          <p className="text-sm text-muted-foreground">
            {posts.filter(p => p.is_published).length} publiés, {posts.filter(p => !p.is_published).length} brouillons
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nouvel article
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Aucun article</p>
            <p className="text-sm mt-1">Créez votre premier article de blog</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{post.title}</h3>
                      <Badge variant={post.is_published ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                        {post.is_published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>
                    {post.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.created_at), 'dd MMM yyyy', { locale: fr })}
                      </span>
                      <span>/{post.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(post)} title={post.is_published ? 'Dépublier' : 'Publier'}>
                      {post.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(post)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { setIsDialogOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Titre de l'article" />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mon-article" className="font-mono text-sm" />
            </div>
            <div>
              <Label>Extrait</Label>
              <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value.slice(0, 300))} placeholder="Court résumé affiché sur la page d'accueil..." rows={2} />
            </div>
            <div>
              <Label>Contenu *</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenu complet de l'article..." rows={10} className="font-mono text-sm" />
            </div>
            <div>
              <Label>URL image de couverture</Label>
              <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="publish" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="publish">Publier immédiatement</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {editingPost ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
