import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';

const BLOG_DIR = './tools/blogs';

function cleanHtml(html) {
  const $ = load(html, { xmlMode: false });

  // Remove tr elements containing <td class="post_info">
  $('tr').has('td.post_info').remove();

  // Remove tr/table containing "Quick Reply"
  $('tr:contains("Quick Reply")').remove();

  // Remove divs that contain quote/reply buttons in comments
  $('div[align="right"]').each((_, el) => {
    const content = $(el).html();
    if (content?.includes('quote.gif') || content?.includes('arrowr.gif')) {
      $(el).remove();
    }
  });

  // Remove <span class="desc">
  $('span.desc').remove();

  // Clean up links
  $('a[href], img[src]').each((_, el) => {
    const attrib = el.tagName === 'img' ? 'src' : 'href';
    let val = $(el).attr(attrib);
    if (typeof val === 'string') {
      val = val.trim().replace(/^http:\/\/mysteriesofthearcana\.com/, '/');
      $(el).attr(attrib, val);
    }
  });

// Collapse consecutive <hr> into a single one
$('hr').each((_, el) => {
  const $el = $(el);
  let next = $el.next();
  while (next.is('hr')) {
    next.remove();
    next = $el.next();
  }
});

// Remove empty or whitespace-only <p> tags (including those with only <br> or &nbsp;)
$('p').each((_, el) => {
  const $el = $(el);
  const text = $el.text().replace(/\u00a0/g, '').trim();
  const onlyBr = $el.contents().toArray().every(child =>
    child.type === 'tag' && child.name === 'br'
  );
  if (!text && onlyBr) {
    $el.remove();
  }
});

$('hr + br').remove();

$('td').each((_, el) => {
  const first = $(el).children().first();
  if (first.is('hr')) {
    first.remove();
  }
});

$('div[align="right"]').each((_, el) => {
  const $el = $(el);
  const img = $el.find('img[src="//images/note.gif"]');
  if (img.length > 0) {
    const next = $el.next();
    $el.remove();
    if (next.is('hr')) {
      next.remove();
    }
  }
});

  return $.html();
}

function cleanAllFiles() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.txt'));
  for (const file of files) {
    const fullPath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const cleaned = cleanHtml(raw);
    fs.writeFileSync(fullPath, cleaned);
    console.log(`Cleaned: ${file}`);
  }
}

cleanAllFiles();
