import { StoryParagraph } from '../../common/types';

export function formatStoryText(text: string) {
  if (!text) return { paragraphs: [], totalPages: 0 };

  const lines = text.split('\n');
  const firstLine = lines[0] || '';
  let title = '';
  let content = '';

  // If first line is a heading, use it as title
  if (firstLine.startsWith('# ')) {
    title = firstLine.substring(2).trim();
    content = lines.slice(1).join('\n').trim();
  } else if (firstLine.startsWith('#')) {
    title = firstLine.substring(1).trim();
    content = lines.slice(1).join('\n').trim();
    if (!content) {
      content = title;
    }
  } else {
    content = text;
  }

  // Process content to ensure proper markdown formatting
  content = content
    .split('\n')
    .map(line => {
      if (line.startsWith('#')) {
        const match = line.match(/^(#+)(\S)/);
        if (match) {
          return `${match[1]} ${match[2]}${line.substring(match[0].length)}`;
        }
      }
      return line;
    })
    .join('\n');

  // Convert to paragraphs
  const paragraphs: StoryParagraph[] = content
    .split('\n')
    .filter(line => line.trim() !== '')
    .map((content, index) => {
      let type = 'paragraph';
      if (content.startsWith('# ')) {
        type = 'heading1';
      } else if (content.startsWith('## ')) {
        type = 'heading2';
      } else if (content.startsWith('### ')) {
        type = 'heading3';
      }

      return {
        content,
        type,
        index,
      } as StoryParagraph;
    });

  // Calculate total pages based on content length
  const WORDS_PER_PAGE = 200; // Average words per page
  const totalWords = content.split(/\s+/).length;
  const totalPages = Math.ceil(totalWords / WORDS_PER_PAGE);

  return {
    paragraphs,
    totalPages: Math.max(1, totalPages), // Ensure at least 1 page
  };
}
