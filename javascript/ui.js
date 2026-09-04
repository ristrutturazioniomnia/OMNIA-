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

    if (isHero) {
      return {
        yStart: 0,
        yEnd: -14,
        scaleStart: 1,
        scaleEnd: 0.995,
        blurStart: 0,
        blurEnd: 0,
        minOpacity: 0.94,
        staggerFactor: 0
      };
    }

    if (isMedia) {
      return {
        yStart: 34,
        yEnd: -8,
        scaleStart: 0.982,
        scaleEnd: 1,
        blurStart: 3,
        blurEnd: 0,
        minOpacity: 0.04,
        staggerFactor: 0.025
      };
    }

    if (isTitle) {
      return {
        yStart: 42,
        yEnd: 0,
        scaleStart: 0.99,
        scaleEnd: 1,
        blurStart: 4,
        blurEnd: 0,
        minOpacity: 0.04,
        staggerFactor: 0.02
      };
    }

    return {
      yStart: 30,
      yEnd: 0,
      scaleStart: 0.994,
      scaleEnd: 1,
      blurStart: 2.5,
      blurEnd: 0,
      minOpacity: 0.04,
      staggerFactor: 0.025
    };
  }

  function updateRevealElement(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const settings = getRevealSettings(element);
    const index = Math.max(getRevealIndex(element), 0);
    const stagger = Math.min(index * settings.staggerFactor, 0.12);

    const startPoint = viewportHeight * 0.98;
    const endPoint = viewportHeight * 0.30;

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

  function setInitialState() {
    scrollRevealItems.forEach(setFinalRevealState);
    serviceCards.forEach(setFinalServiceState);
  }

  if (reduceMotion) {
    setInitialState();
    root.classList.add('reveal-ready');
    return;
  }

  setInitialState();
  updateAll();
  root.classList.add('reveal-ready');

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate);
}());

/* Menu mobile: apertura e chiusura del pannello sotto 820px.
   Fa quattro cose e nient'altro: toggle della classe + aria-expanded,
   chiusura al tap su una voce, chiusura con Esc, blocco dello scroll
   del body mentre il pannello e' aperto.
   Gli onclick inline dei due dropdown restano dove sono: qui non si
   toccano, e non c'e' conflitto perche' agiscono su <details> diversi. */
(function () {
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.site-nav-toggle');
  const panel = document.getElementById('site-nav-menu');

  if (!nav || !toggle || !panel) return;

  const cta = nav.querySelector('.site-nav-cta a:first-child');
  let scrollLocked = false;

  function lockScroll() {
    if (scrollLocked) return;
    document.body.style.overflow = 'hidden';
    scrollLocked = true;
  }

  function unlockScroll() {
    if (!scrollLocked) return;
    document.body.style.removeProperty('overflow');
    scrollLocked = false;
  }

  function open() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Chiudi il menu');
    lockScroll();
  }

  function close() {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Apri il menu');
    nav.querySelectorAll('.site-nav-dropdown[open]').forEach(function (d) {
      d.removeAttribute('open');
    });
    unlockScroll();
  }

  toggle.addEventListener('click', function () {
    if (nav.classList.contains('is-open')) close();
    else open();
  });

  panel.addEventListener('click', function (event) {
    if (event.target.closest('a')) close();
  });

  if (cta) {
    cta.addEventListener('click', close);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') close();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 820) close();
  });
}());


/* Pagine comune (/aree/*.html), configurazione B: selettore a foto dei
   servizi. Quattro card in fila, un solo pannello a schermo per volta.
   Ha sostituito l'indice sticky con IntersectionObserver, che con i blocchi
   non piu' in sequenza non aveva piu' scopo.
   Senza JS il CSS nasconde le card e i quattro pannelli restano visibili in
   sequenza, quindi qui si parte sempre chiudendo, mai aprendo. */
