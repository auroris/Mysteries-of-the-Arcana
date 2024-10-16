import { existsSync, readdirSync, readFileSync } from "fs";
import sharp from "sharp";
import { join, resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { DateTime } from "luxon";
import pluginNavigation from "@11ty/eleventy-navigation";
import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
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

    eleventyConfig.addFilter("readableDate", (dateObj, format, zone) =>
        DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy")
    );

    eleventyConfig.addNunjucksFilter("readableDate", (dateString, format = "MMMM d, yyyy") =>
        DateTime.fromISO(dateString, { zone: "utc" }).toFormat(format)
    );

    eleventyConfig.addFilter("htmlDateString", (dateObj) =>
        DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd")
    );

    eleventyConfig.addFilter("getNewestCollectionItemDate", (collection, emptyFallbackDate) => {
        if (!collection || !collection.length) {
            return emptyFallbackDate || new Date();
        }
        return new Date(Math.max(...collection.map(item => item.date)));
    });

    eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
        let s = dateObj.toISOString();
        return s.split(".")[0] + "Z";
    });

    eleventyConfig.addFilter("date", (dateObj, format = "yyyy-MM-dd") => {
        return DateTime.fromJSDate(new Date(dateObj)).toFormat(format);
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
            const numA = parseInt(a.fileSlug, 10);
            const numB = parseInt(b.fileSlug, 10);
            return numA - numB;
        })
    );

    // Add a collection for grouping posts by author
    eleventyConfig.addCollection("groupedByAuthor", (collectionApi) => {
        let authors = {};

        // Group posts by author using an object
        collectionApi.getAll().forEach((item) => {
            if (item.data.author) {
                if (!authors[item.data.author]) {
                    authors[item.data.author] = [];
                }
                authors[item.data.author].push(item);
            }
        });

        // Convert the authors object to an array with sorted posts
        let authorArray = Object.keys(authors).map((authorName) => {
            return {
                name: authorName,
                posts: authors[authorName].sort((a, b) => {
                    const numA = Number(a.fileSlug);
                    const numB = Number(b.fileSlug);
                    return numA - numB;
                })
            };
        });

        return authorArray;
    });


    // Add a collection for grouping posts by artist
    eleventyConfig.addCollection("groupedByArtist", (collectionApi) => {
        let artists = {};

        // Group posts by author using an object
        collectionApi.getAll().forEach((item) => {
            if (item.data.artist) {
                if (!artists[item.data.artist]) {
                    artists[item.data.artist] = [];
                }
                artists[item.data.artist].push(item);
            }
        });

        // Convert the authors object to an array with sorted posts
        let artistArray = Object.keys(artists).map((artistName) => {
            return {
                name: artistName,
                posts: artists[artistName].sort((a, b) => {
                    const numA = Number(a.fileSlug);
                    const numB = Number(b.fileSlug);
                    return numA - numB;
                })
            };
        });

        return artistArray;
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