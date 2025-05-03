/**
 * Utility functions for data validation
 */

/**
 * Validates if a string is a valid UUID v4
 * @param id - The string to validate
 * @returns boolean - True if the string is a valid UUID v4
 */
export const isValidUUID = (id: string): boolean => {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return UUID_REGEX.test(id);
};

/**
 * Validates if a story ID is in the correct format
 * @param storyId - The story ID to validate
 * @returns boolean - True if the story ID is valid
 */
export const isValidStoryId = (storyId: string | null | undefined): boolean => {
  if (!storyId) return false;
  return isValidUUID(storyId);
};
