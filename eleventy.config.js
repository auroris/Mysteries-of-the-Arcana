import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { DateTime } from "luxon";
import { existsSync } from "fs";
import { join } from "path";
import sharp from 'sharp';
import Image from "@11ty/eleventy-img";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
    // Drafts: Only include draft content if ELEVENTY_RUN_MODE is not "build"
    eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
        if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
            return false;
        }
    });

    eleventyConfig.addPassthroughCopy({"./public/": "/"})

    // Add files to Eleventy watch target
    // Watch content images for changes to trigger re-build
    eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

    // Per-page bundles (CSS and JS) to optimize output
    // Adds the {% css %} paired shortcode for bundling CSS files
    eleventyConfig.addBundle("css", {
        toFileDirectory: "dist",
    });
    // Adds the {% js %} paired shortcode for bundling JS files
    eleventyConfig.addBundle("js", {
        toFileDirectory: "dist",
    });

    // Register official Eleventy plugins
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(HtmlBasePlugin);
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

    // Filters for template usage
    // Converts a string to a JavaScript Date object
    eleventyConfig.addFilter("strToDate", (str) => {
        return new Date(str);
    });

    // Converts a JavaScript Date object to a readable date string
    // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
        return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
    });

    // Converts an ISO date string to a formatted readable date
    eleventyConfig.addNunjucksFilter("readableDate", function(dateString, format = "MMMM d, yyyy") {
        const date = DateTime.fromISO(dateString, { zone: "utc" });
        return date.toFormat(format);
    });

    // Converts a JavaScript Date object to an HTML-compatible date string (yyyy-MM-dd)
    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
    });

    // Gets the newest date from a collection of items
    eleventyConfig.addFilter("getNewestCollectionItemDate", (collection, emptyFallbackDate) => {
        if (!collection || !collection.length) {
            return emptyFallbackDate || new Date();
        }
        return new Date(Math.max(...collection.map(item => item.date)));
    });

    // Converts a JavaScript Date object to an RFC 3339 formatted string without milliseconds
    eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
        let s = dateObj.toISOString();
        let split = s.split(".");
        split.pop();
        return split.join("") + "Z";
    });

    // Escapes HTML special characters in a string
    eleventyConfig.addFilter("htmlEscape", function(value) {
        return String(value).replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")
                          .replace(/"/g, "&quot;")
                          .replace(/'/g, "&#39;");
    });

    eleventyConfig.addNunjucksAsyncShortcode("ComicImage", async (src, alt, width = 650, formats = ["jpeg"]) => {
        const baseDir = join(process.cwd(), "content", "comics");
        const possibleExtensions = ["jpg", "png"];

        for (const ext of possibleExtensions) {
            const filePath = join(baseDir, `${src}.${ext}`);
            if (existsSync(filePath)) {
                src = `comics/${src}.${ext}`;
                break;
            }
        }

        // Resolve the full filesystem path for the source image
        let fullSrc = path.resolve(__dirname, 'content', src);
        const outputDir = path.resolve(__dirname, "_site/img");

        // Get the original metadata to calculate the height ratio
        const { width: originalWidth, height: originalHeight } = await sharp(fullSrc).metadata();
        const targetWidth = width;
        const targetHeight = Math.round((originalHeight / originalWidth) * targetWidth);

        // Process the image using the full filesystem path and enforce resizing
        let metadata = await Image(fullSrc, {
            widths: [width],  // Ensuring the width is set to the target width
            formats: ["jpeg"],
            urlPath: "/img/",       // Public URL path for images
            outputDir: outputDir   // Output directory for processed images
        });

        // Return HTML
        let data = metadata.jpeg[metadata.jpeg.length - 1];
        return `<img src="${data.url}" width="${targetWidth}" height="${targetHeight}" alt="${alt}">`;
    });


    // Adds ID attributes to headings in generated content
    eleventyConfig.addPlugin(IdAttributePlugin, {
        // Customize selector for heading elements if needed
        // selector: "h1,h2,h3,h4,h5,h6", // default
    });

    // Collection to gather all comic posts and sort them by fileSlug
    eleventyConfig.addCollection("comics", function(collectionApi) {
        const comics = collectionApi.getFilteredByTag("comics").sort((a, b) => {
            return a.fileSlug - b.fileSlug;
        });

        // Debugging output for comics collection
        //console.log("Comics Collection:", comics.map(item => item.inputPath));

        return comics;
    });
};

export const config = {
    // Specify which file types Eleventy will process
    templateFormats: [
        "md",
        "njk",
        "html",
        "liquid",
        "11ty.js",
    ],

    // Set the default template engine for Markdown files
    markdownTemplateEngine: "njk",

    // Set the default template engine for HTML files
    htmlTemplateEngine: "njk",

    // Directory structure settings
    dir: {
        input: "content",          // Input directory (default: ".")
        includes: "../_includes",  // Includes directory (relative to input)
        data: "../_data",          // Data directory (relative to input)
        output: "_site"            // Output directory
    },

    // Path prefix for deployment to a subdirectory
    // Works in conjunction with the HTML <base> plugin to adjust URLs
    pathPrefix: "/",
};