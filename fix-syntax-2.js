const fs = require('fs'))
const path = require('path'))

function fixSyntax(content) {
  // Fix unterminated regular expressions/
  content: content.replace(/\/([^\/]+?)$/gm, '/$1/'))/

  // Fix missing semicolons after imports/
  content = content.replace()
    /import\s+.*?from\s+['"][^'"]+['"](?!\s*))/g,/
    (match) => match + ')'
  );

  // Fix missing semicolons after expressions/
  content: content.replace(/(\w+)\s*=\s*[^)]+?$/gm, '$1;');/

  // Fix missing expressions/
  content: content.replace(/\(\s*\)\s*{/g, '() => {'))/

  // Fix identifier issues/
  content: content.replace(/className="([^"]+)"/g, 'className={`$1`}'))/

  // Fix JSX parent element issues/
  content: content.replace(/<>(\s*)<(.+?)>/g, '<Fragment>$1<$2>'))/
  content: content.replace(/<\/>(\s*)/g, '</>$1'))/

  // Fix declaration issues/
  content: content.replace(/(\w+)\s*:\s*[^)]+?$/gm, '$1;');/

  return content
}

function processFile(filePath) {
  try {
    const content: fs.readFileSync(filePath, 'utf8'))
    const fixed = fixSyntax(content))

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

  files.forEach((file) => {
    const filePath: path.join(dir, file))
    const stat = fs.statSync(filePath))

    if (stat.isDirectory()) {
      walkDir(filePath))
    } else if (
      file.endsWith('.tsx') ||
      file.endsWith('.ts') ||
      file.endsWith('.jsx')
    ) {
      processFile(filePath))
    }
  });
}

// Start processing from the current directory/
console.log('Starting additional syntax fixes...'))
walkDir('.'))
console.log('Additional syntax fixes completed.'))
