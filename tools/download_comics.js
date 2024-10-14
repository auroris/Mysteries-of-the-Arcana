import axios from 'axios';
const cheerioModule = await import('cheerio');
const cheerio = cheerioModule.default || cheerioModule;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Set up ESM compatibility for path and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set the base URL, start/end pages, and download directory
const baseURL = 'http://mysteriesofthearcana.com/comics/';
const startPage = 1;
const endPage = 813;
const downloadDir = path.resolve(__dirname, '../content/comics');

(async () => {
  // Create the download directory if it does not exist
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
    try {
      // Construct paths for image and metadata
      const metadataPath = path.join(downloadDir, `${pageNum}.md`);

      // Skip page if metadata already exists
      if (fs.existsSync(metadataPath)) {
        console.log(`Page ${pageNum} already downloaded. Skipping...`);
        continue;
      }

      const url = `${baseURL}${pageNum}/`;
      console.log(`Fetching page: ${url}`);

      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Check for "Oops!" message indicating the page does not exist
      if ($('body').text().includes("You have selected an item which is not available at this time.")) {
        console.log(`Page ${pageNum} does not exist. Skipping...`);
        continue;
      }

      // Extract content between <!-- Main content here --> and <!-- End main content -->
      const content = $('body').html();
      const startIndex = content.indexOf('<!-- Main content here -->');
      const endIndex = content.indexOf('<!-- End main content -->');
      if (startIndex === -1 || endIndex === -1) {
        console.error(`Main content not found for page ${pageNum}`);
        continue;
      }

      const mainContent = content.substring(startIndex, endIndex);
      const $$ = cheerio.load(mainContent);

      // Extract the image
      const img = $$('img').first();
      if (!img.attr('src')) {
        console.error(`No image found for page ${pageNum}`);
        continue;
      }
      const imgUrl = img.attr('src');
      const imgExt = path.extname(imgUrl);
      const imgPath = path.join(downloadDir, `${pageNum}${imgExt}`);

      // Download the image
      const imgResponse = await axios({
        url: imgUrl,
        responseType: 'stream',
      });
      const writer = fs.createWriteStream(imgPath);
      imgResponse.data.pipe(writer);

      // Wait for image download to finish
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`Downloaded image: ${imgPath}`);

      // Extract title tag text
      const pageTitle = $('title').text().trim();

      // Extract alt text from the image, if available
      const imgAlt = img.attr('alt') ? img.attr('alt').trim() : `${pageTitle}`;

      // Artist based on http://mysteriesofthearcana.com/page/10/
      let artist = "Keira";

      if (pageNum >= 273 && pageNum <= 300) { artist = "Sarrah"; }
      if (pageNum >= 301 && pageNum <= 315) { artist = "Jessica"; }
      if (pageNum >= 319 && pageNum <= 406) { artist = "Gennifer"; }

      let author = "J Gray";
      if (pageNum >= 751) { author = "verias"; }

      // Create metadata file
      const metadataContent = `---
title: '${pageTitle}'
alt: '${imgAlt}'
date: '${new Date().toISOString().split('T')[0]}'
author: '${author}'
artist: '${artist}'
---`;

      fs.writeFileSync(metadataPath, metadataContent);
      console.log(`Generated metadata file: ${metadataPath}`);

    } catch (error) {
      console.error(`Error fetching page ${pageNum}: ${error.message}`);
    }
  }
})();
