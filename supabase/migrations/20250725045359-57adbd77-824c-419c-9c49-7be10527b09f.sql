-- Add confetty_score column to users table
ALTER TABLE public.users 
ADD COLUMN confetty_score INTEGER DEFAULT 0;

-- Create a function to calculate and update confetty score
CREATE OR REPLACE FUNCTION public.update_user_confetty_score(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_score INTEGER;
BEGIN
    -- Calculate confetty score from post votes and comment votes
    SELECT COALESCE(
        (SELECT SUM(v.vote_type) FROM votes v 
         JOIN posts p ON v.post_id = p.id 
         WHERE p.user_id = user_id_param), 0
    ) + COALESCE(
        (SELECT SUM(cv.vote_type) FROM comment_votes cv 
         JOIN comments c ON cv.comment_id = c.id 
         WHERE c.user_id = user_id_param), 0
    ) INTO total_score;
    
    -- Update the user's confetty score
    UPDATE public.users 
    SET confetty_score = total_score 
    WHERE id = user_id_param;
    
    RETURN total_score;
END;
$$;

-- Create a trigger function to update confetty score when votes change
CREATE OR REPLACE FUNCTION public.handle_vote_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Handle post votes
    IF TG_TABLE_NAME = 'votes' THEN
        -- Get the user_id of the post owner
        SELECT p.user_id INTO target_user_id 
        FROM posts p 
        WHERE p.id = COALESCE(NEW.post_id, OLD.post_id);
        
        -- Update their confetty score
        IF target_user_id IS NOT NULL THEN
            PERFORM update_user_confetty_score(target_user_id);
        END IF;
    END IF;
    
    -- Handle comment votes
    IF TG_TABLE_NAME = 'comment_votes' THEN
        -- Get the user_id of the comment owner
        SELECT c.user_id INTO target_user_id 
        FROM comments c 
        WHERE c.id = COALESCE(NEW.comment_id, OLD.comment_id);
        
        -- Update their confetty score
        IF target_user_id IS NOT NULL THEN
            PERFORM update_user_confetty_score(target_user_id);
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for vote changes
CREATE TRIGGER trigger_update_confetty_score_on_vote_insert
    AFTER INSERT ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_vote_change();

CREATE TRIGGER trigger_update_confetty_score_on_vote_update
    AFTER UPDATE ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_vote_change();

CREATE TRIGGER trigger_update_confetty_score_on_vote_delete
    AFTER DELETE ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_vote_change();

CREATE TRIGGER trigger_update_confetty_score_on_comment_vote_insert
    AFTER INSERT ON public.comment_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_vote_change();

CREATE TRIGGER trigger_update_confetty_score_on_comment_vote_update
    AFTER UPDATE ON public.comment_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_vote_change();

CREATE TRIGGER trigger_update_confetty_score_on_comment_vote_delete
    AFTER DELETE ON public.comment_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_vote_change();

-- Update existing users' confetty scores
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM public.users LOOP
        PERFORM update_user_confetty_score(user_record.id);
    END LOOP;
END $$;