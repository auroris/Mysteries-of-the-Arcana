const swup = new Swup({
    animationSelector: false,
    timeout: 10000,
});

const scrollPositions = new Map();
let currentHistoryIndex = window.history.state?.index;

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

    if (visit.trigger.el?.closest("[data-preserve-scroll]")) {
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
});
