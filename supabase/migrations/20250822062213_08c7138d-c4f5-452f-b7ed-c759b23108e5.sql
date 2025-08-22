-- Fix security warnings: Add search_path to functions
DROP FUNCTION IF EXISTS public.get_public_user_profile(uuid);

CREATE OR REPLACE FUNCTION public.get_public_user_profile(user_id_param uuid)
RETURNS TABLE(
  id uuid,
  username text,
  joined_at timestamp with time zone,
  confetty_score integer
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT u.id, u.username, u.joined_at, u.confetty_score
  FROM public.users u
  WHERE u.id = user_id_param;
$$;

-- Fix the other function that has search_path warning
CREATE OR REPLACE FUNCTION public.update_user_confetty_score(user_id_param uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;