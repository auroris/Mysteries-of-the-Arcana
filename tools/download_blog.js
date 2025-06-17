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

async function fetchPost(url) {
  try {
    const { data } = await axios.get(url);
    const $ = load(data);
    const match = url.match(/\/blog\/(\d+)\//);
    if (!match) return;
    const id = match[1];
    const content = $('#content').html();
    if (!content) {
      console.error(`No content found at ${url}`);
      return;
    }
    const filePath = path.join(OUTPUT_DIR, `${id}.txt`);
    fs.writeFileSync(filePath, content.trim());
    console.log(`Saved ${filePath}`);
  } catch (err) {
    console.error(`Error fetching ${url}: ${err.message}`);
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

