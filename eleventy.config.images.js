const path = require("path");
const fs = require("fs");
const eleventyImage = require("@11ty/eleventy-img");

module.exports = (eleventyConfig) => {
    function relativeToInputPath(inputPath, relativeFilePath) {
        let split = inputPath.split("/");
        split.pop();

        return path.resolve(split.join(path.sep), relativeFilePath);
    }

    function fileExists(filePath) {
        try {
            fs.accessSync(filePath, fs.constants.F_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Eleventy Image shortcode
    // https://www.11ty.dev/docs/plugins/image/
    // {% image "example.jpg", "This is an example", "300, 600, 1200", "(max-width: 600px) 100vw, 600px" %}
    // [{% image "/sketchbook/happy-faces01.jpg", "Happy Faces" %}](/sketchbook/happy-faces01.jpg)
    eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt = "", widths = "300", sizes = "300px") {
        //let formats = ["avif", "webp", "auto"];
        let formats = ["jpeg", "auto"];
        let file;

        if (src.startsWith("/")) {
            const contentFile = path.join(__dirname, "content", src);
            const publicFile = path.join(__dirname, "public", src);

            if (fileExists(contentFile)) {
                file = contentFile;
            } else if (fileExists(publicFile)) {
                file = publicFile;
            } else {
                throw new Error(`File ${src} not found in either content or public directory.`);
            }
        } else {
            file = relativeToInputPath(this.page.inputPath, src);
        }

        if (typeof widths === "string") {
            widths = widths.split(",").map((s) => s.trim());
        }

        let metadata = await eleventyImage(file, {
            widths: widths || ["auto"],
            formats,
            outputDir: path.join(eleventyConfig.dir.output, "img"),
        });

        let imageAttributes = {
            alt,
            sizes,
            loading: "lazy",
            decoding: "async",
        };

        return eleventyImage.generateHTML(metadata, imageAttributes);
    });
};