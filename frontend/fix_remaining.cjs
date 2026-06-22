const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'SecurityDashboard.jsx', from: 'ðŸ›¡ï¸ ', to: '🛡️' },
  { file: 'SecurityDashboard.jsx', from: 'ðŸ œï¸ ', to: '🕸️' },
  { file: 'Register.jsx', from: 'ðŸ›¡ï¸ ', to: '🛡️' },
  { file: 'RecruiterDashboard.jsx', from: 'ðŸ” ', to: '🔍' },
  { file: 'RecruiterDashboard.jsx', from: 'ðŸ“ ', to: '📍' },
  { file: 'RecruiterDashboard.jsx', from: 'ðŸ‘ ï¸ ', to: '👁️' },
  { file: 'AiMatcher.jsx', from: 'ðŸ œï¸ ', to: '🕸️' },
  { file: 'AdminDashboard.jsx', from: 'ðŸ ¢', to: '🏢' }
];

replacements.forEach(({ file, from, to }) => {
  const filePath = path.join(__dirname, 'src', 'pages', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(from)) {
      content = content.split(from).join(to);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Replaced in ${file}`);
    } else {
      console.log(`Not found in ${file}: ${from}`);
    }
  }
});
