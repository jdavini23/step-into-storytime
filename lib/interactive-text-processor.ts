interface WordMatch {
  word: string;
  type: 'character' | 'object' | 'action' | 'location' | 'magic';
  index: number;
}

interface ProcessedText {
  segments: {
    text: string;
    isInteractive: boolean;
    type?: 'character' | 'object' | 'action' | 'location' | 'magic';
  }[];
}

// Keywords for each type of interactive element
const interactivePatterns = {
  character: [
    /\b(?:wizard|witch|fairy|dragon|princess|knight|king|queen|prince|princess|hero|monster)\b/i,
    /\b(?:friend|companion|ally|guardian|keeper|master|apprentice)\b/i,
  ],
  object: [
    /\b(?:wand|potion|scroll|book|crystal|gem|sword|shield|key|map|treasure|ring)\b/i,
    /\b(?:amulet|staff|orb|crown|pendant|bracelet|cloak|mirror)\b/i,
  ],
  action: [
    /\b(?:cast|enchant|transform|summon|vanish|appear|fly|leap|dance|sing|glow)\b/i,
    /\b(?:whisper|shout|run|jump|climb|swim|fight|protect|heal|create)\b/i,
  ],
  location: [
    /\b(?:castle|tower|forest|cave|mountain|valley|river|lake|ocean|island)\b/i,
    /\b(?:village|city|kingdom|realm|world|dimension|portal|gate|bridge)\b/i,
  ],
  magic: [
    /\b(?:magic|spell|enchantment|curse|blessing|power|energy|light|shadow)\b/i,
    /\b(?:mystic|arcane|ethereal|celestial|ancient|sacred|mystical|magical)\b/i,
  ],
};

export function findInteractiveWords(text: string): WordMatch[] {
  const matches: WordMatch[] = [];

  // Check each type of pattern
  Object.entries(interactivePatterns).forEach(([type, patterns]) => {
    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        matches.push({
          word: match[0],
          type: type as WordMatch['type'],
          index: match.index,
        });
      }
    });
  });

  // Sort matches by index to process them in order
  return matches.sort((a, b) => a.index - b.index);
}

export function processInteractiveText(text: string): ProcessedText {
  const matches = findInteractiveWords(text);
  const segments: ProcessedText['segments'] = [];
  let lastIndex = 0;

  matches.forEach((match) => {
    // Add non-interactive text before the match
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isInteractive: false,
      });
    }

    // Add the interactive word
    segments.push({
      text: match.word,
      isInteractive: true,
      type: match.type,
    });

    lastIndex = match.index + match.word.length;
  });

  // Add any remaining non-interactive text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isInteractive: false,
    });
  }

  return { segments };
}

export function enhanceStoryContent(content: string): string {
  const enhancedContent = content.replace(
    /\b(magic|spell|potion|wand|crystal|dragon|fairy|castle|forest)\b/gi,
    (match) => `<interactive type="magic">${match}</interactive>`
  );
  return enhancedContent;
}
