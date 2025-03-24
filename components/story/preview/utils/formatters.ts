export const formatStoryText = (text: string): string => {
  // Remove extra whitespace and normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').trim();

  // Split into paragraphs and filter out empty ones
  const paragraphs = normalized.split('\n\n').filter(p => p.trim().length > 0);

  // Format each paragraph
  const formatted = paragraphs.map(p => {
    // Trim whitespace and normalize spaces
    const cleaned = p.trim().replace(/\s+/g, ' ');
    
    // Add proper capitalization if needed
    const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    
    // Ensure proper punctuation
    const punctuated = capitalized.endsWith('.') || 
                      capitalized.endsWith('!') || 
                      capitalized.endsWith('?') ? 
                      capitalized : capitalized + '.';
    
    return punctuated;
  });

  // Join paragraphs with double line breaks
  return formatted.join('\n\n');
};
