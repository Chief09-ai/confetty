-- Fix the remaining function with search_path warning
CREATE OR REPLACE FUNCTION public.handle_vote_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;