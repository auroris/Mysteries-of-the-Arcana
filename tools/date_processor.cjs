const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Directory containing HTML files
const dirPath = './tools/MotAComicIndex';

// Array of XPath/CSS paths targeting the specific table (using cheerio for CSS selection)
const tableSelectors = [
  '#text_body > div:nth-child(1) > table:nth-child(8) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(3)',
  '#text_body > div:nth-child(1) > table:nth-child(10) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(3)'
];

// Function to read and parse HTML files
const parseHtmlFiles = async () => {
  try {
    // Read all files in the directory
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.html'));
    const results = [];

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const html = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(html);

      let table;
      for (const selector of tableSelectors) {
        table = $(selector);
        if (table.length) {
          break;
        }
      }

      if (!table.length) {
        console.log(`No table found in file: ${file}`);
        continue;
      }
      
      let fileResultsCount = 0;

      // Extract table rows (excluding the header row)
      table.find('tr').slice(1).each((_, row) => {
        const cells = $(row).find('td');

        // Skip rows where the first cell has a colspan attribute
        if ($(cells[0]).attr('colspan')) {
          return;
        }

        const rowData = {
          id: parseInt($(cells[0]).text().trim(), 10),
          filler: $(cells[1]).text().trim() === 'Y',
          chapter: $(cells[2]).text().trim(),
          title: $(cells[3]).html(),
          date: $(cells[4]).text().trim(),
          views: parseInt($(cells[5]).text().trim().replace(/,/g, ''), 10),
          action: $(cells[6]).html(),
        };
        results.push(rowData);
        fileResultsCount++;
      });
      
      console.log(`File: ${file}, Number of results: ${fileResultsCount}`);
    }

    // Update markdown files based on the results
    results.forEach(data => {
      const mdFilePath = `./content/comics/${data.id}.md`;
      if (fs.existsSync(mdFilePath)) {
        let mdContent = fs.readFileSync(mdFilePath, 'utf-8');

        // Update or add date field
        mdContent = mdContent.replace(/date: '.*?'/, `date: '${data.date}'`);

        // Add Chapter and Filler metadata if not present
        if (!/chapter: /.test(mdContent)) {
          mdContent = mdContent.replace(/---\s*$/, `chapter: '${data.chapter}'\n---`);
        } else {
          mdContent = mdContent.replace(/chapter: '.*?'/, `chapter: '${data.chapter}'`);
        }

        if (!/filler: /.test(mdContent)) {
          mdContent = mdContent.replace(/---\s*$/, `filler: ${data.filler}\n---`);
        } else {
          mdContent = mdContent.replace(/filler: .*/, `filler: ${data.filler}`);
        }

        // Write the updated content back to the markdown file
        fs.writeFileSync(mdFilePath, mdContent, 'utf-8');
        console.log(`Updated file: ${mdFilePath}`);
      } else {
        console.log(`Markdown file not found for ID: ${data.id}`);
      }
    });
  } catch (err) {
    console.error('Error reading HTML files:', err);
  }
};

// Run the parser
parseHtmlFiles();
