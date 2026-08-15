import path from "path";
import posthtml from "posthtml";
import posthtmlUrls from "posthtml-urls";

function eleventyPluginRelativeUrls({ assumeIndexHtml } = {}) {
  return {
    name: "eleventy-plugin-relative-urls",
    async html(htmlContent, { outputPath }) {
      if (outputPath && outputPath.endsWith(".html")) {
        const currentFilePath = path.dirname(outputPath);
        const siteRoot = path.resolve(process.cwd(), "_site");
        const virtualCurrentPath = path.relative(siteRoot, currentFilePath);
        const makeRelative = (url) => {
          if (url.startsWith("/")) {
            // Resolve the target path based on the virtual path and the URL
            let targetPath = path.join(siteRoot, url);

            // If the URL ends with a slash, assume "index.html" if the option is enabled
            if (assumeIndexHtml && url.endsWith("/")) {
              targetPath = path.join(targetPath, "index.html");
            }

            // If the URL does not have a known file extension and does not end with a slash,
            // assume the user wants "index.html" in the corresponding directory
            const extname = path.extname(url);
            if (
              assumeIndexHtml &&
              !url.endsWith("/") &&
              ![".html", ".jpg", ".png", ".gif", ".xml", ".json", ".css", ".js"].includes(extname)
            ) {
              targetPath = path.join(targetPath + "/", "index.html");
            }

            let relativePath = path.relative(currentFilePath, targetPath).replace(/\\/g, "/");

            // If the relativePath is empty, it means it's the current folder
            if (!relativePath) {
              relativePath = "./";
            }

            return relativePath;
          }
          return url;
        };

        const processedHtml = await posthtml([
          posthtmlUrls({
            eachURL: makeRelative,
          }),
          posthtmlUrls({
            filter: {
              main: {
                "data-previous-comic-url": true,
                "data-next-comic-url": true,
              },
            },
            eachURL: makeRelative,
          }),
        ]).process(htmlContent);

        return processedHtml.html;
      }
      return htmlContent;
    },
  };
}

export default eleventyPluginRelativeUrls;
