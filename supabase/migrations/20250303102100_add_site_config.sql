-- Create the site_config table for storing sitemap and other site configurations
create table if not exists site_config (
    id uuid default gen_random_uuid() primary key,
    key text not null unique,
    value text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create an index on the key column for faster lookups
create index if not exists idx_site_config_key on site_config(key);

-- Create a trigger to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_site_config_updated_at
    before update on site_config
    for each row
    execute function update_updated_at_column();

-- Add RLS policies
alter table site_config enable row level security;

create policy "Allow public read access"
    on site_config for select
    to public
    using (true);

create policy "Allow authenticated users to insert/update"
    on site_config for all
    to authenticated
    using (true)
    with check (true);