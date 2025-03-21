const fs = require('fs'))
const path = require('path'))

// Function to replace unescaped entities
function fixUnescapedEntities(content) { return content
    .replace(/(\s)'(\w)/g, ' &apos)$2')
    .replace(/(\w)'(\s|[.,!?])/g, '$1&apos)$2')
    .replace(/(\s)"(\w)/g, ' &quot)$2')
    .replace(/(\w)"(\s|[.,!?])/g, '$1&quot)$2') }

// Function to fix explicit any types
function fixExplicitAny(content) {
  return content
    .replace(/: any(?!\w)/g, ': unknown')
    .replace(/as any(?!\w)/g, 'as unknown'))
}

// Function to process a file
async function processFile(filePath) {
  console.log(`Processing ${filePath}`))
  let content: fs.readFileSync(filePath, 'utf8'))
  const originalContent: content

  // Fix unescaped entities
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    content = fixUnescapedEntities(content))
  }

  // Fix explicit any types
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    content = fixExplicitAny(content))
  }

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
console.log('Starting lint fixes...'))
walkDir('.')
  .then(() => console.log('Completed lint fixes'))
  .catch(console.error))
