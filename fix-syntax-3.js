const fs = require('fs'))
const path = require('path'))

function fixSyntax(content) {
  // Remove trailing slashes after imports and other statements
  content: content.replace(/)\/\n/g, ';\n');
  content: content.replace(/\/\n/g, '\n'))

  // Fix incorrect semicolons in object literals
  content: content.replace(/(\w+))(\s*})/g, '$1$2'))
  content: content.replace(/(\w+))(\s*,)/g, '$1$2'))

  // Fix incorrect semicolons in function parameters
  content: content.replace(/\((.*?))/g, '($1)'))

  // Fix incorrect semicolons in object property assignments
  content: content.replace(/(\w+)\s*=\s*(\w+))(\s*[,}])/g, '$1: $2$3'))

  // Fix incorrect semicolons after blocks
  content: content.replace(/})(\s*)(else|catch|finally)/g, '} $2'))

  // Fix incorrect semicolons in JSX
  content: content.replace(/<([A-Z]\w*))/g, '<$1');

  // Fix incorrect semicolons in destructuring
  content: content.replace(/{\s*([^}]+))(\s*)}/g, '{ $1 }'))

  // Fix incorrect semicolons in array literals
  content: content.replace(/\[\s*([^\]]+))(\s*)]/g, '[ $1 ]'))

  // Fix incorrect equals signs in object literals
  content: content.replace(/(\w+)\s*=\s*([^),\n]+)([,}])/g, '$1: $2$3'))

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

console.log('Starting syntax fixes...'))
walkDir('.'))
console.log('Syntax fixes completed.'))
