import { resolve, sep, join } from "path";
import { accessSync, constants } from "fs";
import eleventyImage from "@11ty/eleventy-img";
import { fileURLToPath } from "url";

// __dirname is not available in ESM, so we derive it from the current file's URL
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default (eleventyConfig) => {
  function relativeToInputPath(inputPath, relativeFilePath) {
    let split = inputPath.split("/");
    split.pop();
    return resolve(split.join(sep), relativeFilePath);
  }

  function fileExists(filePath) {
    try {
      accessSync(filePath, constants.F_OK);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Eleventy Image shortcode
  // https://www.11ty.dev/docs/plugins/image/
  eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt = "", widths = "300", sizes = "300px") {
    let formats = ["jpeg", "auto"];
    let file;

    if (src.startsWith("/")) {
      const contentFile = join(__dirname, "content", src);
      const publicFile = join(__dirname, "public", src);

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
      outputDir: join(eleventyConfig.dir.output, "img"),
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