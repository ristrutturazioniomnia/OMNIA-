(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollRevealItems = Array.from(document.querySelectorAll('.scroll-reveal'));
  const serviceCards = Array.from(document.querySelectorAll('.servizio-card'));

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (start, end, progress) => start + (end - start) * progress;

  let ticking = false;

  function setFinalRevealState(element) {
    element.classList.add('is-visible');
    element.style.setProperty('--reveal-progress', '1');
    element.style.setProperty('--reveal-opacity', '1');
    element.style.setProperty('--reveal-y', '0px');
    element.style.setProperty('--reveal-scale', '1');
    element.style.setProperty('--reveal-blur', '0px');
  }

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

  function getRevealIndex(element) {
    if (!element.parentElement) return 0;

    return Array.from(element.parentElement.children)
      .filter((child) => child.classList && child.classList.contains('scroll-reveal'))
      .indexOf(element);
  }

  function getRevealSettings(element) {
    const isHero = Boolean(element.closest('.hero'));
    const isMedia = element.classList.contains('scroll-reveal-media');
    const isTitle = element.classList.contains('scroll-reveal-title');
    const isCta = element.classList.contains('scroll-reveal-cta');
    const isSection = element.classList.contains('scroll-reveal-section');

    if (isHero) {
      return {
        yStart: 0,
        yEnd: -16,
        scaleStart: 1,
        scaleEnd: 0.994,
        blurStart: 0,
        blurEnd: 0,
        minOpacity: 0.92,
        staggerFactor: 0.01
      };
    }

    if (isMedia) {
      return {
        yStart: 30,
        yEnd: -8,
        scaleStart: 0.982,
        scaleEnd: 1,
        blurStart: 3,
        blurEnd: 0,
        minOpacity: 0,
        staggerFactor: 0.025
      };
    }

    if (isTitle) {
      return {
        yStart: 38,
        yEnd: 0,
        scaleStart: 0.99,
        scaleEnd: 1,
        blurStart: 4,
        blurEnd: 0,
        minOpacity: 0,
        staggerFactor: 0.025
      };
    }

    if (isCta) {
      return {
        yStart: 18,
        yEnd: 0,
        scaleStart: 0.996,
        scaleEnd: 1,
        blurStart: 1.5,
        blurEnd: 0,
        minOpacity: 0,
        staggerFactor: 0.018
      };
    }

    if (isSection) {
      return {
        yStart: 18,
        yEnd: 0,
        scaleStart: 0.996,
        scaleEnd: 1,
        blurStart: 1.5,
        blurEnd: 0,
        minOpacity: 0.12,
        staggerFactor: 0.015
      };
    }

    return {
      yStart: 28,
      yEnd: 0,
      scaleStart: 0.994,
      scaleEnd: 1,
      blurStart: 2.5,
      blurEnd: 0,
      minOpacity: 0,
      staggerFactor: 0.025
    };
  }

  function updateRevealElement(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const settings = getRevealSettings(element);
    const index = Math.max(getRevealIndex(element), 0);
    const stagger = Math.min(index * settings.staggerFactor, 0.12);

    const startPoint = viewportHeight * 0.96;
    const endPoint = viewportHeight * 0.28;
    const rawProgress = (startPoint - rect.top) / (startPoint - endPoint);
    const progress = clamp((rawProgress - stagger) / 0.92, 0, 1);

    const opacity = lerp(settings.minOpacity, 1, progress);
    const y = lerp(settings.yStart, settings.yEnd, progress);
    const scale = lerp(settings.scaleStart, settings.scaleEnd, progress);
    const blur = lerp(settings.blurStart, settings.blurEnd, progress);

    element.style.setProperty('--reveal-progress', progress.toFixed(3));
    element.style.setProperty('--reveal-opacity', opacity.toFixed(3));
    element.style.setProperty('--reveal-y', `${y.toFixed(2)}px`);
    element.style.setProperty('--reveal-scale', scale.toFixed(4));
    element.style.setProperty('--reveal-blur', `${blur.toFixed(2)}px`);

    element.classList.toggle('is-visible', progress > 0.02);
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

  function updateAll() {
    scrollRevealItems.forEach(updateRevealElement);

    serviceCards.forEach((card, index) => {
      updateServiceCard(card, index);
    });

    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateAll);
  }

  if (reduceMotion) {
    scrollRevealItems.forEach(setFinalRevealState);
    serviceCards.forEach(setFinalServiceState);
    root.classList.add('reveal-ready');
    return;
  }

  scrollRevealItems.forEach((element) => {
    const isHero = Boolean(element.closest('.hero'));

    element.style.setProperty('--reveal-progress', '1');
    element.style.setProperty('--reveal-opacity', isHero ? '0.92' : '1');
    element.style.setProperty('--reveal-y', '0px');
    element.style.setProperty('--reveal-scale', '1');
    element.style.setProperty('--reveal-blur', '0px');
  });

  serviceCards.forEach((card, index) => {
    const row = Math.floor(index / 2);
    const column = index % 2;

    card.style.setProperty('--service-index', index);
    card.style.setProperty('--service-row', row);
    card.style.setProperty('--service-column', column);
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
  });

  updateAll();
  root.classList.add('reveal-ready');

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate);
}());
