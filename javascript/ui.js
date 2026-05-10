(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = Array.from(document.querySelectorAll('.reveal-item'));
  const serviceCards = Array.from(document.querySelectorAll('.servizio-card'));

  serviceCards.forEach((card, index) => {
    const rowDelay = Math.floor(index / 2) * 170;
    const columnDelay = (index % 2) * 95;
    card.style.setProperty('--service-delay', `${rowDelay + columnDelay}ms`);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    serviceCards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.18,
    rootMargin: '0px 0px -8% 0px'
  });

  const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      serviceObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.22,
    rootMargin: '0px 0px -10% 0px'
  });

  revealItems.forEach((item) => revealObserver.observe(item));
  serviceCards.forEach((card) => serviceObserver.observe(card));
}());
