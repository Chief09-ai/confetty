-- Fix the remaining function search_path warning
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, email, username, joined_at)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Add sample categories
INSERT INTO public.categories (id, name, description) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Technology', 'Discussions about technology, programming, and innovation'),
('550e8400-e29b-41d4-a716-446655440002', 'Gaming', 'Video games, gaming culture, and gaming news'),
('550e8400-e29b-41d4-a716-446655440003', 'Science', 'Scientific discoveries, research, and discussions'),
('550e8400-e29b-41d4-a716-446655440004', 'Entertainment', 'Movies, TV shows, music, and entertainment news'),
('550e8400-e29b-41d4-a716-446655440005', 'Sports', 'Sports news, discussions, and analysis'),
('550e8400-e29b-41d4-a716-446655440006', 'Travel', 'Travel experiences, tips, and destination guides'),
('550e8400-e29b-41d4-a716-446655440007', 'Food', 'Cooking, recipes, restaurant reviews, and food culture'),
('550e8400-e29b-41d4-a716-446655440008', 'Health', 'Health tips, fitness, mental health, and wellness'),
('550e8400-e29b-41d4-a716-446655440009', 'Education', 'Learning resources, study tips, and educational discussions'),
('550e8400-e29b-41d4-a716-446655440010', 'Art', 'Visual arts, digital art, photography, and creative works')
ON CONFLICT (id) DO NOTHING;