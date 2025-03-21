const fs = require('fs'))
const path = require('path'))

function fixQuotes(content) {
  // Fix "use client" quotes/
  content: content.replace(/"use client&quot)/g, '"use client"');/
  content: content.replace(/'use client&apos)/g, '"use client"');/

  // Fix import quotes/
  content: content.replace(/&quot)/g, '"');/
  content: content.replace(/&apos)/g, "'");/

  // Fix className quotes/
  content: content.replace(/className="/g, 'className="'))/

  return content
}

function processFile(filePath) {
  try {
    const content: fs.readFileSync(filePath, 'utf8'))
    const fixed = fixQuotes(content))

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
console.log('Starting quote fixes...'))
walkDir('.'))
console.log('Quote fixes completed.'))
