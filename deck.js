(() => {
  "use strict";

  const slides = [...document.querySelectorAll(".slide")];
  const viewport = document.getElementById("viewport");
  const currentSlide = document.getElementById("current-slide");
  const chapter = document.getElementById("chapter");
  const announcer = document.getElementById("slide-announcement");
  const progress = document.getElementById("deck-progress");
  const prev = document.getElementById("prev-slide");
  const next = document.getElementById("next-slide");
  const index = document.getElementById("deck-index");
  const indexList = document.getElementById("index-list");
  const openIndexButton = document.getElementById("open-index");
  const closeIndexButton = document.getElementById("close-index");
  const fullscreen = document.getElementById("fullscreen");
  const fullscreenLabel = document.getElementById("fullscreen-label");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const animate = window.gsap;
  const number = (value) => String(value).padStart(2, "0");
  const titles = ["Титульный экран", "ArtBuro28", "Просто мебель", "Возможности развития", "Планировка помещения",
    "Палитра материалов", "Калькулятор стоимости", "Конструктор интерьера", "Расширенное портфолио",
    "Управление контентом", "Интеграция с CRM", "Стоимость"];
  const progressMarks = [];
  const indexButtons = [];
  let active = -1;
  let transition;

  slides.forEach((slide, position) => {
    const mark = document.createElement("span");
    progress.append(mark);
    progressMarks.push(mark);

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.jump = slide.id;
    const order = document.createElement("span");
    order.className = "index-no";
    order.textContent = number(position + 1);
    const title = document.createElement("span");
    title.textContent = titles[position];
    const kind = document.createElement("span");
    kind.className = "index-kind";
    kind.textContent = slide.classList.contains("prototype") ? "Прототип" : slide.dataset.chapter;
    button.append(order, title, kind);
    indexList.append(button);
    indexButtons.push(button);
  });

  function show(position, { moveFocus = true, changeUrl = true } = {}) {
    if (position < 0 || position >= slides.length) return;
    if (position === active) {
      if (moveFocus) slides[position].querySelector("h1, h2").focus({ preventScroll: true });
      return;
    }

    const old = slides[active];
    const slide = slides[position];
    const direction = position > active ? 1 : -1;
    const entering = slide.querySelectorAll(".enter");
    transition?.kill();
    if (old) {
      if (animate) animate.set([old, ...old.querySelectorAll(".enter")], { clearProps: "clipPath,transform,opacity" });
      old.hidden = true;
    }
    slide.hidden = false;
    active = position;
    viewport.scrollTop = 0;
    document.body.classList.toggle("theme-dark", slide.dataset.theme === "dark");
    currentSlide.textContent = number(position + 1);
    chapter.textContent = slide.dataset.chapter;
    progressMarks.forEach((mark, i) => {
      mark.dataset.state = i < position ? "past" : i === position ? "current" : "future";
    });
    indexButtons.forEach((button, i) => {
      if (i === position) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    prev.disabled = position === 0;
    next.disabled = position === slides.length - 1;
    announcer.textContent = "Слайд " + (position + 1) + " из " + slides.length + ". " + titles[position];
    if (changeUrl) history.replaceState(null, "", "#" + slide.id);
    if (moveFocus) slide.querySelector("h1, h2").focus({ preventScroll: true });

    if (!animate || motion.matches) return;
    const clipped = direction > 0 ? "inset(0 0 11% 0)" : "inset(11% 0 0 0)";
    transition = animate.timeline()
      .fromTo(slide, { clipPath: clipped }, { clipPath: "inset(0 0 0 0)", duration: .57, ease: "power3.inOut", clearProps: "clipPath" }, 0)
      .fromTo(entering, { y: direction * 23, opacity: 0.32 }, {
        y: 0, opacity: 1, duration: .55, ease: "power3.out", stagger: .075, clearProps: "transform,opacity",
      }, 0.06);
  }

  function jump(id, options) {
    show(slides.findIndex((slide) => slide.id === id), options);
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-jump]");
    if (!trigger) return;
    if (trigger instanceof HTMLAnchorElement && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return;
    event.preventDefault();
    if (index.open) index.close();
    jump(trigger.dataset.jump);
  });

  prev.addEventListener("click", () => show(active - 1));
  next.addEventListener("click", () => show(active + 1));

  openIndexButton.addEventListener("click", () => {
    index.showModal();
    indexButtons[active].focus();
  });
  closeIndexButton.addEventListener("click", () => index.close());

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      announcer.textContent = "Полноэкранный режим недоступен в этом браузере.";
    }
  }

  fullscreen.disabled = !document.fullscreenEnabled;
  fullscreen.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", () => {
    const on = Boolean(document.fullscreenElement);
    fullscreen.setAttribute("aria-pressed", String(on));
    fullscreenLabel.textContent = on ? "Выйти из режима" : "Полный экран";
    fullscreen.title = on ? "Выйти из полноэкранного режима (F)" : "Полный экран (F)";
  });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || index.open ||
        event.target.closest?.("input, textarea, select, [contenteditable='true']")) return;
    if (event.code === "KeyF" && !event.repeat && document.fullscreenEnabled) {
      event.preventDefault();
      void toggleFullscreen();
      return;
    }
    const positions = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: slides.length - 1 };
    if (Object.hasOwn(positions, event.key)) {
      event.preventDefault();
      show(positions[event.key]);
    }
  });

  window.addEventListener("hashchange", () => jump(location.hash.slice(1), { changeUrl: false }));
  const first = slides.findIndex((slide) => "#" + slide.id === location.hash);
  show(first < 0 ? 0 : first, { moveFocus: false, changeUrl: false });

  const galleries = {
    art: [
      { file: "art-home", title: "Главная страница", alt: "Главная страница ArtBuro28. Заголовок на фотографии спальни." },
      { file: "art-projects", title: "Проекты", alt: "Раздел ArtBuro28 с фотографиями интерьеров и описанием проектов." },
      { file: "art-quiz", title: "Подбор дизайн-проекта", alt: "Экран выбора стиля в квизе ArtBuro28.", local: true },
    ],
    prosto: [
      { file: "prosto-home", title: "Главная страница", alt: "Главная сайта «Просто мебель» с заголовком «По вашим размерам»." },
      { file: "prosto-directions", title: "Направления мебели", alt: "Экран выбора направлений на сайте «Просто мебель»." },
      { file: "prosto-kitchens", title: "Конфигуратор кухни", alt: "Один из этапов конфигуратора кухни на сайте «Просто мебель»." },
    ],
  };

  for (const figure of document.querySelectorAll("[data-gallery]")) {
    const data = galleries[figure.dataset.gallery];
    const image = figure.querySelector("img");
    const label = figure.querySelector("[data-shot-title]");
    const origin = figure.querySelector("[data-shot-origin]");
    const buttons = [...figure.querySelectorAll("[data-shot]")];
    buttons.forEach((button, selected) => {
      button.addEventListener("click", () => {
        if (button.getAttribute("aria-pressed") === "true") return;
        const shot = data[selected];
        buttons.forEach((item, i) => item.setAttribute("aria-pressed", String(i === selected)));
        image.src = "assets/screens/" + shot.file + ".webp";
        image.alt = shot.alt;
        label.textContent = shot.title;
        origin.textContent = shot.local ? "Локальная версия" : "Опубликованная версия";
        if (animate && !motion.matches) {
          animate.killTweensOf(image);
          animate.fromTo(image, { clipPath: "inset(0 9% 0 0)", opacity: .75 }, {
            clipPath: "inset(0 0 0 0)", opacity: 1, duration: .42, ease: "power3.out", clearProps: "clipPath,opacity",
          });
        }
      });
    });
  }
})();
