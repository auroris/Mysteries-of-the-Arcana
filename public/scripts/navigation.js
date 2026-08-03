const swup = new Swup({
    animationSelector: false,
    timeout: 10000,
});

swup.hooks.on("visit:start", (visit) => {
    if (visit.trigger.el?.closest("[data-preserve-scroll]")) {
        visit.scroll.reset = false;
    }
});
