https://mightyhammerheadtree.github.io

Pages are tiny HTML shells; `js/app.js` renders every page from `data-*`
attributes on `<body>`:

- `data-title` — heading text
- `data-back` — adds the back link to the given URL
- `data-list` — JSON file of `{ name, url, image }` tiles to render
- `data-settings` — renders the theme buttons

`js/prefs.js` applies the saved theme before paint. Add a page by copying a
shell and pointing it at a JSON list.
