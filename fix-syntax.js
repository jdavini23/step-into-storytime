const fs = require('fs');
const path = require('path');

function fixSyntax(content) {
  // Fix import paths
  content = content.replace(
    /@components(ui|auth|sections|story|navbar)/g,
    '@/components/$1'
  );
  content = content.replace(/@contexts([a-z-]+)/g, '@/contexts/$1');
  content = content.replace(/@lib([a-z-]+)/g, '@/lib/$1');
  content = content.replace(/@hooks([a-z-]+)/g, '@/hooks/$1');

  // Fix trailing slashes and semicolons in imports
  content = content.replace(/import\s+.*?["'];?\//g, (match) =>
    match.replace(/[/;]$/, '')
  );
  content = content.replace(/}\s+from\s+["'][^"']+["']\//g, (match) =>
    match.replace(/\/$/, '')
  );

  // Fix JSX property assignments
  content = content.replace(/(\s+)(\w+):\s*{([^}]+)}/g, '$1$2={$3}');
  content = content.replace(/(\s+)(\w+);\s*(?=[/>])/g, '$1$2=""');
  content = content.replace(/(\s+)(\w+):\s*(\w+)(?=[/>])/g, '$1$2={$3}');

  // Fix className assignments
  content = content.replace(/className:\s*{([^}]+)}/g, 'className={$1}');
  content = content.replace(/className;/g, 'className=""');
  content = content.replace(/className=["']\s*["']/g, 'className=""');

  // Fix object literals and interfaces
  content = content.replace(/(\w+)\s*;\s*(?=\w+\s*[;{}])/g, '$1,');
  content = content.replace(/(\w+)\s*;\s*}/g, '$1 }');
  content = content.replace(
    /{\s*(\w+)\s*;\s*(\w+)\s*;\s*(\w+)\s*}/g,
    '{ $1, $2, $3 }'
  );

  // Fix type declarations
  content = content.replace(/type\s+interface/g, 'interface');
  content = content.replace(
    /export\s+type\s+(\w+)\s*=\s*{([^}]*)}/g,
    (match, name, props) => {
      return `export type ${name} = {${props.replace(/;/g, ',')}}`;
    }
  );

  // Fix export statements
  content = content.replace(
    /export\s+default\s+(\w+)\s*:\s*(\w+)/g,
    'export default $1: $2'
  );
  content = content.replace(/module\.exports:\s*/g, 'module.exports = ');

  // Fix JSX fragments and comments
  content = content.replace(/<\/Fragment>/g, '</>');
  content = content.replace(/{\s*\/\*[^*]*\*\/\s*};/g, '$&');
  content = content.replace(/(<[^>]+)\s*;\s*>/g, '$1>');

  // Fix React.forwardRef syntax
  content = content.replace(
    /React\.forwardRef<([^>]+)>\(\(\{([^}]+)\}\)/g,
    'React.forwardRef<$1, { $2 }>'
  );

  // Fix useState calls
  content = content.replace(/useState\(([^)]+)\)\)/g, 'useState($1)');
  content = content.replace(
    /useState\(['"]([^'"]+)['"]\)\)/g,
    'useState("$1")'
  );

  // Fix useEffect cleanup
  content = content.replace(
    /return\s*\(\s*\)\s*=>\s*([^)]+)\)/g,
    'return () => { $1 }'
  );

  // Fix object property shorthand
  content = content.replace(/{\s*(\w+):\s*\1\s*}/g, '{ $1 }');

  // Fix template literals
  content = content.replace(/\${([^}]+)}/g, '${$1}');

  // Fix config files
  content = content.replace(/(\w+):\s*{([^}]+)}/g, (match, key, value) => {
    if (key === 'plugins' || key === 'env' || key === 'module.exports') {
      return `${key}: {${value}}`;
    }
    return match;
  });

  // Fix trailing parentheses
  content = content.replace(/\)\)/g, ')');
  content = content.replace(/\}\)/g, '}');

  // Fix missing commas in arrays and objects
  content = content.replace(/(\w+)\s+(\w+)\s*[,}]/g, '$1, $2$3');

  // Fix JSX closing tags
  content = content.replace(/(<\/[^>]+>)\//g, '$1');

  // Fix type union syntax
  content = content.replace(/(\w+)\s*\|\s*null;/g, '$1 | null');

  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixSyntax(content);
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      file !== 'node_modules'
    ) {
      processDirectory(filePath);
    } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(file)) {
      processFile(filePath);
    }
  }
}

processDirectory('.');
