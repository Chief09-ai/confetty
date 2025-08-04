-- Insert sample categories
INSERT INTO public.categories (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Technology', 'Discussions about technology, programming, and digital innovations'),
  ('550e8400-e29b-41d4-a716-446655440002', 'General', 'General discussions and conversations'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Gaming', 'Video games, board games, and gaming culture');

-- Insert sample subs
INSERT INTO public.subs (id, name, description, creator_id) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'webdev', 'Web development discussions and tutorials', auth.uid()),
  ('660e8400-e29b-41d4-a716-446655440002', 'askreddit', 'Ask questions and get answers from the community', auth.uid()),
  ('660e8400-e29b-41d4-a716-446655440003', 'gaming', 'Gaming news, reviews, and discussions', auth.uid());

-- Insert sample posts
INSERT INTO public.posts (id, title, body, user_id, category_id, sub_id, created_at) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Welcome to our community!', 'This is our first post. Feel free to share your thoughts and engage with other members.', auth.uid(), '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 days'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Best practices for React development', 'What are your favorite React patterns and libraries? Share your experience with the community.', auth.uid(), '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 day'),
  ('770e8400-e29b-41d4-a716-446655440003', 'Favorite games of 2024', 'What games have you been playing this year? Any hidden gems worth recommending?', auth.uid(), '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '6 hours'),
  ('770e8400-e29b-41d4-a716-446655440004', 'How to start learning programming?', 'Complete beginner here. What programming language should I start with and what resources do you recommend?', auth.uid(), '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '3 hours'),
  ('770e8400-e29b-41d4-a716-446655440005', 'Weekend project ideas', 'Looking for some fun coding projects to work on during the weekend. Any suggestions?', auth.uid(), '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 hour');

-- Insert sample comments
INSERT INTO public.comments (id, post_id, user_id, body, created_at) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', auth.uid(), 'Great to see this community growing! Looking forward to interesting discussions.', NOW() - INTERVAL '1 day'),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', auth.uid(), 'I love using React Query for state management and Tailwind CSS for styling. What about you?', NOW() - INTERVAL '20 hours'),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', auth.uid(), 'TypeScript is a game changer for React development. Highly recommend learning it!', NOW() - INTERVAL '18 hours'),
  ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003', auth.uid(), 'Baldurs Gate 3 has been amazing! Also really enjoying the new Spider-Man game.', NOW() - INTERVAL '5 hours'),
  ('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004', auth.uid(), 'I started with Python and found it very beginner-friendly. FreeCodeCamp is a great resource!', NOW() - INTERVAL '2 hours'),
  ('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440005', auth.uid(), 'How about building a personal portfolio website? Great way to practice HTML, CSS, and JavaScript!', NOW() - INTERVAL '30 minutes');

-- Insert sample votes for posts
INSERT INTO public.votes (post_id, user_id, vote_type, created_at) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', auth.uid(), 1, NOW() - INTERVAL '1 day'),
  ('770e8400-e29b-41d4-a716-446655440002', auth.uid(), 1, NOW() - INTERVAL '20 hours'),
  ('770e8400-e29b-41d4-a716-446655440003', auth.uid(), 1, NOW() - INTERVAL '5 hours'),
  ('770e8400-e29b-41d4-a716-446655440004', auth.uid(), 1, NOW() - INTERVAL '2 hours'),
  ('770e8400-e29b-41d4-a716-446655440005', auth.uid(), 1, NOW() - INTERVAL '1 hour');

-- Insert sample comment votes
INSERT INTO public.comment_votes (comment_id, user_id, vote_type, created_at) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', auth.uid(), 1, NOW() - INTERVAL '1 day'),
  ('880e8400-e29b-41d4-a716-446655440002', auth.uid(), 1, NOW() - INTERVAL '20 hours'),
  ('880e8400-e29b-41d4-a716-446655440003', auth.uid(), 1, NOW() - INTERVAL '18 hours'),
  ('880e8400-e29b-41d4-a716-446655440004', auth.uid(), 1, NOW() - INTERVAL '5 hours'),
  ('880e8400-e29b-41d4-a716-446655440005', auth.uid(), 1, NOW() - INTERVAL '2 hours');