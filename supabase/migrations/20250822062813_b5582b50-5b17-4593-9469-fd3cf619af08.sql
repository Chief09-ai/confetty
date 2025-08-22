-- Add sample users
INSERT INTO public.users (id, email, username, joined_at, confetty_score) VALUES 
('550e8400-e29b-41d4-a716-446655440100', 'alice@example.com', 'alice_codes', '2024-01-15 10:00:00+00', 125),
('550e8400-e29b-41d4-a716-446655440101', 'bob@example.com', 'bob_gamer', '2024-02-20 14:30:00+00', 89),
('550e8400-e29b-41d4-a716-446655440102', 'charlie@example.com', 'charlie_scientist', '2024-03-10 09:15:00+00', 203),
('550e8400-e29b-41d4-a716-446655440103', 'diana@example.com', 'diana_artist', '2024-04-05 16:45:00+00', 156),
('550e8400-e29b-41d4-a716-446655440104', 'ethan@example.com', 'ethan_foodie', '2024-05-12 11:20:00+00', 67),
('550e8400-e29b-41d4-a716-446655440105', 'fiona@example.com', 'fiona_traveler', '2024-06-18 13:00:00+00', 94)
ON CONFLICT (id) DO NOTHING;

-- Add sample subs
INSERT INTO public.subs (id, name, description, creator_id, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440200', 'WebDev', 'A community for web developers to share tips, tricks, and projects', '550e8400-e29b-41d4-a716-446655440100', '2024-07-01 10:00:00+00'),
('550e8400-e29b-41d4-a716-446655440201', 'IndieGaming', 'Discover and discuss independent video games', '550e8400-e29b-41d4-a716-446655440101', '2024-07-02 15:30:00+00'),
('550e8400-e29b-41d4-a716-446655440202', 'SpaceExploration', 'Latest news and discussions about space missions and discoveries', '550e8400-e29b-41d4-a716-446655440102', '2024-07-03 09:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- Add sample posts
INSERT INTO public.posts (id, title, body, user_id, category_id, sub_id, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440300', 'React 19 Features You Should Know', 'React 19 introduces several exciting features including automatic batching, concurrent features, and improved server components. Here''s what developers need to know...', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440200', '2024-08-01 10:30:00+00'),
('550e8400-e29b-41d4-a716-446655440301', 'Best Indie Games of 2024', 'This year has been incredible for indie games. From atmospheric puzzle games to innovative platformers, here are my top picks...', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440201', '2024-08-02 14:15:00+00'),
('550e8400-e29b-41d4-a716-446655440302', 'James Webb Telescope Discovers Earth-like Exoplanet', 'Scientists using the James Webb Space Telescope have identified a potentially habitable exoplanet just 22 light-years away...', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440202', '2024-08-03 09:00:00+00'),
('550e8400-e29b-41d4-a716-446655440303', 'Digital Art Trends in 2024', 'From AI-assisted creation to NFT evolution, the digital art landscape continues to evolve. Here are the trends shaping the industry...', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440010', NULL, '2024-08-04 16:20:00+00'),
('550e8400-e29b-41d4-a716-446655440304', 'Ultimate Guide to Street Food in Bangkok', 'Bangkok''s street food scene is unmatched. After spending two weeks exploring every corner, here''s my complete guide to the best eats...', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440007', NULL, '2024-08-05 12:45:00+00'),
('550e8400-e29b-41d4-a716-446655440305', 'Hidden Gems of Northern Italy', 'Beyond the tourist hotspots lie incredible experiences. Here are 10 hidden gems I discovered during my month in Northern Italy...', '550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440006', NULL, '2024-08-06 11:10:00+00'),
('550e8400-e29b-41d4-a716-446655440306', 'The Future of Mental Health Apps', 'As mental health awareness grows, technology is playing a crucial role. Here''s how apps are revolutionizing mental health care...', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440008', NULL, '2024-08-07 08:30:00+00')
ON CONFLICT (id) DO NOTHING;

-- Add sample comments
INSERT INTO public.comments (id, body, user_id, post_id, parent_id, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440400', 'Great breakdown of React 19! The concurrent features are game-changing.', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440300', NULL, '2024-08-01 11:00:00+00'),
('550e8400-e29b-41d4-a716-446655440401', 'I''ve been using the beta and the performance improvements are noticeable.', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440300', NULL, '2024-08-01 11:30:00+00'),
('550e8400-e29b-41d4-a716-446655440402', 'Any issues with backward compatibility?', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440300', '550e8400-e29b-41d4-a716-446655440401', '2024-08-01 12:00:00+00'),
('550e8400-e29b-41d4-a716-446655440403', 'Pizza Tower should definitely be on this list! Amazing pixel art and gameplay.', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440301', NULL, '2024-08-02 15:00:00+00'),
('550e8400-e29b-41d4-a716-446655440404', 'This discovery is absolutely mind-blowing. The implications for astrobiology are huge.', '550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440302', NULL, '2024-08-03 10:15:00+00'),
('550e8400-e29b-41d4-a716-446655440405', 'AI art tools are controversial but undeniably powerful. The key is finding the right balance.', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440303', NULL, '2024-08-04 17:00:00+00'),
('550e8400-e29b-41d4-a716-446655440406', 'Mango sticky rice from Chatuchak Market is the best! Did you try it?', '550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440304', NULL, '2024-08-05 13:20:00+00'),
('550e8400-e29b-41d4-a716-446655440407', 'Lake Como is stunning but Lago di Braies is even more magical!', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440305', NULL, '2024-08-06 12:30:00+00'),
('550e8400-e29b-41d4-a716-446655440408', 'Mental health tech is so important. Thanks for highlighting the privacy considerations.', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440306', NULL, '2024-08-07 09:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- Add sample post votes
INSERT INTO public.votes (id, user_id, post_id, vote_type, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440500', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440300', 1, '2024-08-01 10:45:00+00'),
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440300', 1, '2024-08-01 11:15:00+00'),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440300', 1, '2024-08-01 11:45:00+00'),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440301', 1, '2024-08-02 14:30:00+00'),
('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440301', 1, '2024-08-02 15:30:00+00'),
('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440302', 1, '2024-08-03 09:30:00+00'),
('550e8400-e29b-41d4-a716-446655440506', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440302', 1, '2024-08-03 10:00:00+00'),
('550e8400-e29b-41d4-a716-446655440507', '550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440302', 1, '2024-08-03 10:30:00+00'),
('550e8400-e29b-41d4-a716-446655440508', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440303', 1, '2024-08-04 16:45:00+00'),
('550e8400-e29b-41d4-a716-446655440509', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440304', 1, '2024-08-05 13:00:00+00'),
('550e8400-e29b-41d4-a716-446655440510', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440305', 1, '2024-08-06 11:45:00+00'),
('550e8400-e29b-41d4-a716-446655440511', '550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440306', 1, '2024-08-07 08:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- Add sample comment votes
INSERT INTO public.comment_votes (id, user_id, comment_id, vote_type, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440600', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440400', 1, '2024-08-01 11:10:00+00'),
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440400', 1, '2024-08-01 11:20:00+00'),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440401', 1, '2024-08-01 11:40:00+00'),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440403', 1, '2024-08-02 15:15:00+00'),
('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440404', 1, '2024-08-03 10:30:00+00'),
('550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440404', 1, '2024-08-03 10:45:00+00'),
('550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440405', 1, '2024-08-04 17:15:00+00'),
('550e8400-e29b-41d4-a716-446655440607', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440406', 1, '2024-08-05 13:30:00+00'),
('550e8400-e29b-41d4-a716-446655440608', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440407', 1, '2024-08-06 12:45:00+00'),
('550e8400-e29b-41d4-a716-446655440609', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440408', 1, '2024-08-07 09:30:00+00')
ON CONFLICT (id) DO NOTHING;