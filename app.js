const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const filterButtons = [...document.querySelectorAll(".quick-link[data-filter]")];
const productCards = [...document.querySelectorAll(".product-card")];
const productLines = [...document.querySelectorAll(".product-line")];
const noResults = document.querySelector(".no-results");
const compareButtons = [...document.querySelectorAll(".compare-button")];
const compareCount = document.querySelector(".compare-count");
const compareSlots = document.querySelector(".compare-slots");
const compareMessage = document.querySelector(".compare-message");
const compareAction = document.querySelector(".compare-action");
const comparisonResult = document.querySelector(".comparison-result");

const selectedProducts = new Set();
let selectedCategory = "all";

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  navigation.classList.toggle("open", isOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  });
});

function filterProducts(category) {
  selectedCategory = category;
  let visibleCount = 0;

  for (const card of productCards) {
    const matches = category === "all" || card.dataset.category.split(" ").includes(category);
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  }

  for (const line of productLines) {
    line.hidden = !line.querySelector(".product-card:not([hidden])");
  }

  noResults.hidden = visibleCount > 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const isSelected = button.dataset.filter === selectedCategory;
    filterButtons.forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle("selected", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    if (!isSelected) filterProducts(button.dataset.filter);
  });
});

function productFor(id) {
  return productCards.find((card) => card.dataset.product === id);
}

function renderCompare() {
  const ids = [...selectedProducts];
  compareCount.textContent = `${ids.length} / 3 SELECTED`;
  compareAction.disabled = ids.length < 2;
  compareMessage.textContent = ids.length < 2
    ? "Select at least two chairs to compare."
    : ids.length === 3
      ? "Three chairs selected. Remove one to choose a different model."
      : "Ready to compare. You can add one more chair.";

  compareSlots.replaceChildren();
  for (let index = 0; index < 3; index += 1) {
    const id = ids[index];
    if (!id) {
      const placeholder = document.createElement("span");
      placeholder.textContent = "Choose a chair above";
      compareSlots.append(placeholder);
      continue;
    }

    const card = productFor(id);
    const slot = document.createElement("span");
    slot.className = "compare-slot";
    const name = document.createElement("span");
    name.textContent = card.querySelector("h3").textContent;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "REMOVE ×";
    remove.setAttribute("aria-label", `Remove ${name.textContent} from comparison`);
    remove.addEventListener("click", () => {
      selectedProducts.delete(id);
      renderCompare();
    });
    slot.append(name, remove);
    compareSlots.append(slot);
  }

  for (const button of compareButtons) {
    const isSelected = selectedProducts.has(button.dataset.compare);
    button.setAttribute("aria-pressed", String(isSelected));
    button.textContent = isSelected ? "✓ ADDED" : "+ COMPARE";
    button.disabled = !isSelected && ids.length === 3;
  }
}

compareButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.compare;
    if (selectedProducts.has(id)) selectedProducts.delete(id);
    else if (selectedProducts.size < 3) selectedProducts.add(id);
    comparisonResult.hidden = true;
    renderCompare();
  });
});

compareAction.addEventListener("click", () => {
  const chosen = [...selectedProducts].map(productFor);
  const table = document.createElement("table");
  const caption = document.createElement("caption");
  caption.textContent = "Your chair selection";
  table.append(caption);

  const header = table.insertRow();
  const headerCell = document.createElement("th");
  headerCell.scope = "col";
  headerCell.textContent = "CHAIR";
  header.append(headerCell);
  for (const card of chosen) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = card.querySelector("h3").textContent;
    header.append(cell);
  }

  const categoryRow = table.insertRow();
  const categoryHeading = document.createElement("th");
  categoryHeading.scope = "row";
  categoryHeading.textContent = "CATEGORY";
  categoryRow.append(categoryHeading);
  for (const card of chosen) {
    const cell = categoryRow.insertCell();
    cell.textContent = card.querySelector(".product-kicker").textContent;
  }

  const descriptionRow = table.insertRow();
  const descriptionHeading = document.createElement("th");
  descriptionHeading.scope = "row";
  descriptionHeading.textContent = "OVERVIEW";
  descriptionRow.append(descriptionHeading);
  for (const card of chosen) {
    const cell = descriptionRow.insertCell();
    cell.textContent = card.querySelector(".product-info > p").textContent;
  }

  comparisonResult.replaceChildren(table);
  comparisonResult.hidden = false;
});

renderCompare();

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    item.querySelector("summary span").textContent = item.open ? "×" : "+";
  });
});
