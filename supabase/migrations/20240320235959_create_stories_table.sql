-- Create the stories table
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  content text not null,
  character jsonb not null,
  setting text not null,
  theme text not null,
  length integer not null,
  reading_level text not null,
  language text not null,
  style text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.stories enable row level security;

-- Create policies
create policy "Users can view their own stories"
on public.stories
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own stories"
on public.stories
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own stories"
on public.stories
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own stories"
on public.stories
for delete
to authenticated
using (auth.uid() = user_id);

-- Create updated_at trigger
create trigger set_updated_at
  before update on public.stories
  for each row
  execute function public.set_updated_at();

-- Add table comments
comment on table public.stories is 'Stores user-generated stories with their metadata';
comment on column public.stories.id is 'The unique identifier for the story';
comment on column public.stories.user_id is 'The ID of the user who created the story';
comment on column public.stories.title is 'The title of the story';
comment on column public.stories.content is 'The full text content of the story';
comment on column public.stories.character is 'JSON object containing character details';
comment on column public.stories.setting is 'The story setting';
comment on column public.stories.theme is 'The story theme';
comment on column public.stories.length is 'The target length of the story in minutes';
comment on column public.stories.reading_level is 'The reading level of the story';
comment on column public.stories.language is 'The language of the story';
comment on column public.stories.style is 'The style of the story';
comment on column public.stories.created_at is 'When the story was created';
comment on column public.stories.updated_at is 'When the story was last updated'; 