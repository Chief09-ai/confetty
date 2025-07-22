-- Create subs table for community structure
CREATE TABLE public.subs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  creator_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on subs table
ALTER TABLE public.subs ENABLE ROW LEVEL SECURITY;

-- Create policies for subs
CREATE POLICY "Anyone can view subs" 
ON public.subs 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create subs" 
ON public.subs 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Sub creators can update their subs" 
ON public.subs 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Sub creators can delete their subs" 
ON public.subs 
FOR DELETE 
USING (auth.uid() = creator_id);

-- Add sub_id column to posts table
ALTER TABLE public.posts 
ADD COLUMN sub_id UUID REFERENCES public.subs(id);

-- Create index for better performance
CREATE INDEX idx_posts_sub_id ON public.posts(sub_id);
CREATE INDEX idx_posts_category_id ON public.posts(category_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on subs
CREATE TRIGGER update_subs_updated_at
BEFORE UPDATE ON public.subs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();