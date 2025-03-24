import { StoryParagraph } from '../../common/types';

interface FormattedStoryResult {
  paragraphs: StoryParagraph[];
  totalPages: number;
  title?: string;
}

const WORDS_PER_PAGE = 200; // Average words per page

/**
 * Formats raw story text into structured paragraphs and calculates pagination
 * @param text - Raw story text, potentially containing markdown
 * @returns Formatted story data including paragraphs and page count
 */
export function formatStoryText(text: string): FormattedStoryResult {
  if (!text) return { paragraphs: [], totalPages: 0 };

  const lines = text.split('\n');
  const firstLine = lines[0] || '';
  let title = '';
  let content = '';

  // Extract title from markdown heading if present
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

  // Normalize markdown headings
  content = content
    .split('\n')
    .map((line) => {
      if (line.startsWith('#')) {
        const match = line.match(/^(#+)(\S)/);
        if (match) {
          return `${match[1]} ${match[2]}${line.substring(match[0].length)}`;
        }
      }
      return line;
    })
    .join('\n');

  // Convert content to structured paragraphs
  const paragraphs: StoryParagraph[] = content
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((content, index) => {
      const type = determineContentType(content);
      return {
        content: content.replace(/^#+\s/, ''), // Remove heading markers
        type,
        index,
      };
    });

  // Calculate pagination
  const totalWords = content.split(/\s+/).length;
  const totalPages = Math.max(1, Math.ceil(totalWords / WORDS_PER_PAGE));

  return {
    paragraphs,
    totalPages,
    title: title || undefined,
  };
}

/**
 * Determines the type of content based on markdown syntax
 * @param content - Line of content to analyze
 * @returns Content type identifier
 */
function determineContentType(content: string): StoryParagraph['type'] {
  if (content.startsWith('# ')) return 'heading1';
  if (content.startsWith('## ')) return 'heading2';
  if (content.startsWith('### ')) return 'heading3';
  return 'paragraph';
}
