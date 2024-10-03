// UTF-8 Preprocessor
// Converts files from whatever encoding to UTF-8.
const fs = require("fs");
const path = require("path");
const jschardet = require("jschardet");
const iconv = require("iconv-lite");

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            processDirectory(filePath);
        } else if (filePath.endsWith(".md") || filePath.endsWith(".njk")) {
            // Read the file as binary data
            const binaryData = fs.readFileSync(filePath);

            // Detect encoding
            const detected = jschardet.detect(binaryData);

            if (detected.encoding !== "UTF-8" && detected.encoding !== "ascii") {
                // Convert to UTF-8 using detected encoding
                const fixedContent = iconv.decode(binaryData, detected.encoding);
                // Write back the UTF-8 content to the original file
                fs.writeFileSync(filePath, fixedContent, "utf8");
                console.log(`Converted ${filePath} to UTF-8.`);
            }
        }
    }
}

// Start from your content directory
processDirectory("./content");
