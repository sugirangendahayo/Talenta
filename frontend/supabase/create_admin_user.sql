-- ==========================================
-- CREATE ADMIN USER SCRIPT
-- ==========================================

DO $$
DECLARE
    -- CHANGE THESE VALUES BEFORE RUNNING:
    admin_email text := 'admin@gmail.com';
    admin_password text := 'admin@123';
    
    new_user_id uuid := gen_random_uuid();
    encrypted_pw text;
BEGIN
    -- 1. Encrypt the password using Supabase's auth function
    encrypted_pw := crypt(admin_password, gen_salt('bf'));

    -- 2. Insert the user into auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        admin_email,
        encrypted_pw,
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"role":"admin"}',
        false,
        'authenticated'
    );

    -- 3. Insert into public.profiles
    -- (This assumes your schema has public.profiles. Note: If you have a trigger that
    -- automatically creates a profile on auth.users INSERT, this might fail with a 
    -- duplicate key error. If so, just run the UPDATE statement below instead.)
    
    BEGIN
        INSERT INTO public.profiles (id, role, created_at, updated_at)
        VALUES (new_user_id, 'admin', now(), now());
    EXCEPTION WHEN unique_violation THEN
        -- If a trigger already created the profile, just update the role
        UPDATE public.profiles SET role = 'admin' WHERE id = new_user_id;
    END;

    -- 4. Create an identity record (required by Supabase auth)
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        new_user_id,
        new_user_id::text,
        format('{"sub":"%s","email":"%s"}', new_user_id::text, admin_email)::jsonb,
        'email',
        now(),
        now(),
        now()
    );

    RAISE NOTICE 'Admin user created successfully! ID: %', new_user_id;
END $$;
