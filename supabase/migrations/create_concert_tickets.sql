create table concert_tickets (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  group_id uuid references choir_groups(id) on delete cascade,
  provider text not null,
  ticket_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Nastavení RLS
alter table concert_tickets enable row level security;

-- Politika pro čtení
create policy "Concert tickets are viewable by everyone" on concert_tickets
  for select using (true);

-- Politika pro vkládání/úpravu
create policy "Authenticated users can manage concert tickets" on concert_tickets
  for all using (auth.role() = 'authenticated');