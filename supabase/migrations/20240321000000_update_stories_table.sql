-- Add missing columns
alter table public.stories
  add column if not exists length integer,
  add column if not exists reading_level text,
  add column if not exists language text,
  add column if not exists style text;

-- Set default values for existing rows
update public.stories
set 
  length = coalesce(estimated_reading_minutes, 5),
  reading_level = 'beginner',
  language = 'en',
  style = 'bedtime',
  content = coalesce(content, ''),
  character = coalesce(character, '{}'),
  setting = coalesce(setting, ''),
  theme = coalesce(theme, '')
where 
  length is null 
  or reading_level is null 
  or language is null 
  or style is null
  or content is null
  or character is null
  or setting is null
  or theme is null;

-- Now make columns not nullable
alter table public.stories
  alter column content set not null,
  alter column character set not null,
  alter column setting set not null,
  alter column theme set not null,
  alter column length set not null,
  alter column reading_level set not null,
  alter column language set not null,
  alter column style set not null; 