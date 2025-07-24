-- Add parent_id to comments for threaded replies
ALTER TABLE public.comments 
ADD COLUMN parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;

-- Create index for better performance on threaded queries
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_post_parent ON public.comments(post_id, parent_id);

-- Create comment_votes table for voting on comments
CREATE TABLE public.comment_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_type smallint NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- Enable RLS on comment_votes
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for comment_votes
CREATE POLICY "Anyone can view comment votes" 
ON public.comment_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own comment votes" 
ON public.comment_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment votes" 
ON public.comment_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment votes" 
ON public.comment_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for comment_votes
CREATE INDEX idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user_comment ON public.comment_votes(user_id, comment_id);