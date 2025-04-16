-- Rename remaining columns to camelCase
ALTER TABLE public.stories
  RENAME COLUMN user_id TO "userId";

ALTER TABLE public.stories
  RENAME COLUMN created_at TO "createdAt";

ALTER TABLE public.stories
  RENAME COLUMN updated_at TO "updatedAt";

ALTER TABLE public.stories
  RENAME COLUMN plot_elements TO "plotElements";

ALTER TABLE public.stories
  RENAME COLUMN is_published TO "isPublished";

ALTER TABLE public.stories
  RENAME COLUMN thumbnail_url TO "thumbnailUrl";

ALTER TABLE public.stories
  RENAME COLUMN estimated_reading_minutes TO "estimatedReadingMinutes";

ALTER TABLE public.stories
  RENAME COLUMN difficulty_level TO "difficultyLevel";

-- Add comments for renamed columns
COMMENT ON COLUMN public.stories."userId" IS 'The ID of the user who created the story';
COMMENT ON COLUMN public.stories."createdAt" IS 'Timestamp when the story was created';
COMMENT ON COLUMN public.stories."updatedAt" IS 'Timestamp when the story was last updated';
COMMENT ON COLUMN public.stories."plotElements" IS 'Array of plot elements used in the story';
COMMENT ON COLUMN public.stories."isPublished" IS 'Boolean indicating if the story is published';
COMMENT ON COLUMN public.stories."thumbnailUrl" IS 'URL of the story thumbnail image';
COMMENT ON COLUMN public.stories."estimatedReadingMinutes" IS 'Estimated time to read the story in minutes';
COMMENT ON COLUMN public.stories."difficultyLevel" IS 'Difficulty level of the story'; 