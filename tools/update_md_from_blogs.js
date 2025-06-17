import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';

const BLOG_DIR = './tools/blogs';
const POSTS_DIR = './content/posts';

function extractBody(html) {
  const $ = load(html);
  const body = $('body').html();
  return body ? body.trim() : '';
}

function updatePost(id, bodyHtml) {
  const mdPath = path.join(POSTS_DIR, `${id}.md`);
  if (!fs.existsSync(mdPath)) {
    console.log(`Missing markdown for ${id}`);
    return;
  }
  const content = fs.readFileSync(mdPath, 'utf8');
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!match) {
    console.log(`No frontmatter in ${mdPath}`);
    return;
  }
  const front = match[0];
  const newContent = `${front}\n${bodyHtml}\n`;
  fs.writeFileSync(mdPath, newContent, 'utf8');
  console.log(`Updated ${mdPath}`);
}

function main() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.txt'));
  for (const file of files) {
    const id = path.basename(file, '.txt');
    const html = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const body = extractBody(html);
    updatePost(id, body);
  }
}

main();
