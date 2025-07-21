-- Fix users table column name and add constraints
ALTER TABLE public.users RENAME COLUMN joinet_at TO joined_at;

-- Add foreign key constraints to ensure data integrity
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
ADD CONSTRAINT posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.votes 
ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
ADD CONSTRAINT votes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- Insert sports-based categories
INSERT INTO public.categories (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Football', 'NFL, college football, and general football discussions'),
('550e8400-e29b-41d4-a716-446655440002', 'Basketball', 'NBA, NCAA basketball, and pickup games'),
('550e8400-e29b-41d4-a716-446655440003', 'Soccer', 'Premier League, World Cup, and soccer news'),
('550e8400-e29b-41d4-a716-446655440004', 'General Sports', 'All other sports and athletic discussions');

-- Insert sample user
INSERT INTO public.users (id, username, email, joined_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'sports_fan', 'sports@confetty.com', now());

-- Insert sample sports posts
INSERT INTO public.posts (id, title, body, user_id, category_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Who do you think will win the Super Bowl this year?', 'I''m really excited about this season! My money is on the Chiefs, but there are so many strong teams. What are your predictions?', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440011', 'Best basketball shoes for outdoor courts?', 'Looking for recommendations on durable basketball shoes that can handle concrete courts. Budget is around $150. Any suggestions?', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440012', 'World Cup 2026 venues announced!', 'The official venues for the 2026 World Cup have been announced. So excited to see games in North America! Which city are you hoping to visit?', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', now() - interval '6 hours'),
('550e8400-e29b-41d4-a716-446655440013', 'Local gym vs home workouts - what''s better?', 'I''ve been debating whether to keep my gym membership or just work out at home. What do you all prefer and why?', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', now() - interval '3 hours');

-- Insert sample comments
INSERT INTO public.comments (id, body, post_id, user_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'I think the Bills have a great shot this year! Their defense is looking solid.', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440021', 'Try the Nike Air Zoom Freak series - they''re built for outdoor play and very durable.', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', now() - interval '12 hours'),
('550e8400-e29b-41d4-a716-446655440022', 'I''m definitely trying to get tickets for the games in Miami!', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', now() - interval '4 hours'),
('550e8400-e29b-41d4-a716-446655440023', 'Home workouts are great for consistency, but I miss the energy of the gym.', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', now() - interval '2 hours');

-- Insert sample votes (upvotes and downvotes)
INSERT INTO public.votes (id, vote_type, post_id, user_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440030', 1, '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440031', 1, '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', now() - interval '12 hours'),
('550e8400-e29b-41d4-a716-446655440032', 1, '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', now() - interval '6 hours'),
('550e8400-e29b-41d4-a716-446655440033', 1, '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', now() - interval '3 hours');