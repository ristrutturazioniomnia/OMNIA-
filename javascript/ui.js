(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = Array.from(document.querySelectorAll('.reveal-item'));
  const serviceCards = Array.from(document.querySelectorAll('.servizio-card'));

  const visibleClasses = [
    'is-visible',
    'image-visible',
    'panel-visible',
    'content-visible'
  ];

  serviceCards.forEach((card, index) => {
    const row = Math.floor(index / 2);
    const column = index % 2;

    const serviceDelay = row * 320 + column * 140;
    const imageDelay = serviceDelay + 80;
    const panelDelay = serviceDelay + 300;
    const contentDelay = serviceDelay + 520;

    card.style.setProperty('--service-delay', `${serviceDelay}ms`);
    card.style.setProperty('--image-delay', `${imageDelay}ms`);
    card.style.setProperty('--panel-delay', `${panelDelay}ms`);
    card.style.setProperty('--content-delay', `${contentDelay}ms`);

    card.dataset.serviceDelay = serviceDelay;
    card.dataset.imageDelay = imageDelay;
    card.dataset.panelDelay = panelDelay;
    card.dataset.contentDelay = contentDelay;
  });

  function showServiceCard(card) {
    const serviceDelay = Number(card.dataset.serviceDelay) || 0;
    const imageDelay = Number(card.dataset.imageDelay) || serviceDelay + 80;
    const panelDelay = Number(card.dataset.panelDelay) || serviceDelay + 300;
    const contentDelay = Number(card.dataset.contentDelay) || serviceDelay + 520;

    window.setTimeout(() => {
      card.classList.add('is-visible');
    }, serviceDelay);

    window.setTimeout(() => {
      card.classList.add('image-visible');
    }, imageDelay);

    window.setTimeout(() => {
      card.classList.add('panel-visible');
    }, panelDelay);

    window.setTimeout(() => {
      card.classList.add('content-visible');
    }, contentDelay);
  }

  function showImmediately() {
    revealItems.forEach((item) => {
      item.classList.add('is-visible');
    });

    serviceCards.forEach((card) => {
      visibleClasses.forEach((className) => {
        card.classList.add(className);
      });
    });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    showImmediately();
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -8% 0px'
  });

  const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      showServiceCard(entry.target);
      serviceObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.26,
    rootMargin: '0px 0px -12% 0px'
  });

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });

  serviceCards.forEach((card) => {
    serviceObserver.observe(card);
  });
}());
