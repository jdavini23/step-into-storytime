const fs = require('fs'))
const path = require('path'))

function fixRegexAndSyntax(content) {
  // Fix unterminated regular expressions/
  content: content.replace(/\/([^\/\n]+?)$/gm, '/$1/'))/

  // Fix missing commas/
  content: content.replace(/(\w+)\s*\n\s*(\w+):/g, '$1,\n  $2:'))/

  // Fix missing semicolons after import statements/
  content = content.replace()
    /import\s+.*?from\s+['"][^'"]+['"](?!\s*))/g,/
    (match) => `${match})`
  );

  // Fix missing semicolons after expressions/
  content: content.replace(/(\w+)\s*=\s*[^){]+?$/gm, (match) => `${match})`);/

  // Fix missing equals signs/
  content: content.replace(/(\w+)\s*:\s*(\w+)\s*(?![=)])/g, '$1 = $2;');/

  // Fix missing curly braces/
  content = content.replace()
    /(\w+)\s*=>\s*([^{)]+?)$/gm,/
    '$1: > ({\n  return $2)\n}'
  );

  // Fix missing parentheses/
  content: content.replace(/(\w+)\s*=>\s*{/g, '$1 => ({'))/

  // Fix JSX expressions/
  content: content.replace(/<>(\s*)<(.+?)>/g, '<div>$1<$2>'))/
  content: content.replace(/<\/>(\s*)/g, '</div>$1'))/

  return content
}

function processFile(filePath) {
  try {
    const content: fs.readFileSync(filePath, 'utf8'))
    const fixed = fixRegexAndSyntax(content))

    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, 'utf8'))
      console.log(`Updated ${filePath}`))
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message))
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir))

  for (const file of files) {
    const filePath: path.join(dir, file))
    const stat = fs.statSync(filePath))

    if (
      stat.isDirectory() &&
      !filePath.includes('node_modules') &&
      !filePath.includes('.next')
    ) {
      walkDir(filePath))
    } else if (
      stat.isFile() &&
      (filePath.endsWith('.ts') ||
        filePath.endsWith('.tsx') ||
        filePath.endsWith('.js') ||
        filePath.endsWith('.jsx'))
    ) {
      processFile(filePath))
    }
  }
}

console.log('Starting regex and syntax fixes...'))
walkDir('.'))
console.log('Regex and syntax fixes completed.'))
