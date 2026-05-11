document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

(function () {
  const revealItems = document.querySelectorAll(
    ".rank2-page .scroll-reveal, .rank2-contatti .scroll-reveal"
  );

  if (!revealItems.length) return;

  document.documentElement.classList.add("reveal-ready");

  revealItems.forEach((item, index) => {
    const isTitle = item.classList.contains("scroll-reveal-title");
    const isMedia = item.classList.contains("scroll-reveal-media");

    item.style.setProperty("--reveal-opacity", "0");
    item.style.setProperty("--reveal-y", isTitle ? "34px" : "46px");
    item.style.setProperty("--reveal-scale", isMedia ? "0.965" : "1");
    item.style.setProperty("--reveal-blur", isMedia ? "8px" : "4px");
    item.style.transitionDelay = `${Math.min(index * 35, 210)}ms`;
  });

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const item = entry.target;

        item.style.setProperty("--reveal-opacity", "1");
        item.style.setProperty("--reveal-y", "0px");
        item.style.setProperty("--reveal-scale", "1");
        item.style.setProperty("--reveal-blur", "0px");

        revealObserver.unobserve(item);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach(item => revealObserver.observe(item));
})();

(function () {
  const clickableItems = document.querySelectorAll(
    ".rank2-page a, .rank2-faq summary, .rank2-rank3__item"
  );

  clickableItems.forEach(item => {
    item.classList.add("rank2-click-effect");

    item.addEventListener("pointerdown", event => {
      const rect = item.getBoundingClientRect();

      item.style.setProperty("--click-x", `${event.clientX - rect.left}px`);
      item.style.setProperty("--click-y", `${event.clientY - rect.top}px`);

      item.classList.remove("is-clicking");
      void item.offsetWidth;
      item.classList.add("is-clicking");
    });

    item.addEventListener("animationend", () => {
      item.classList.remove("is-clicking");
    });
  });
})();

(function () {
  const rank3Items = document.querySelectorAll(".rank2-rank3__item");

  rank3Items.forEach(item => {
    const link = item.querySelector("a");

    if (!link) return;

    item.addEventListener("click", event => {
      const clickedLink = event.target.closest("a");

      if (clickedLink) return;

      window.location.href = link.href;
    });
  });
})();
