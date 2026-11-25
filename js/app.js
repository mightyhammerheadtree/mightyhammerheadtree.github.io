/* One renderer for every page. Pages describe themselves with data attributes. */
import {
  Button,
  createRawSnippet,
  mount,
  unmount,
} from "https://cdn.jsdelivr.net/gh/mightyhammerheadtree/m3svelte.js@main/m3svelte.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const snippet = (s) => createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));
const text = (s) => snippet(esc(s));
const node = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const button = (target, props) => mount(Button, { target, props: { size: "xs", ...props } });

function tile(item) {
  const name = item.name || item.url || "";
  const thumb = item.image
    ? `<img src="${esc(item.image)}" alt="${esc(name)}" loading="lazy">`
    : esc(item.url);
  const slot = node("span", "tile-slot");
  button(slot, {
    href: item.url || "#",
    variant: "text",
    size: "m",
    children: snippet(`<span class="tile-inner"><span class="thumb${item.image ? "" : " text"}">${thumb}</span><span class="name">${esc(name)}</span></span>`),
  });
  return slot;
}

function header(title, back) {
  const h = node("header");
  h.append(node("h1", null, esc(title)));
  if (back) {
    const slot = node("span", "back-slot");
    button(slot, { href: back, variant: "text", children: text("back") });
    h.append(slot);
  }
  return h;
}

function themeRow() {
  const row = node("div", "row");
  row.append(node("span", "label", "theme"));
  const slots = ["black", "white"].map((name) => {
    const slot = node("span", "opt-slot");
    row.append(slot);
    return { name, slot };
  });
  let mounted = [];
  const render = () => {
    mounted.forEach(unmount);
    mounted = slots.map(({ name, slot }) => button(slot, {
      variant: name === window.m3Theme.get() ? "filled" : "outlined",
      onclick: () => {
        window.m3Theme.set(name);
        render();
      },
      children: text(name),
    }));
  };
  render();
  return row;
}

async function render() {
  const { dataset } = document.body;
  const wrap = node("div", "wrap");
  wrap.append(header(dataset.title || "", dataset.back));
  document.body.append(wrap);

  if ("settings" in dataset) {
    wrap.append(themeRow());
    return;
  }

  const grid = node("div", "grid");
  wrap.append(grid);
  if ("list" in dataset) {
    try {
      const res = await fetch(dataset.list);
      if (!res.ok) throw new Error(`http ${res.status}`);
      const items = await res.json();
      if (!Array.isArray(items) || !items.length) {
        grid.className = "empty";
        grid.textContent = "nothing here.";
        return;
      }
      for (const item of items) grid.append(tile(item));
    } catch (e) {
      grid.className = "empty";
      grid.textContent = `could not load ${dataset.list} (${e.message})`;
    }
  }
}

render();
