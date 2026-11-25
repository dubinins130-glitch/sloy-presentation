(() => {
  "use strict";

  const get = (id) => document.getElementById(id);
  const format = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const setSelected = (container, attribute, value) => {
    for (const button of container.querySelectorAll("button[" + attribute + "]")) {
      button.setAttribute("aria-pressed", String(button.getAttribute(attribute) === value));
    }
  };

  function polygon(ctx, points, fill, stroke = "#454541", width = 1.25) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  function line(ctx, points, stroke = "#454541", width = 1) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function rect(ctx, x, y, w, h, fill, stroke = "#454541", width = 1) {
    polygon(ctx, [[x,y], [x+w,y], [x+w,y+h], [x,y+h]], fill, stroke, width);
  }

  function circle(ctx, x, y, radius, fill) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fill;
    ctx.strokeStyle = "#454541";
    ctx.lineWidth = 1.1;
    ctx.fill();
    ctx.stroke();
  }

  const layouts = {
    rooms: [
      { id: "kitchen", label: "Кухня", area: 13, rect: [116,79,224,151], pin: [255,167] },
      { id: "lounge", label: "Гостиная", area: 22, rect: [340,79,344,151], pin: [522,152] },
      { id: "bedroom", label: "Спальня", area: 14, rect: [116,230,260,166], pin: [278,333] },
      { id: "bathroom", label: "Ванная", area: 6, rect: [376,230,144,166], pin: [456,337] },
      { id: "entry", label: "Прихожая", area: 5, rect: [520,230,164,166], pin: [603,311] },
    ],
    open: [
      { id: "living-kitchen", label: "Кухня-гостиная", area: 35, rect: [116,79,568,151], pin: [365,178] },
      { id: "bedroom", label: "Спальня", area: 14, rect: [116,230,260,166], pin: [278,333] },
      { id: "bathroom", label: "Ванная", area: 6, rect: [376,230,144,166], pin: [456,337] },
      { id: "entry", label: "Прихожая", area: 5, rect: [520,230,164,166], pin: [603,311] },
    ],
  };

  const planCanvas = get("plan-canvas");
  const pins = get("plan-hotspots");
  const planCtx = planCanvas.getContext("2d");
  const planControls = get("plan");
  let layout = "rooms";
  let roomId = "kitchen";

  function drawPlan() {
    const ctx = planCtx;
    ctx.fillStyle = "#eaeae6";
    ctx.fillRect(0, 0, 800, 480);
    for (let x = 30; x < 800; x += 29) line(ctx, [[x,24], [x,456]], "#deded9");
    for (let y = 24; y < 480; y += 29) line(ctx, [[30,y], [770,y]], "#deded9");
    const light = "#f7f7f4";
    const surface = "#cacac2";
    const muted = "#b4b4ac";
    for (const room of layouts[layout]) {
      rect(ctx, ...room.rect, room.id === roomId ? "#cecec5" : light, "#4b4b47", 2);
    }
    rect(ctx, 116, 79, 568, 317, "transparent", "#30302e", 6);

    rect(ctx, 122, 88, 184, 27, surface);
    rect(ctx, 122, 114, 28, 87, surface);
    rect(ctx, 167, 93, 40, 17, light);
    circle(ctx, 134, 155, 6, light);
    circle(ctx, 134, 176, 6, light);
    if (layout === "open") {
      rect(ctx, 374, 112, 82, 34, surface);
      [386,410,434].forEach((x) => circle(ctx, x, 153, 6, light));
    } else {
      rect(ctx, 196, 130, 74, 28, surface);
      [208,231,254].forEach((x) => circle(ctx, x, 124, 4, light));
    }
    rect(ctx, 527, 91, 137, 38, surface);
    rect(ctx, 537, 95, 117, 8, muted);
    line(ctx, [[595,103], [595,128]]);
    circle(ctx, 587, 177, 18, light);

    rect(ctx, 131, 254, 79, 108, surface);
    rect(ctx, 137, 260, 30, 20, light);
    rect(ctx, 174, 260, 30, 20, light);
    line(ctx, [[132,285], [209,285]]);
    rect(ctx, 220, 245, 76, 18, surface);
    rect(ctx, 384, 240, 48, 73, surface);
    rect(ctx, 391, 249, 34, 54, light);
    circle(ctx, 488, 267, 13, surface);
    rect(ctx, 648, 270, 28, 95, surface);
    for (const x of [180, 466, 560]) {
      line(ctx, [[x,79], [x+45,79]], "#f7f7f4", 3.25);
      line(ctx, [[x,77], [x+45,77]], "#555551");
    }

    const doors = [
      { x: 314, y: 230, turn: -1 },
      { x: 459, y: 230, turn: 1 },
      { x: 552, y: 230, turn: 1 },
      { x: 570, y: 396, turn: -1 },
    ];
    for (const { x, y, turn } of doors) {
      const length = 38;
      line(ctx, [[x,y], [x+length,y]], light, 6);
      line(ctx, [[x,y], [x,y+turn*length]], "#686861");
      ctx.beginPath();
      ctx.arc(x, y, length, turn === 1 ? 0 : -Math.PI/2, turn === 1 ? Math.PI/2 : 0);
      ctx.stroke();
    }

    line(ctx, [[116,419], [684,419]], "#777770");
    for (const x of [116,376,520,684]) line(ctx, [[x,412], [x,426]], "#777770");
    line(ctx, [[94,79], [94,396]], "#777770");
    for (const y of [79,230,396]) line(ctx, [[87,y], [101,y]], "#777770");
  }

  function selectRoom(id) {
    roomId = id;
    const room = layouts[layout].find((item) => item.id === id);
    get("room-name").textContent = room.label;
    get("room-area").textContent = room.area + " м²";
    setSelected(pins, "data-room", id);
    drawPlan();
  }

  function showPlan(id) {
    layout = id;
    const rooms = layouts[id];
    pins.replaceChildren(...rooms.map((room) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.room = room.id;
      button.style.left = room.pin[0] / 8 + "%";
      button.style.top = room.pin[1] / 4.8 + "%";
      button.textContent = room.label;
      button.addEventListener("click", () => selectRoom(room.id));
      return button;
    }));
    setSelected(planControls, "data-plan", id);
    selectRoom(rooms[0].id);
  }

  planControls.querySelectorAll("[data-plan]").forEach((button) => button.addEventListener("click", () => showPlan(button.dataset.plan)));
  showPlan("rooms");

  const materialOptions = {
    wall: [
      { name: "Белая штукатурка", color: "#f7f6ee" },
      { name: "Серый микроцемент", color: "#bcbbb3" },
      { name: "Известняк", color: "#d6d0c1" },
    ],
    floor: [
      { name: "Светлый дуб", color: "#c3af91", finish: "planks" },
      { name: "Каменная плитка", color: "#a4a49c", finish: "tile" },
      { name: "Тёмная доска", color: "#777166", finish: "planks" },
    ],
    facade: [
      { name: "Графит", color: "#4c4d47" },
      { name: "Молочный", color: "#e4e0d3" },
      { name: "Орех", color: "#8e7662" },
    ],
  };
  const materialValues = { wall: 0, floor: 0, facade: 0 };
  const defaultFurniture = { sofa: "straight", table: "round", layout: "wall" };
  let furniture = { ...defaultFurniture };

  function tone(hex, shift) {
    return "#" + [1, 3, 5].map((pos) => {
      const channel = Math.min(255, Math.max(0, parseInt(hex.slice(pos, pos + 2), 16) + shift));
      return channel.toString(16).padStart(2, "0");
    }).join("");
  }

  function drawRoom(canvas, design, mode) {
    const ctx = canvas.getContext("2d");
    const view = ([x, y, z]) => [392 + (x-y)*42, 151 + (x+y)*20 - z*63];
    const plane = (points, color, stroke, width) => polygon(ctx, points.map(view), color, stroke, width);
    const seam = (points, color = "#6f6e66") => line(ctx, points.map(view), color);
    const sizeX = 7.1;
    const sizeY = 5.7;
    const wallZ = 1.92;
    const { wall, floor, facade, finish } = design;

    function box(x, y, w, d, height, color, z = 0) {
      const top = z + height;
      plane([[x+w,y,z], [x+w,y+d,z], [x+w,y+d,top], [x+w,y,top]], tone(color, -23));
      plane([[x,y+d,z], [x+w,y+d,z], [x+w,y+d,top], [x,y+d,top]], tone(color, -11));
      plane([[x,y,top], [x+w,y,top], [x+w,y+d,top], [x,y+d,top]], color);
    }

    ctx.fillStyle = "#eaeae6";
    ctx.fillRect(0, 0, 800, 480);
    plane([[0,0,0], [sizeX,0,0], [sizeX,sizeY,0], [0,sizeY,0]], floor);
    for (let y = .5; y < sizeY; y += finish === "tile" ? .88 : .42) {
      seam([[0,y,0], [sizeX,y,0]], tone(floor, -32));
    }
    if (finish === "tile") {
      for (let x = .82; x < sizeX; x += .82) seam([[x,0,0], [x,sizeY,0]], tone(floor, -32));
    } else {
      for (let strip = 0; strip < 13; strip++) {
        for (let x = .76 + (strip % 3) * .7; x < sizeX; x += 2.1) {
          seam([[x,.5 + strip*.42,0], [x,Math.min(sizeY, .92 + strip*.42),0]], tone(floor, -35));
        }
      }
    }
    plane([[0,0,0], [0,sizeY,0], [0,sizeY,wallZ], [0,0,wallZ]], tone(wall, -17));
    plane([[0,0,0], [sizeX,0,0], [sizeX,0,wallZ], [0,0,wallZ]], wall);
    plane([[0,.8,.7], [0,3.05,.7], [0,3.05,1.57], [0,.8,1.57]], "#fbfbf8");
    seam([[0,1.55,.7], [0,1.55,1.57]]);
    seam([[0,2.30,.7], [0,2.30,1.57]]);
    seam([[0,.8,1.12], [0,3.05,1.12]]);

    plane([[0,sizeY,0], [sizeX,sizeY,0], [sizeX,sizeY,-.15], [0,sizeY,-.15]], tone(floor, -20));
    plane([[sizeX,0,0], [sizeX,sizeY,0], [sizeX,sizeY,-.15], [sizeX,0,-.15]], tone(floor, -30));

    if (mode === "materials") {
      box(.6,.15,1.15,.64,1.72,facade);
      box(1.78,.15,1.02,.64,1.72,facade);
      box(2.82,.15,3.48,.74,.63,facade);
      box(2.8,.13,3.54,.79,.07,"#dfdcd3",.63);
      for (const x of [3.73,4.62,5.49]) seam([[x,.89,.04], [x,.89,.61]], tone(facade, -25));
      box(3.25,.16,1.04,.37,.4,facade,1.06);
      box(4.31,.16,1.04,.37,.4,facade,1.06);
      box(5.37,.16,.9,.37,.4,facade,1.06);
      box(2.75,2.55,2.22,1.30,.67,facade);
      box(2.64,2.47,2.44,1.46,.07,"#e4e1d9",.67);
      box(3.15,4.08,.53,.48,.32,"#a99579");
      box(4.08,4.08,.53,.48,.32,"#a99579");
      return;
    }

    box(5.05,.18,1.5,.47,.62,facade);
    box(5.10,.20,1.4,.36,.06,"#9a9a91",.64);
    const y = furniture.layout === "wall" ? .33 : 1.52;
    const fabric = "#9a9991";
    box(.66,y,2.76,.86,.34,fabric);
    box(.66,y,2.76,.20,.38,tone(fabric,-7),.32);
    box(.66,y+.2,.20,.65,.22,tone(fabric,12),.32);
    box(3.21,y+.2,.20,.65,.22,tone(fabric,12),.32);
    if (furniture.sofa === "corner") box(.85,y+.84,.86,1.05,.34,fabric);
    const tableX = 3.94;
    const tableY = furniture.layout === "wall" ? 2.76 : 3.98;
    if (furniture.table === "square") {
      box(tableX-.12,tableY-.12,.24,.24,.41,"#6b6a63");
      box(tableX-.71,tableY-.39,1.42,.78,.07,"#bcae97",.41);
    } else {
      box(tableX-.13,tableY-.13,.26,.26,.42,"#6b6a63");
      const circleTop = Array.from({ length: 40 }, (_, step) => {
        const angle = step / 40 * 2 * Math.PI;
        return [tableX + Math.cos(angle) * .66, tableY + Math.sin(angle) * .66, .48];
      });
      plane(circleTop, "#bcae97");
    }
  }

  function drawMaterials() {
    const values = Object.fromEntries(Object.entries(materialOptions).map(([key, options]) => [key, options[materialValues[key]]]));
    drawRoom(get("material-canvas"), { wall: values.wall.color, floor: values.floor.color, facade: values.facade.color, finish: values.floor.finish }, "materials");
  }

  for (const fieldset of get("palette-controls").querySelectorAll("fieldset")) {
    const key = fieldset.dataset.material;
    const field = fieldset.querySelector(".swatches");
    const caption = fieldset.querySelector(".swatch-name");
    const options = materialOptions[key];
    caption.textContent = options[0].name;
    options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.swatch = index;
      button.style.setProperty("--swatch", option.color);
      button.title = option.name;
      button.setAttribute("aria-label", option.name);
      button.setAttribute("aria-pressed", String(index === 0));
      button.addEventListener("click", () => {
        materialValues[key] = index;
        caption.textContent = option.name;
        setSelected(field, "data-swatch", String(index));
        drawMaterials();
      });
      field.append(button);
    });
  }
  drawMaterials();

  function drawFurniture() {
    drawRoom(get("constructor-canvas"), { wall: "#eeede7", floor: "#c8c7be", facade: "#565651", finish: "planks" }, "furniture");
  }
  const furnitureOptions = get("furniture-controls");
  for (const group of furnitureOptions.querySelectorAll("[data-furniture]")) {
    for (const button of group.querySelectorAll("[data-choice]")) {
      button.addEventListener("click", () => {
        furniture[group.dataset.furniture] = button.dataset.choice;
        setSelected(group, "data-choice", button.dataset.choice);
        drawFurniture();
      });
    }
  }
  get("reset-furniture").addEventListener("click", () => {
    furniture = { ...defaultFurniture };
    for (const group of furnitureOptions.querySelectorAll("[data-furniture]")) {
      setSelected(group, "data-choice", furniture[group.dataset.furniture]);
    }
    drawFurniture();
  });
  drawFurniture();

  const area = get("area-range");
  const rate = get("rate-input");
  const estimate = get("estimate-output");
  const expression = get("estimate-expression");
  function calculate() {
    const quantity = area.valueAsNumber;
    const input = rate.valueAsNumber;
    get("area-number").textContent = format.format(quantity) + " м²";
    const valid = rate.validity.valid && Number.isFinite(input);
    const total = valid ? format.format(quantity * input) + " ₽" : "—";
    estimate.textContent = total;
    estimate.dataset.long = String(total.length > 10);
    expression.textContent = valid
      ? format.format(quantity) + " м² × " + format.format(input) + " ₽ за м²"
      : rate.value || rate.validity.badInput ? "Укажите целую положительную сумму." : "Результат появится после ввода ставки.";
  }
  area.addEventListener("input", calculate);
  rate.addEventListener("input", calculate);
  calculate();

  const portfolio = [
    { id: "interiors", kind: "interior", title: "Галерея интерьеров", image: "art-projects", detail: "Планировки и отделка на примерах из демонстрационного портфолио ArtBuro28." },
    { id: "furniture", kind: "furniture", title: "Мебель для прихожей", image: "prosto-directions", detail: "Пример категории с описанием, фотографией и переходом к расчёту." },
    { id: "kitchen", kind: "furniture", title: "Комплектация кухни", image: "prosto-kitchens", detail: "Пример отдельной страницы о кухнях и сценария выбора параметров." },
  ];
  const portfolioFilter = get("portfolio-filter");
  const portfolioList = get("portfolio-list");
  const portfolioImage = get("portfolio-image");
  function selectPortfolio(project) {
    portfolioImage.src = "assets/screens/" + project.image + ".webp";
    portfolioImage.alt = project.title + ". Скриншот демонстрационного сайта.";
    get("portfolio-detail-title").textContent = project.title;
    get("portfolio-detail-copy").textContent = project.detail;
    setSelected(portfolioList, "data-project", project.id);
  }
  function filterPortfolio(kind) {
    const matching = kind === "all" ? portfolio : portfolio.filter((project) => project.kind === kind);
    const items = matching.map((project) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.project = project.id;
      button.textContent = project.title;
      button.addEventListener("click", () => selectPortfolio(project));
      return button;
    });
    portfolioList.replaceChildren(...items);
    setSelected(portfolioFilter, "data-filter", kind);
    selectPortfolio(matching[0]);
  }
  for (const filter of portfolioFilter.querySelectorAll("button")) {
    filter.addEventListener("click", () => filterPortfolio(filter.dataset.filter));
  }
  filterPortfolio("all");

  const editor = get("editor-form");
  const editorTitle = get("editor-title");
  const editorDescription = get("editor-description");
  const editorStatus = get("editor-status");
  function updatePreview(title, description) {
    get("preview-title").textContent = title;
    get("preview-description").textContent = description;
  }
  editor.addEventListener("submit", (event) => {
    event.preventDefault();
    for (const input of [editorTitle, editorDescription]) {
      input.setCustomValidity(input.value.trim() ? "" : "Введите текст.");
    }
    if (!editor.reportValidity()) return;
    updatePreview(editorTitle.value.trim(), editorDescription.value.trim());
    editorStatus.textContent = "Макет обновлён.";
  });
  editor.addEventListener("input", (event) => {
    event.target.setCustomValidity("");
    editorStatus.textContent = "";
  });
  editor.addEventListener("reset", () => {
    editorTitle.setCustomValidity("");
    editorDescription.setCustomValidity("");
    updatePreview(editorTitle.defaultValue, editorDescription.defaultValue);
    editorStatus.textContent = "Возвращён исходный текст.";
  });

  const crmButton = get("crm-run");
  const crmStages = [...get("crm-pipeline").children];
  const crmService = get("crm-service");
  const crmStatus = get("crm-status");
  function pipelineAt(active, message) {
    crmStages.forEach((stage, index) => {
      stage.dataset.state = index < active ? "done" : index === active ? "active" : "waiting";
    });
    crmStatus.textContent = message;
  }
  crmButton.addEventListener("click", async () => {
    crmButton.disabled = true;
    crmService.disabled = true;
    const selectedService = crmService.value;
    const messages = [
      "Сайт: выбрана услуга «" + selectedService + "».",
      "Создана демонстрационная карточка «" + selectedService + "».",
      "Демо-заявка назначена менеджеру.",
    ];
    if (!reduced.matches) {
      for (const active of [0, 1]) {
        pipelineAt(active, messages[active]);
        await new Promise((resolve) => setTimeout(resolve, 540));
      }
    }
    pipelineAt(3, messages[2]);
    crmButton.disabled = false;
    crmService.disabled = false;
  });
})();
