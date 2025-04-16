-- Rename columns to match API camelCase naming
alter table public.stories
  rename column reading_level to "readingLevel";

-- Update comments for renamed columns
comment on column public.stories."readingLevel" is 'The reading level of the story'; 