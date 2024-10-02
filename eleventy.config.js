const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const inspect = require("util").inspect;

module.exports = function (eleventyConfig) {
    // Copy the contents of the `public` folder to the output folder
    // For example, `./public/css/` ends up in `_site/css/`
    eleventyConfig.addPassthroughCopy({
        "./public/": "/"
    });

    // Run Eleventy when these files change:
    // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

    // Watch content images for the image pipeline.
    eleventyConfig.addWatchTarget("content/**/*.{jpg,jpeg,png,gif}");

    // App plugins
    //eleventyConfig.addPlugin(require("./eleventy.config.drafts.js"));
    eleventyConfig.addPlugin(require("./eleventy.config.images.js"));

    // Official plugins
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

    // Filters
    // Filter for converting a javascript date string to a javascript date object
    eleventyConfig.addFilter("strToDate", (str) => {
        return new Date(str);
    });

    eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
        // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
        return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
    });

    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
    });

    // Filter to escape html strings
    eleventyConfig.addFilter("htmlEscape", function(value) {
        return String(value).replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")
                          .replace(/"/g, "&quot;")
                          .replace(/'/g, "&#39;");
    });

    // Collection of posts sorted by date descending
    eleventyConfig.addCollection("sortedPosts", function (collectionApi) {
        return collectionApi.getFilteredByTag("posts").sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    });

    // Filter for printing debug information about a variable
    // {{ page | debug }}
    eleventyConfig.addFilter("debug", (content) => `<pre>${inspect(content)}</pre>`);

    // Shortcode for rendering a block of HTML in a template
    // {% renderlayoutblock 'some block name' %}
    eleventyConfig.addShortcode("renderlayoutblock", function(name) {
        return (this.page.layoutblock || {})[name] || '';
    });

    // Shortcode for passing a block of HTML to a template
    // {% layoutblock 'some block name' %}<h1>some html</h1>{% endlayoutblock %}
    eleventyConfig.addPairedShortcode("layoutblock", function(content, name) {
        if (!this.page.layoutblock) this.page.layoutblock = {};
        this.page.layoutblock[name] = content;
        return '';
    });

    // Customize Markdown library settings:
    eleventyConfig.amendLibrary("md", (mdLib) => {
        mdLib.use(markdownItAnchor, {
            level: [1, 2, 3, 4],
            slugify: eleventyConfig.getFilter("slugify"),
        });
    });

    // Features to make your build faster (when you need them)

    // If your passthrough copy gets heavy and cumbersome, add this line
    // to emulate the file copy on the dev server. Learn more:
    // https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

    // eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

    return {
        // Control which files Eleventy will process
        // e.g.: *.md, *.njk, *.html, *.liquid
        templateFormats: ["md", "njk", "html", "liquid"],

        // Pre-process *.md files with: (default: `liquid`)
        markdownTemplateEngine: "njk",

        // Pre-process *.html files with: (default: `liquid`)
        htmlTemplateEngine: "njk",

        // These are all optional:
        dir: {
            input: "content", // default: "."
            includes: "../_includes", // default: "_includes"
            data: "../_data", // default: "_data"
            output: "_site",
        },

        // -----------------------------------------------------------------
        // Optional items:
        // -----------------------------------------------------------------

        // If your site deploys to a subdirectory, change `pathPrefix`.
        // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

        // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
        // it will transform any absolute URLs in your HTML to include this
        // folder name and does **not** affect where things go in the output folder.
        pathPrefix: "/",
    };
};
