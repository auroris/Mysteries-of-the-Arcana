import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';
import * as parse5 from 'parse5';

const BLOG_DIR = './tools/blogs';

function cleanHtml(html) {
  const fixedHtml = parse5.serialize(parse5.parse(sanitizeWordHtml(html)));
  const $ = load(fixedHtml, { xmlMode: false });

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

  // Clean up and validate links
  $('a[href], img[src]').each((_, el) => {
    const attrib = el.tagName === 'img' ? 'src' : 'href';
    let val = $(el).attr(attrib);

    if (typeof val === 'string') {
      val = val.trim();

      // Rewrite legacy domain
      val = val.replace(/^http:\/\/mysteriesofthearcana\.com/, '/');

      // Validate URL
      try {
        // Absolute URL must be fully formed
        // Relative URLs are tested with a dummy base
        new URL(val, 'http://example.com');
        $(el).attr(attrib, val);
      } catch {
        // Fallback for invalid or garbage values
        if (attrib === 'href') {
          $(el).attr('href', '#');
        } else if (attrib === 'src') {
          $(el).removeAttr('src');
        }
      }
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

  $('*').each((_, el) => {
    const $el = $(el);
    $el.contents().each((_, node) => {
      if (node.type === 'text') {
        node.data = node.data
          .replace(/{{/g, '&#123;&#123;')
          .replace(/}}/g, '&#125;&#125;');
      }
    });
  });

  // Convert all id="..." to class="..."
  $('[id]').each((_, el) => {
    const $el = $(el);
    const idVal = $el.attr('id');
    $el.removeAttr('id');
    const existingClass = $el.attr('class');
    if (existingClass) {
      $el.attr('class', `${existingClass} ${idVal}`);
    } else {
      $el.attr('class', idVal);
    }
  });

  return $.html();
}

function sanitizeWordHtml(html) {
  return html
    // Remove only suspicious Word-style font-family attributes
    .replace(/font-family:"\s*[^"]+?""\s*[^"]+?""/gi, '')
    // Strip all mso- properties from inline style attributes
    .replace(/\s*mso-[^:]+:[^;"]+;?/gi, '')
    // Remove inline styles if they contain mso- or obviously broken values
    .replace(/style="[^"]*mso-[^"]*"/gi, '')
    // Remove all empty spans with styles
    .replace(/<span style="[^"]*">\s*<\/span>/gi, '');
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