(function () {
  const selettore = document.querySelector('.comune-b .comune-selettore');

  if (!selettore) return;

  const scelte = Array.from(selettore.querySelectorAll('[role="tab"]'));
  const pannelli = scelte.map(function (scelta) {
    return document.getElementById(scelta.getAttribute('aria-controls'));
  });

  if (!scelte.length || !pannelli.every(Boolean)) return;

  function mostra(idx) {
    scelte.forEach(function (scelta, i) {
      const attiva = i === idx;

      scelta.setAttribute('aria-selected', attiva ? 'true' : 'false');
      scelta.setAttribute('tabindex', attiva ? '0' : '-1');
      pannelli[i].hidden = !attiva;
    });
  }

  scelte.forEach(function (scelta, i) {
    scelta.addEventListener('click', function () {
      mostra(i);
    });

    scelta.addEventListener('keydown', function (event) {
      let next = -1;

      if (event.key === 'ArrowRight') next = (i + 1) % scelte.length;
      else if (event.key === 'ArrowLeft') next = (i - 1 + scelte.length) % scelte.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = scelte.length - 1;

      if (next < 0) return;

      event.preventDefault();
      mostra(next);
      scelte[next].focus();
    });
  });

  mostra(0);
}());

/* Pagine comune (/aree/*.html), configurazione C: tab dei servizi e
   accordion delle FAQ. Senza JS il markup resta leggibile: il CSS
   nasconde le linguette sotto .no-js e tutti i pannelli restano visibili
   in sequenza, quindi qui si parte sempre chiudendo, mai aprendo. */
(function () {
  const tablist = document.querySelector('.comune-c .comune-tablist');

  if (tablist) {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    });

    if (tabs.length && panels.every(Boolean)) {
      const select = function (idx) {
        tabs.forEach(function (tab, i) {
          const on = i === idx;
          tab.setAttribute('aria-selected', on ? 'true' : 'false');
          tab.setAttribute('tabindex', on ? '0' : '-1');
          panels[i].hidden = !on;
        });
      };

      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () {
          select(i);
        });

        tab.addEventListener('keydown', function (event) {
          let next = -1;

          if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
          else if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = tabs.length - 1;

          if (next < 0) return;

          event.preventDefault();
          select(next);
          tabs[next].focus();
        });
      });

      select(0);
    }
  }

  const toggles = Array.from(document.querySelectorAll('.comune-c .comune-faq-toggle'));

  toggles.forEach(function (toggle, i) {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));

    if (!panel) return;

    const open = i === 0;

    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;

    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';

      toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      panel.hidden = isOpen;
    });
  });
}());

/* Pagine comune (/aree/*.html), configurazioni A e B: risposte delle FAQ
   chiuse a 2,5 righe, con un pulsante che le apre. Diverso dall'accordion
   di C: la domanda resta ferma e sempre visibile, si apre solo il resto
   della risposta.
   Il CSS parte con tutto aperto e senza pulsante; qui si aggiunge
   .has-more solo dove la risposta chiusa sborda davvero, misurando contro
   l'altezza che da' il CSS. max-height: none non si anima: per la durata
   della transizione si passa dal valore in px, e lo si rilascia al
   transitionend cosi' l'altezza resta fluida. */
(function () {
  const items = Array.from(document.querySelectorAll('.comune-a .comune-faq-item, .comune-b .comune-faq-item'));

  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach(function (item) {
    const answer = item.querySelector('.comune-faq-answer');
    const more = item.querySelector('.comune-faq-more');

    if (!answer || !more) return;

    item.classList.add('has-more');

    if (answer.scrollHeight <= answer.clientHeight) {
      item.classList.remove('has-more');
    }
  });

  document.addEventListener('click', function (event) {
    const more = event.target.closest('.comune-faq-more');

    if (!more) return;

    const item = more.closest('.comune-faq-item');
    const answer = document.getElementById(more.getAttribute('aria-controls'));

    if (!item || !answer) return;

    const isOpen = more.getAttribute('aria-expanded') === 'true';

    answer.style.maxHeight = answer.scrollHeight + 'px';

    if (isOpen) {
      // La lettura forza il layout: i px diventano il punto di partenza
      // della transizione verso l'altezza chiusa.
      void answer.offsetHeight;
      item.classList.remove('is-open');
      answer.style.removeProperty('max-height');
    } else {
      item.classList.add('is-open');
      if (reduceMotion) answer.style.removeProperty('max-height');
    }

    more.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    more.setAttribute('aria-label', isOpen ? 'Leggi tutta la risposta' : 'Riduci la risposta');
  });

  document.addEventListener('transitionend', function (event) {
    const answer = event.target;

    if (event.propertyName !== 'max-height') return;
    if (!answer.classList || !answer.classList.contains('comune-faq-answer')) return;
    if (!answer.closest('.is-open')) return;

    answer.style.removeProperty('max-height');
  });
}());