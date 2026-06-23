const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { regex: /\bbg-white(?!\s+dark:)/g, replace: "bg-white dark:bg-[#080A08]" },
  { regex: /\bbg-gray-50(?!\s+dark:)/g, replace: "bg-gray-50 dark:bg-[#080A08]" },
  { regex: /\bbg-slate-50(?!\s+dark:)/g, replace: "bg-slate-50 dark:bg-[#080A08]" },
  { regex: /\bbg-slate-100(?!\s+dark:)/g, replace: "bg-slate-100 dark:bg-[#141414]" },
  { regex: /\bbg-gray-100(?!\s+dark:)/g, replace: "bg-gray-100 dark:bg-[#141414]" },
  { regex: /\bbg-gray-200(?!\s+dark:)/g, replace: "bg-gray-200 dark:bg-[#1e1e1e]" },
  { regex: /\bbg-cyan-700(?!\s+dark:)/g, replace: "bg-cyan-700 dark:bg-cyan-800" },
  { regex: /\bbg-\[#1B998B\](?!\s+dark:)/g, replace: "bg-[#1B998B] dark:bg-[#1B998B]" },
  
  // Text Colors
  { regex: /\btext-black(?!\s+dark:)/g, replace: "text-black dark:text-white" },
  { regex: /\btext-gray-900(?!\s+dark:)/g, replace: "text-gray-900 dark:text-gray-100" },
  { regex: /\btext-gray-800(?!\s+dark:)/g, replace: "text-gray-800 dark:text-gray-200" },
  { regex: /\btext-gray-700(?!\s+dark:)/g, replace: "text-gray-700 dark:text-gray-300" },
  { regex: /\btext-slate-800(?!\s+dark:)/g, replace: "text-slate-800 dark:text-gray-100" },
  { regex: /\btext-slate-700(?!\s+dark:)/g, replace: "text-slate-700 dark:text-gray-200" },
  { regex: /\btext-gray-600(?!\s+dark:)/g, replace: "text-gray-600 dark:text-gray-400" },
  { regex: /\btext-gray-500(?!\s+dark:)/g, replace: "text-gray-500 dark:text-gray-400" },
  { regex: /\btext-slate-500(?!\s+dark:)/g, replace: "text-slate-500 dark:text-gray-400" },
  { regex: /\btext-slate-400(?!\s+dark:)/g, replace: "text-slate-400 dark:text-gray-500" },
  { regex: /\btext-cyan-800(?!\s+dark:)/g, replace: "text-cyan-800 dark:text-cyan-300" },
  { regex: /\btext-cyan-600(?!\s+dark:)/g, replace: "text-cyan-600 dark:text-cyan-400" },
  
  // Borders
  { regex: /\bborder-gray-100(?!\s+dark:)/g, replace: "border-gray-100 dark:border-[#222]" },
  { regex: /\bborder-gray-200(?!\s+dark:)/g, replace: "border-gray-200 dark:border-[#2a2a2a]" },
  { regex: /\bborder-slate-200(?!\s+dark:)/g, replace: "border-slate-200 dark:border-[#181818]" },
  { regex: /\bborder-slate-100(?!\s+dark:)/g, replace: "border-slate-100 dark:border-[#222]" },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replace);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
console.log('Done refactoring theme classes!');
