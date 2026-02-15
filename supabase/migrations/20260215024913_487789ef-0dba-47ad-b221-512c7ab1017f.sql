
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT
  USING (is_published = true);

-- Staff can view all posts (including drafts)
CREATE POLICY "Staff can view all posts"
  ON public.blog_posts FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'employee'::app_role)
  );

-- Only admins can create posts
CREATE POLICY "Admins can create posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update posts
CREATE POLICY "Admins can update posts"
  ON public.blog_posts FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete posts
CREATE POLICY "Admins can delete posts"
  ON public.blog_posts FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
