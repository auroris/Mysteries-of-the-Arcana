# Mysteries of the Arcana

"Mysteries of the Arcana" is a fantasy webcomic that follows a diverse cast of characters journeying through a multiverse inspired by tarot cards. This project blends magic, adventure, and personal growth in a complex and evolving narrative.

## Project Structure

- **_data**: Stores site metadata.
- **_includes**: Contains site templates for various elements.
- **content**: Holds all content files.
  - **content/comics**: Contains individual comic pages. Each page is a `.png` file paired with metadata in a `.md` file. Files should be named numerically (e.g., `818.png` and `818.md`).
  - **content/posts**: Stores blog posts related to specific comic pages by date.
- **public**: Houses the site theme and other static files.

## Example File Structure

### Comic Page Metadata (e.g., `818.md`)
```yaml
---
title: 'Mysteries of the Arcana - Danica Hyde'
alt: 'Mysteries of the Arcana'
date: '2024-11-13'
author: 'Keira'
artist: 'Keira'
---
```

### Blog Post (e.g., `793.md`)
```yaml
---
title: 'Archive Site'
date: '2024-11-13'
author: 'Keira'
---
<p>Information about the archive and new comic site.</p>
```

## Installation

Ensure you have **Node.js** version 20 or higher installed.

1. Clone this repository.
2. Run `npm install` to install dependencies.

## Commands

The project uses a set of npm scripts to build, test, and serve the site:

- **`npm run build`**: Builds the site for local viewing and runs verification tools.
- **`npm run start`**: Starts the 11ty web server for development.
- **`npm run build:production`**: Builds and minifies the website for deployment to a root domain (e.g., `mysteriesofthearcana.pages.dev`) with cleaner URLs (e.g., `/comics/818`).
- **`npm run build:production2`**: Builds and minifies the website for deployment to a subdirectory, using relative URLs (e.g., `/subdir/comics/818`).
- **`npm run build:dev`**: Builds the site with filesystem-friendly links (e.g., `./comics/818/index.html`).

### Additional Scripts

- **`prebuild`**: Preprocesses content encoding for consistency.
- **`lint:html`**: Checks HTML for syntax issues.
- **`build:css`**: Builds CSS files.
- **`lint:css`**: Lints and fixes CSS.
- **`debug`** and **`debugstart`**: Run the site with debugging output.

## Dependencies

This project uses the following key packages:

- **@11ty/eleventy**: Static site generator.
- **postcss** and **autoprefixer**: For processing and optimizing CSS.
- **htmlhint** and **stylelint**: For linting HTML and CSS.
- **html-minifier-terser**: For minifying HTML output.

For a complete list of dependencies, see `package.json`.

## License

This project is licensed under the [Mysteries of the Arcana Archival Project License](LICENSE.md).