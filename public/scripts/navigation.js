const swup = new Swup({
    animationSelector: false,
    timeout: 10000,
});

const scrollPositions = new Map();
let currentHistoryIndex = window.history.state?.index;
let comicPreloadDirection = "next";

const preloadAdjacentComic = () => {
    const comicPage = document.querySelector("#swup[data-next-comic-url], #swup[data-previous-comic-url]");
    const url = comicPreloadDirection === "previous"
        ? comicPage?.dataset.previousComicUrl
        : comicPage?.dataset.nextComicUrl;

    if (!url || swup.cache.has(url)) {
        return;
    }

    swup.fetchPage(url).catch(() => {
        // Preloading is an optimization; navigation can retry a failed request.
    });
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

    if (trigger?.closest(".navprev")) {
        comicPreloadDirection = "previous";
    } else if (trigger?.closest(".navnext, article.comic")) {
        comicPreloadDirection = "next";
    }

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
    preloadAdjacentComic();
});

preloadAdjacentComic();
