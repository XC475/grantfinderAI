-- Updated trigger for new schema structure
-- Renamed: Workspace → Organization, personalWorkspaceId → organizationId

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_organization_id text := 'org_' || replace(new.id::text, '-', '');
  v_name text := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_slug text;
begin
  -- Properly sanitize the slug - remove ALL spaces and special characters
  v_slug := lower(trim(v_name));
  v_slug := regexp_replace(v_slug, '[^\w-]', '-', 'g');  -- Replace spaces & special chars with hyphens
  v_slug := regexp_replace(v_slug, '-+', '-', 'g');      -- Replace multiple hyphens with single
  v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g');  -- Remove leading/trailing hyphens

  -- First create the organization (formerly workspace)
  insert into app.organizations (id, name, slug, type, role, "createdAt", "updatedAt")
  values (
    v_organization_id,
    v_name || '''s Organization',
    v_slug,
    'PERSONAL'::app."OrganizationType",
    'ADMIN'::app."OrganizationRole",
    now(),
    now()
  )
  on conflict (id) do nothing;

  -- Then create the user with the organization reference
  insert into app.users (id, email, name, "organizationId", system_admin, "createdAt", "updatedAt")
  values (
    new.id,
    new.email,
    v_name,
    v_organization_id,
    false,
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

