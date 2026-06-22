const fs = require('fs');
const path = require('path');

const map = {
  'ðŸ›¡ï¸ ': '🛡️',
  'ðŸ”„': '🔄',
  'ðŸ œï¸ ': '🕸️',
  'ðŸš€': '🚀',
  'ðŸ‘‹': '👋',
  'ðŸš«': '🚫',
  'ðŸ’¼': '💼',
  'ðŸ“¥': '📥',
  'ðŸŸ¢': '🟢',
  'ðŸ” ': '🔍',
  'ðŸ“ ': '📍',
  'ðŸ’°': '💰',
  'ðŸŽ¯': '🎯',
  'ðŸ‘ ï¸ ': '👁️',
  'ðŸ•’': '🕒',
  'ðŸ ¢': '🏢',
  'â‚¹': '₹',
  'âŒ›': '⌛'
};

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(filePath));
      } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        results.push(filePath);
      }
    });
  } catch(e) {}
  return results;
}

const files = walk(path.join(__dirname, 'src'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [corrupted, fixed] of Object.entries(map)) {
    if (content.includes(corrupted)) {
      content = content.split(corrupted).join(fixed);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed emojis in ${file}`);
  }
});
