const fs = require('fs');

const content = fs.readFileSync('public/assets/aistudio/Redz_Offers_aa4a7e96', 'utf8');

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

const rows = parseCSV(content);
console.log('Total rows:', rows.length);
rows.forEach((r, idx) => {
  console.log(`[${idx}] lang: "${r[0]}" | company: "${r[1]}" | loc: "${r[2]}" | title/desc: "${(r[3]||'').split('\n')[0].substring(0, 50)}" | material: ${Boolean(r[4])} | confirmMsg: ${Boolean(r[5])} | interviewDays: "${(r[6]||'').replace(/\n/g, ' ')}"`);
});
