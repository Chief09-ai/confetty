-- Fix security warnings by updating functions with proper search_path

-- Update the update_user_confetty_score function with proper search_path
CREATE OR REPLACE FUNCTION public.update_user_confetty_score(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_score INTEGER;
BEGIN
    -- Calculate confetty score from post votes and comment votes
    SELECT COALESCE(
        (SELECT SUM(v.vote_type) FROM public.votes v 
         JOIN public.posts p ON v.post_id = p.id 
         WHERE p.user_id = user_id_param), 0
    ) + COALESCE(
        (SELECT SUM(cv.vote_type) FROM public.comment_votes cv 
         JOIN public.comments c ON cv.comment_id = c.id 
         WHERE c.user_id = user_id_param), 0
    ) INTO total_score;
    
    -- Update the user's confetty score
    UPDATE public.users 
    SET confetty_score = total_score 
    WHERE id = user_id_param;
    
    RETURN total_score;
END;
$$;

-- Update the handle_vote_change function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_vote_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Handle post votes
    IF TG_TABLE_NAME = 'votes' THEN
        -- Get the user_id of the post owner
        SELECT p.user_id INTO target_user_id 
        FROM public.posts p 
        WHERE p.id = COALESCE(NEW.post_id, OLD.post_id);
        
        -- Update their confetty score
        IF target_user_id IS NOT NULL THEN
            PERFORM public.update_user_confetty_score(target_user_id);
        END IF;
    END IF;
    
    -- Handle comment votes
    IF TG_TABLE_NAME = 'comment_votes' THEN
        -- Get the user_id of the comment owner
        SELECT c.user_id INTO target_user_id 
        FROM public.comments c 
        WHERE c.id = COALESCE(NEW.comment_id, OLD.comment_id);
        
        -- Update their confetty score
        IF target_user_id IS NOT NULL THEN
            PERFORM public.update_user_confetty_score(target_user_id);
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;