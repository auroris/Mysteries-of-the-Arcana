import axios from 'axios';
const cheerioModule = await import('cheerio');
const cheerio = cheerioModule.default || cheerioModule;
import fs from 'fs';
import path from 'path';
import moment from 'moment';

// Set base URL and parameters for pagination
const baseURL = 'http://mysteriesofthearcana.com/index.php?action=blog&do=&sub=&start=';
const endPage = 600;
const increment = 50;
const eleventyPathPrefix = "/";

(async () => {
    try {
        const savePath = path.resolve(path.dirname(''), '../content/posts');

        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
        }

        // Function to clean up comment text by removing "Submitted" text and Forum Info span
        const cleanText = (commentHtml) => {
            let cleanedText = commentHtml;

            // Remove author info
            cleanedText = cleanedText.replace(/<div id="avatar">.*?<\/div>\s*/gi, '').trim();

            // Remove the span element containing "Forum Info"
            cleanedText = cleanedText.replace(/<span class="Forum_info">.*?<\/span>/gi, '');

            cleanedText = cleanedText.replace(/<span class="Comment_info">Guest post by .*?<\/span>/gi, '');

            // Remove "Submitted" text since it's stored in the date field
            cleanedText = cleanedText.replace(/Submitted.*/gi, '');

            // Remove errant BRs
            cleanedText = cleanedText.replace(/^\s*(?:<br\s*\/?\s*>)+|(?:<br\s*\/?\s*>)+\s*$/gi, '');

            // Replace smilies path
            cleanedText = cleanedText.replace(/http:\/\/mysteriesofthearcana\.com\/smilies\//g, `${eleventyPathPrefix}/smilies/`);

            return cleanedText.trim();
        };

        // Function to fetch a specific blog post and extract comments
        const fetchBlogPost = async (blogURL, metadata) => {
            try {
                console.log(`Fetching blog post at ${blogURL}`);
                const response = await axios.get(blogURL);
                const $ = cheerio.load(response.data);

                // Extract the main post content
                let postContentElement = $('.post_body');
                if (!postContentElement.length) {
                    console.error(`Main post content not found at ${blogURL}`);
                    return;
                }

                // Clean up the main post by removing the avatar section
                let postContentHtml = cleanText(postContentElement.html().trim());

                const mainAuthor = metadata.author;
                const mainDate = metadata.date;
                const blogTitle = metadata.title;

                // Create JSON object for the main post
                const postJson = {
                    title: blogTitle,
                    author: mainAuthor,
                    date: mainDate,
                    text: postContentHtml,
                    replies: []
                };

                // Extract comments/replies
                $('.Comment_table .Comment').each((_, commentElement) => {
                    const commentAuthor = $(commentElement).find('.Comment_title center').first().text().trim();

                    // Extract only the <p> tags from the comment to get the comment text
                    let commentTextHtml = '';
                    $(commentElement)
                        .find('td:nth-of-type(2) p')
                        .each((__, pElement) => {
                            commentTextHtml += $(pElement).html().trim();
                        });

                    // Clean up the comment text
                    commentTextHtml = cleanText(commentTextHtml);

                    const commentDateRaw = $(commentElement).find('.Comment_info').last().text().trim();

                    // Convert date format from "Submitted February 16, 2016 at 10:56AM" to "MM-DD-YYYY"
                    const commentDateMatch = commentDateRaw.match(/Submitted\s(\w+)\s(\d{1,2}),\s(\d{4})/);
                    let commentDate = null;
                    if (commentDateMatch) {
                        const month = commentDateMatch[1];
                        const day = commentDateMatch[2];
                        const year = commentDateMatch[3];
                        commentDate = moment(`${month} ${day}, ${year}`, "MMMM DD, YYYY").format("MM-DD-YYYY");
                    }

                    postJson.replies.push({
                        author: commentAuthor,
                        date: commentDate,
                        text: commentTextHtml
                    });
                });

                // Extract the blog post ID from the URL
                const blogIdMatch = blogURL.match(/\/blog\/(\d+)\//);
                if (!blogIdMatch) {
                    console.error(`Unable to extract blog ID from URL: ${blogURL}`);
                    return;
                }
                const blogId = blogIdMatch[1];

                // Write JSON to file
                const jsonFilePath = path.join(savePath, `${blogId}.json`);
                fs.writeFileSync(jsonFilePath, JSON.stringify(postJson, null, 2));
                console.log(`Saved post to ${jsonFilePath}`);

            } catch (error) {
                console.error(`Error fetching blog post at ${blogURL}: ${error.message}`);
            }
        };

        // Test with a single blog post
        /*fetchBlogPost("http://mysteriesofthearcana.com/blog/179/", {
            title: "RSS Feed",
            author: "JGray",
            date: "05-06-2010"
        });*/

        /* Uncomment to perform a full run when ready */
        (async () => {
            for (let start = 0; start <= endPage; start += increment) {
                try {
                    const url = `${baseURL}${start}&view=archive&memid=0&orderby=j_id&sort=desc&searchfor=`;
                    console.log(`Fetching page: ${url}`);

                    const response = await axios.get(url);
                    const $ = cheerio.load(response.data);

                    // Select the blog post table
                    const table = $('html > body > div:nth-of-type(1) > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div > div > table > tbody > tr:nth-of-type(2) > td > table:nth-of-type(2) > tbody > tr > td > table:nth-of-type(2)');

                    if (!table.length) {
                        console.log(`No blog table found on page: ${url}`);
                        continue;
                    }

                    // Iterate over each row, skipping header and separators
                    table.find('tbody > tr').each((_, element) => {
                        const cells = $(element).find('td');
                        if (cells.length === 0) {
                            return; // Skip rows without cells (like separators)
                        }

                        const titleLink = $(cells[0]).find('a');
                        const title = titleLink.text().trim();
                        const blogURL = titleLink.attr('href') ? `http://mysteriesofthearcana.com${titleLink.attr('href')}` : null;

                        const author = $(cells[1]).text().trim();
                        const date = $(cells[2]).text().trim();

                        if (blogURL) {
                            // Metadata for the main blog post
                            const metadata = {
                                title,
                                author,
                                date
                            };

                            // Call the function to fetch the full blog post
                            fetchBlogPost(blogURL, metadata);
                        }
                    });

                } catch (error) {
                    console.error(`Error fetching page at start=${start}: ${error.message}`);
                }
            }
        })();
    } catch (error) {
        console.error(`Error loading Eleventy configuration: ${error.message}`);
    }
})();
