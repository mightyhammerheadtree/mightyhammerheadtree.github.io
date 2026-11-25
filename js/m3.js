/* m3svelte.js components for the static pages. */
import {
  Button,
  createRawSnippet,
  mount,
  unmount,
} from "https://cdn.jsdelivr.net/gh/mightyhammerheadtree/m3svelte.js@main/m3svelte.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const html = (s) => createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));
const text = (s) => html(esc(s));
const btn = (target, props) => mount(Button, { target, props: { size: "xs", ...props } });
const slot = (el, cls) => {
  const s = document.createElement("span");
  s.className = cls;
  el.replaceWith(s);
  return s;
};

function tile(target, item) {
  const name = item.name || item.url || "";
  const thumb = item.image
    ? `<img src="${esc(item.image)}" alt="${esc(name)}" loading="lazy">`
    : esc(item.url);
  return btn(target, {
    href: item.url || "#",
    variant: "text",
    size: "m",
    children: html(`<span class="tile-inner"><span class="thumb${item.image ? "" : " text"}">${thumb}</span><span class="name">${esc(name)}</span></span>`),
  });
}

export function home() {
  for (const a of document.querySelectorAll("#tiles .tile")) {
    const img = a.querySelector("img");
    tile(slot(a, "tile-slot"), {
      name: a.querySelector(".name")?.textContent || "",
      url: a.getAttribute("href") || "#",
      image: img?.getAttribute("src"),
    });
  }
}

export async function loadList(url, id) {
  const target = document.getElementById(id);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("http " + res.status);
    const items = await res.json();
    if (!Array.isArray(items) || !items.length) {
      target.className = "empty";
      target.textContent = "nothing here.";
      return;
    }
    target.textContent = "";
    for (const item of items) {
      const s = document.createElement("span");
      s.className = "tile-slot";
      target.appendChild(s);
      tile(s, item);
    }
  } catch (e) {
    target.className = "empty";
    target.textContent = `could not load ${url} (${e.message})`;
  }
}

export function theme() {
  const options = [...document.querySelectorAll(".opt")].map((b) => ({
    name: b.dataset.theme,
    slot: slot(b, "opt-slot"),
  }));
  let mounted = [];
  const current = () => localStorage.getItem("theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "black" : "white");
  const render = () => {
    mounted.forEach(unmount);
    const active = current();
    mounted = options.map(({ name, slot }) => btn(slot, {
      variant: name === active ? "filled" : "outlined",
      onclick: () => {
        localStorage.setItem("theme", name);
        document.documentElement.dataset.theme = name;
        render();
      },
      children: text(name),
    }));
  };
  render();
}

for (const a of document.querySelectorAll("a.back")) {
  btn(slot(a, "back-slot"), {
    href: a.getAttribute("href") || "/",
    variant: "text",
    children: text("back"),
  });
}
