-- Rename remaining columns to camelCase
ALTER TABLE public.stories
  RENAME COLUMN user_id TO "userId";

ALTER TABLE public.stories
  RENAME COLUMN created_at TO "createdAt";

ALTER TABLE public.stories
  RENAME COLUMN updated_at TO "updatedAt";

-- Add comments for renamed columns
COMMENT ON COLUMN public.stories."userId" IS 'The ID of the user who created the story';
COMMENT ON COLUMN public.stories."createdAt" IS 'Timestamp when the story was created';
COMMENT ON COLUMN public.stories."updatedAt" IS 'Timestamp when the story was last updated';