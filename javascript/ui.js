(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = Array.from(document.querySelectorAll('.reveal-item'));
  const serviceCards = Array.from(document.querySelectorAll('.servizio-card'));

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (start, end, progress) => start + (end - start) * progress;

  let ticking = false;

  function setFinalServiceState(card) {
    card.classList.add('is-visible', 'image-visible', 'panel-visible', 'content-visible');

    card.style.setProperty('--service-progress', '1');
    card.style.setProperty('--image-progress', '1');
    card.style.setProperty('--panel-progress', '1');
    card.style.setProperty('--content-progress', '1');
    card.style.setProperty('--card-y', '0px');
    card.style.setProperty('--image-y', '0px');
    card.style.setProperty('--image-scale', '1');
    card.style.setProperty('--panel-y', '0px');
    card.style.setProperty('--panel-opacity', '1');
    card.style.setProperty('--content-y', '0px');
    card.style.setProperty('--content-opacity', '1');
  }

  function updateServiceCard(card, index) {
    const rect = card.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    const row = Math.floor(index / 2);
    const column = index % 2;

    const stagger = row * 0.075 + column * 0.035;

    const startPoint = viewportHeight * 0.98;
    const endPoint = viewportHeight * 0.34;

    const rawProgress = (startPoint - rect.top) / (startPoint - endPoint);
    const serviceProgress = clamp((rawProgress - stagger) / 0.92, 0, 1);

    const imageProgress = clamp(serviceProgress / 0.52, 0, 1);
    const panelProgress = clamp((serviceProgress - 0.20) / 0.52, 0, 1);
    const contentProgress = clamp((serviceProgress - 0.38) / 0.48, 0, 1);

    const cardCenter = rect.top + rect.height / 2;
    const parallaxProgress = clamp((viewportHeight * 0.5 - cardCenter) / viewportHeight, -1, 1);

    const cardY = lerp(84, 0, serviceProgress);
    const imageY = lerp(28, -6, imageProgress) + parallaxProgress * -10;
    const imageScale = lerp(1.08, 1.015, imageProgress);
    const panelY = lerp(54, 0, panelProgress);
    const panelOpacity = clamp(panelProgress * 1.15, 0, 1);
    const contentY = lerp(22, 0, contentProgress);
    const contentOpacity = clamp(contentProgress * 1.15, 0, 1);

    card.style.setProperty('--service-progress', serviceProgress.toFixed(3));
    card.style.setProperty('--image-progress', imageProgress.toFixed(3));
    card.style.setProperty('--panel-progress', panelProgress.toFixed(3));
    card.style.setProperty('--content-progress', contentProgress.toFixed(3));
    card.style.setProperty('--card-y', `${cardY.toFixed(2)}px`);
    card.style.setProperty('--image-y', `${imageY.toFixed(2)}px`);
    card.style.setProperty('--image-scale', imageScale.toFixed(3));
    card.style.setProperty('--panel-y', `${panelY.toFixed(2)}px`);
    card.style.setProperty('--panel-opacity', panelOpacity.toFixed(3));
    card.style.setProperty('--content-y', `${contentY.toFixed(2)}px`);
    card.style.setProperty('--content-opacity', contentOpacity.toFixed(3));

    card.classList.toggle('is-visible', serviceProgress > 0.03);
    card.classList.toggle('image-visible', imageProgress > 0.08);
    card.classList.toggle('panel-visible', panelProgress > 0.08);
    card.classList.toggle('content-visible', contentProgress > 0.08);
  }

  function updateServices() {
    serviceCards.forEach((card, index) => {
      updateServiceCard(card, index);
    });

    ticking = false;
  }

  function requestServiceUpdate() {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(updateServices);
  }

  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    serviceCards.forEach(setFinalServiceState);
    return;
  }

  if ('IntersectionObserver' in window) {
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

    revealItems.forEach((item) => {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  serviceCards.forEach((card, index) => {
    const row = Math.floor(index / 2);
    const column = index % 2;

    card.style.setProperty('--service-index', index);
    card.style.setProperty('--service-row', row);
    card.style.setProperty('--service-column', column);

    card.style.setProperty('--service-progress', '0');
    card.style.setProperty('--image-progress', '0');
    card.style.setProperty('--panel-progress', '0');
    card.style.setProperty('--content-progress', '0');
    card.style.setProperty('--card-y', '84px');
    card.style.setProperty('--image-y', '28px');
    card.style.setProperty('--image-scale', '1.08');
    card.style.setProperty('--panel-y', '54px');
    card.style.setProperty('--panel-opacity', '0');
    card.style.setProperty('--content-y', '22px');
    card.style.setProperty('--content-opacity', '0');
  });

  window.addEventListener('scroll', requestServiceUpdate, { passive: true });
  window.addEventListener('resize', requestServiceUpdate);

  requestServiceUpdate();
}());
