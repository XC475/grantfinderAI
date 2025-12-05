-- Updated trigger for multi-user organizations
-- Supports adding users to existing organizations or creating new ones

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_organization_id text;
  v_name text := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_existing_org_id text := new.raw_user_meta_data->>'organizationId';
  v_role text := coalesce(new.raw_user_meta_data->>'role', 'MEMBER');
  v_organization_name text := new.raw_user_meta_data->>'organizationName';
  v_org_name text;
  v_slug text;
  v_slug_counter integer := 0;
  v_slug_candidate text;
begin
  -- If organization ID provided, use it (adding to existing org)
  if v_existing_org_id is not null and v_existing_org_id != '' then
    v_organization_id := v_existing_org_id;
  else
    -- Create new organization
    v_organization_id := 'org_' || replace(new.id::text, '-', '');
    
    -- Determine organization name
    if v_organization_name is not null and v_organization_name != '' then
      v_org_name := v_organization_name;
    else
      v_org_name := v_name || '''s Organization';
    end if;
    
    -- Generate unique slug with conflict resolution
    v_slug := lower(trim(coalesce(v_organization_name, v_name)));
    v_slug := regexp_replace(v_slug, '[^\w-]', '-', 'g');  -- Replace spaces & special chars with hyphens
    v_slug := regexp_replace(v_slug, '-+', '-', 'g');      -- Replace multiple hyphens with single
    v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g');  -- Remove leading/trailing hyphens
    
    -- Handle slug conflicts by appending a number
    v_slug_candidate := v_slug;
    while exists (select 1 from app.organizations where slug = v_slug_candidate) loop
      v_slug_counter := v_slug_counter + 1;
      v_slug_candidate := v_slug || '-' || v_slug_counter::text;
    end loop;
    v_slug := v_slug_candidate;
    
    -- Create organization (role field removed)
    insert into app.organizations (id, name, slug, "createdAt", "updatedAt")
    values (v_organization_id, v_org_name, v_slug, now(), now())
    on conflict (id) do nothing;
    
    -- Create default document tags for new organization
    insert into app.document_tags (id, name, "organizationId", "createdAt", "updatedAt")
    select
      gen_random_uuid()::text,
      tag_name,
      v_organization_id,
      now(),
      now()
    from (values
      ('General'),
      ('Winning Application'),
      ('Template'),
      ('Financials and Budget')
    ) as defaults(tag_name)
    on conflict ("organizationId", name) do nothing;
  end if;
  
  -- Create user with role, onboarding status, and temporary password flag
  insert into app.users (id, email, name, role, "organizationId", system_admin, "onboardingCompleted", "hasTemporaryPassword", "createdAt", "updatedAt")
  values (
    new.id,
    new.email,
    v_name,
    v_role::app."OrganizationRole",
    v_organization_id,
    false,
    false,
    coalesce((new.raw_user_meta_data->>'hasTemporaryPassword')::boolean, false),
    now(),
    now()
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

-- Drop old trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger on Supabase's auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

