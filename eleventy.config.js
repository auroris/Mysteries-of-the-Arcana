import { existsSync } from "fs";
import sharp from "sharp";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { DateTime } from "luxon";
import Image from "@11ty/eleventy-img";
import pluginNavigation from "@11ty/eleventy-navigation";
import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

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

    // Per-page bundles (CSS and JS) to optimize output
    eleventyConfig.addBundle("css", { toFileDirectory: "dist" });
    eleventyConfig.addBundle("js", { toFileDirectory: "dist" });

    // Register official Eleventy plugins
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(HtmlBasePlugin);
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

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

    eleventyConfig.addFilter("htmlEscape", (value) =>
        String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
    );

    eleventyConfig.addNunjucksAsyncShortcode("Image", async (src, alt, width = 650, formats = ["jpeg"]) => {
        const possibleExtensions = ["jpg", "png"];

        for (const ext of possibleExtensions) {
            const filePath = resolve(__dirname, "content", `${src}.${ext}`);
            if (existsSync(filePath)) {
                src = resolve(__dirname, "content", `${src}.${ext}`);
                break;
            }
        }

        const fullSrc = src;
        const outputDir = resolve(__dirname, "_site/img");

        const { width: originalWidth, height: originalHeight } = await sharp(fullSrc).metadata();
        const targetHeight = Math.round((originalHeight / originalWidth) * width);

        const metadata = await Image(fullSrc, {
            widths: [width],
            formats: ["jpeg"],
            urlPath: "/img/",
            outputDir: outputDir
        });

        const data = metadata.jpeg[metadata.jpeg.length - 1];
        return `<img src="${data.url}" width="${width}" height="${targetHeight}" alt="${alt}">`;
    });

    eleventyConfig.addPlugin(IdAttributePlugin);

    eleventyConfig.addCollection("comics", (collectionApi) =>
        collectionApi.getFilteredByTag("comics").sort((a, b) => a.fileSlug - b.fileSlug)
    );
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