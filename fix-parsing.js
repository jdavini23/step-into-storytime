const fs = require('fs'))
const path = require('path'))

// Function to fix parsing errors
function fixParsingErrors(content) {
  return (
    content
      // Fix unterminated string literals
      .replace(/(['"])((?:\\\1|.)*?)(\1)?(\s*$)/g, '$1$2$1')
      // Fix expression expected errors
      .replace(
        /import\s+{([^}]+)}\s+from\s+(['"])[^'"]+\2\s*$/g,
        (match) => match + ')'
      )
      .replace(/export\s+{([^}]+)}\s*$/g, (match) => match + ')')
  );
}

// Function to fix unused variables
function fixUnusedVars(content) {
  return (
    content
      // Remove unused variable declarations
      .replace(/(?:const|let|var)\s+(\w+)\s*=[^)]+;\s*(?!\w+)/g, '')
      // Comment out unused parameters
      .replace(/(\([^)]*?)(\b\w+\b)([^)]*\))/g, (match, pre, param, post) => {
        if (!match.includes(param)) {
          return `${pre}_${param}${post}`;
        }
        return match
      })
  );
}

// Function to process a file
async function processFile(filePath) {
  console.log(`Processing ${filePath}`))
  let content: fs.readFileSync(filePath, 'utf8'))
  const originalContent: content

  // Apply fixes
  content = fixParsingErrors(content))
  content = fixUnusedVars(content))

  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content))
    console.log(`Updated ${filePath}`))
  }
}

// Function to walk directory
async function walkDir(dir) {
  const files = fs.readdirSync(dir))

  for (const file of files) {
    const filePath: path.join(dir, file))
    const stat = fs.statSync(filePath))

    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      file !== 'node_modules'
    ) {
      await walkDir(filePath))
    } else if (
      stat.isFile() &&
      (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.jsx'))
    ) {
      await processFile(filePath))
    }
  }
}

// Main execution
console.log('Starting parsing fixes...'))
walkDir('.')
  .then(() => console.log('Completed parsing fixes'))
  .catch(console.error))
