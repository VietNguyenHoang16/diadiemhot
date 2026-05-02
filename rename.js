const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /Địa Điểm Tốt/g, replace: 'Địa Điểm Hot' },
  { search: /Địa điểm tốt/g, replace: 'Địa điểm hot' },
  { search: /địa điểm tốt/g, replace: 'địa điểm hot' },
  { search: /ĐỊA ĐIỂM TỐT/g, replace: 'ĐỊA ĐIỂM HOT' },
  { search: /dia diem tot/g, replace: 'dia diem hot' },
  { search: /Dia diem tot/g, replace: 'Dia diem hot' },
  { search: /Dia Diem Tot/g, replace: 'Dia Diem Hot' },
  { search: /diadiemtot/g, replace: 'diadiemhot' },
  { search: /Diadiemtot/g, replace: 'Diadiemhot' },
  { search: /địa điểm tốt/i, replace: 'địa điểm hot' } // Catch-all for other cases? Maybe not needed with regex g
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file.endsWith('.log') || file.endsWith('.ico') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file === 'package-lock.json' || file === 'rename.js') {
      continue;
    }
    
    const filePath = path.join(dir, file);
    let stat;
    try {
       stat = fs.statSync(filePath);
    } catch(e) { continue; }
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else {
      let content;
      try {
        content = fs.readFileSync(filePath, 'utf8');
      } catch (e) {
        continue;
      }
      
      let changed = false;
      for (const { search, replace } of replacements) {
        if (search.test(content)) {
          content = content.replace(search, replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  }
}

processDirectory(__dirname);
