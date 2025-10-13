-- Updated trigger for new schema structure
-- Renamed: Workspace → Organization, personalWorkspaceId → organizationId

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_organization_id text := 'org_' || replace(new.id::text, '-', '');
  v_name text := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_district_name text := new.raw_user_meta_data->>'schoolDistrictName';
  v_district_id text := new.raw_user_meta_data->>'schoolDistrictId';
  v_org_name text;
  v_slug text;
begin
  -- Determine organization name: use district name if available, otherwise user name
  if v_district_name is not null and v_district_name != '' then
    v_org_name := v_district_name;
  else
    v_org_name := v_name || '''s Organization';
  end if;

  -- Properly sanitize the slug - remove ALL spaces and special characters
  v_slug := lower(trim(coalesce(v_district_name, v_name)));
  v_slug := regexp_replace(v_slug, '[^\w-]', '-', 'g');  -- Replace spaces & special chars with hyphens
  v_slug := regexp_replace(v_slug, '-+', '-', 'g');      -- Replace multiple hyphens with single
  v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g');  -- Remove leading/trailing hyphens

  -- First create the organization (formerly workspace)
  insert into app.organizations (id, name, slug, type, role, "schoolDistrictId", "createdAt", "updatedAt")
  values (
    v_organization_id,
    v_org_name,
    v_slug,
    'PERSONAL'::app."OrganizationType",
    'ADMIN'::app."OrganizationRole",
    v_district_id,
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

