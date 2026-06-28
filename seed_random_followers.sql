DO $$
DECLARE
  roshan_id uuid;
BEGIN
  ---------------------------------------------------------
  -- 1. Find Roshan's ID using his email
  ---------------------------------------------------------
  SELECT id INTO roshan_id FROM auth.users WHERE email = 'roshanjdhv114@gmail.com' LIMIT 1;

  IF roshan_id IS NOT NULL THEN
    ---------------------------------------------------------
    -- 2. Make EVERY single user in the database follow Roshan
    ---------------------------------------------------------
    INSERT INTO public.user_followers (follower_id, following_id)
    SELECT id, roshan_id 
    FROM auth.users 
    WHERE id != roshan_id
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Success: Made all users follow Roshan Jadhav.';
  ELSE
    RAISE NOTICE 'Warning: Roshan Jadhav (roshanjdhv114@gmail.com) not found in auth.users. Make sure the email is exact.';
  END IF;

  ---------------------------------------------------------
  -- 3. Make users randomly follow each other
  ---------------------------------------------------------
  -- We do a CROSS JOIN of all users and randomly pick pairs
  -- The random() < 0.15 means there is roughly a 15% chance 
  -- any user follows any other user. You can tweak this number!
  INSERT INTO public.user_followers (follower_id, following_id)
  SELECT follower.id, following.id
  FROM auth.users follower
  CROSS JOIN auth.users following
  WHERE follower.id != following.id
    AND random() < 0.15
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Success: Added random followers between all users.';

END $$;
