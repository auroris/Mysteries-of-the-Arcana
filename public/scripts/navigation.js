import Swup from "swup";
import SwupPreloadPlugin from "@swup/preload-plugin";

const swup = new Swup({
    animationSelector: false,
    plugins: [new SwupPreloadPlugin({
        preloadHoveredLinks: true,
        preloadInitialPage: false,
    })],
    timeout: 10000,
});

const scrollPositions = new Map();
const requestedComicImages = new Set();
let currentHistoryIndex = window.history.state?.index;

const getComicImageUrl = (root, pageUrl) => {
    const imageSource = root.querySelector("article.comic source[type='image/avif']")?.getAttribute("srcset");
    return imageSource ? new URL(imageSource, pageUrl).href : null;
};

const preloadComicImage = (imageUrl) => {
    if (requestedComicImages.has(imageUrl)) {
        return;
    }

    requestedComicImages.add(imageUrl);

    fetch(imageUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Unable to preload comic image: ${response.status}`);
            }

            return response.blob();
        })
        .catch(() => {
            // Preloading is an optimization; normal image loading can retry later.
        });
};

swup.hooks.on("page:preload", (_visit, { page }) => {
    if (!page) {
        return;
    }

    const targetDocument = new DOMParser().parseFromString(page.html, "text/html");
    const targetPageUrl = new URL(page.url, document.baseURI);
    const imageUrl = getComicImageUrl(targetDocument, targetPageUrl);

    if (imageUrl) {
        preloadComicImage(imageUrl);
    }
});

const rememberCurrentComicImage = () => {
    const imageUrl = getComicImageUrl(document, document.baseURI);

    if (imageUrl) {
        requestedComicImages.add(imageUrl);
    }
};

const rememberScrollPosition = () => {
    if (currentHistoryIndex === undefined) {
        return;
    }

    scrollPositions.set(currentHistoryIndex, {
        left: window.scrollX,
        top: window.scrollY,
    });
};

window.history.scrollRestoration = "manual";
rememberScrollPosition();
window.addEventListener("scroll", rememberScrollPosition, { passive: true });

swup.hooks.on("visit:start", (visit) => {
    rememberScrollPosition();

    const trigger = visit.trigger.el;

    if (trigger?.closest("[data-preserve-scroll]")) {
        visit.scroll.reset = false;
    }
});

swup.hooks.on("history:popstate", (visit, { event }) => {
    rememberScrollPosition();
    currentHistoryIndex = event.state?.index;
    visit.meta.scrollPosition = scrollPositions.get(currentHistoryIndex) ?? {
        left: 0,
        top: 0,
    };
});

swup.hooks.on("content:replace", (visit) => {
    if (!visit.history.popstate) {
        currentHistoryIndex = window.history.state?.index;
    }
});

swup.hooks.on("content:scroll", (visit) => {
    if (visit.meta.scrollPosition) {
        window.scrollTo(visit.meta.scrollPosition);
    }
});

swup.hooks.on("page:view", () => {
    rememberScrollPosition();
    rememberCurrentComicImage();
});

rememberCurrentComicImage();
