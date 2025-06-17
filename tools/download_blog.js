import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'blogs');
const BASE_URL = 'http://mysteriesofthearcana.com/index.php?action=blog&do=&sub=&start=';
const END_PAGE = 600;
const INCREMENT = 50;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function fetchCleanContent(url, isFirstPage = true) {
  try {
    const { data } = await axios.get(url);
    const $ = load(data);
    const $content = $('#content');

    // Remove pagination text, comment headers/footers, reply form
    $content.find('p.Comment_info[align="right"]').remove();
    $content.find('td.Comment_info[align="right"]').remove();
    $content.find('form').remove();
    $content.find('p.Forum_title').remove();

    if (!isFirstPage) {
      $content.find('table.post').remove(); // Remove duplicated blog body
    }

    return $content.html()?.trim();
  } catch (err) {
    console.error(`Error fetching ${url}: ${err.message}`);
    return '';
  }
}

async function fetchPost(url) {
  const match = url.match(/\/blog\/(\d+)\//);
  if (!match) return;
  const id = match[1];
  const baseUrl = `http://mysteriesofthearcana.com/blog/?do=view&tid=${id}`;

  const firstPageUrl = `${baseUrl}&show=0`;
  let fullContent = await fetchCleanContent(firstPageUrl, true);

  if (!fullContent) {
    console.error(`No content found for ${url}`);
    return;
  }

  try {
    const { data } = await axios.get(firstPageUrl);
    const $ = load(data);
    const commentInfo = $('p.Comment_info[align="right"]').first().text();
    let totalPages = 1;

    const match = commentInfo.match(/(\d+)\s+comments/);
    if (match) {
      const totalComments = parseInt(match[1], 10);
      totalPages = Math.ceil(totalComments / 10);
    }

    for (let i = 1; i < totalPages; i++) {
      const nextUrl = `${baseUrl}&show=${i * 10}`;
      const nextContent = await fetchCleanContent(nextUrl, false);
      if (nextContent) {
        fullContent += `\n\n<!-- Page ${i + 1} Comments -->\n\n${nextContent}`;
      }
    }

    const filePath = path.join(OUTPUT_DIR, `${id}.txt`);
    fs.writeFileSync(filePath, fullContent);
    console.log(`Saved ${filePath}`);
  } catch (err) {
    console.error(`Error during pagination fetch for blog ${id}: ${err.message}`);
  }
}

async function gatherPosts() {
  const links = new Set();
  for (let start = 0; start <= END_PAGE; start += INCREMENT) {
    const pageURL = `${BASE_URL}${start}&view=archive&memid=0&orderby=j_id&sort=desc&searchfor=`;
    console.log(`Fetching index ${pageURL}`);
    try {
      const { data } = await axios.get(pageURL);
      const $ = load(data);
      $('a[href^="/blog/"]').each((_, el) => {
        const href = $(el).attr('href');
        const match = href.match(/\/blog\/(\d+)\//);
        if (match) {
          links.add(`http://mysteriesofthearcana.com${match[0]}`);
        }
      });
    } catch (err) {
      console.error(`Error fetching index ${pageURL}: ${err.message}`);
    }
  }

  for (const link of links) {
    await fetchPost(link);
  }
}

gatherPosts();
