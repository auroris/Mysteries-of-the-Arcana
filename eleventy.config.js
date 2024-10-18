import { existsSync, readdirSync, readFileSync } from "fs";
import sharp from "sharp";
import { join, resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { DateTime } from "luxon";
import pluginNavigation from "@11ty/eleventy-navigation";
import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import fs from 'fs/promises';
import eleventyPluginRelativeUrls from "./eleventy.plugin.relativeUrls.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
    // Drafts: Only include draft content if ELEVENTY_RUN_MODE is not "build"
    eleventyConfig.addPreprocessor("drafts", "*", (data) => {
        if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
            return false;
        }
    });

    eleventyConfig.addPassthroughCopy({ "./public/": "/" });

    // Add files to Eleventy watch target
    eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

    // Register official Eleventy plugins
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(HtmlBasePlugin);
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
    eleventyConfig.addPlugin(IdAttributePlugin);

    eleventyConfig.addPlugin(eleventyPluginRelativeUrls);
    eleventyConfig.addTransform("relativeUrlsTransform", async function (content, outputPath) {
        if (outputPath && outputPath.endsWith(".html")) {
            return await eleventyPluginRelativeUrls().html(content, { outputPath });
        }
        return content;
    });

    // Filters for template usage
    eleventyConfig.addFilter("strToDate", (str) => new Date(str));

    eleventyConfig.addFilter("getNewestCollectionItemDate", (collection, emptyFallbackDate) => {
        if (!collection || !collection.length) {
            return emptyFallbackDate || new Date();
        }
        return new Date(Math.max(...collection.map(item => item.date)));
    });

    eleventyConfig.addFilter("date", (dateObj, options = {}) => {
        const { format = "yyyy-MM-dd", zone = "system" } = options;

        // Format examples:
        // "readableDate": "dd LLLL yyyy" (e.g., 12 June 2023)
        // "htmlDateString": "yyyy-LL-dd" (e.g., 2023-06-12)
        // RFC3339 format: "yyyy-MM-dd'T'HH:mm:ss'Z'"
        // RFC822 format: "EEE, dd LLL yyyy HH:mm:ss Z" (e.g., Mon, 12 Jun 2023 12:34:56 +0000)

        if (format === "rfc3339") {
            // Convert to RFC3339 format (e.g., 2023-06-12T12:34:56Z)
            return dateObj.toISOString().split(".")[0] + "Z";
        }

        if (format === "rfc822") {
            // Convert to RFC822 format (e.g., Mon, 12 Jun 2023 12:34:56 +0000)
            return DateTime.fromJSDate(dateObj, { zone }).toFormat("EEE, dd LLL yyyy HH:mm:ss Z");
        }

        return DateTime.fromJSDate(dateObj, { zone }).toFormat(format || "dd LLLL yyyy");
    });

    eleventyConfig.addFilter("htmlEscape", (value) =>
        String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
    );

    eleventyConfig.addNunjucksAsyncShortcode("Image", async (src, alt, width = 650) => {
        const possibleExtensions = ["jpg", "png"];
        const outputDir = './_site/img';

        let resolvedSrc;
        let fileExtension;
        for (const ext of possibleExtensions) {
            const filePath = resolve(__dirname, "content", `${src}.${ext}`);
            if (existsSync(filePath)) {
                resolvedSrc = filePath;
                fileExtension = ext;
                break;
            }
        }

        if (!resolvedSrc) {
            throw new Error(`Image not found for ${src}`);
        }

        const baseFileName = basename(src);

        // Define the destination path inside the _site/img folder
        const outputFilePath = resolve(outputDir, `${baseFileName}.${fileExtension}`);

        // Copy the file to the _site/img folder
        await fs.copyFile(resolvedSrc, outputFilePath);

        // Return the <img> tag with the correct reference
        return `<img src="/img/${baseFileName}.${fileExtension}" width="${width}" alt="${alt}">`;
    });

    eleventyConfig.addCollection("comics", (collectionApi) =>
        collectionApi.getFilteredByTag("comics").sort((a, b) => {
            const numA = Number(a.fileSlug);
            const numB = Number(b.fileSlug);
            return numA - numB;
        })
    );

  eleventyConfig.addFilter("filterPostsByDate", (posts, currentComicDate, nextComicDate) => {
    // Convert dates to Luxon DateTime objects
    const currentDate = DateTime.fromISO(currentComicDate);
    const nextDate = nextComicDate ? DateTime.fromISO(nextComicDate) : null;

    // Filter the posts by comparing their dates
    return posts.filter(post => {
      const postDate = DateTime.fromISO(post.data.date);

      // Return true if the post date falls within the required range
      return postDate >= currentDate && (!nextDate || postDate < nextDate);
    });
  });
};

export const config = {
    templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
        input: "content",
        includes: "../_includes",
        data: "../_data",
        output: "_site"
    },
    pathPrefix: "/",
};