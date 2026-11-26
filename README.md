# 💻 Coding Agent — Free AI Code Assistant & Developer Tools

Free coding agent tool — standalone, one tool only. No server, no login, no payment.

## What it does

### 1. AI Code Assistant
- **Chat** — ask the AI to write, explain, fix or convert code (answers in English, with code blocks)
- **Presets** — Write code, Explain code, Fix / debug code, Convert language, Add comments, Optimize code
- **Offline templates** — Hello World, Fetch API, Sort Array (work with no key)

### 2. Code Playground
- Code editor with language selector (JavaScript, Python, HTML)
- **Run JavaScript** in the browser with console output and error messages
- Copy + Download code, live line count and character count

### 3. Code Utilities (all client-side)
- **JSON Formatter / Validator** — pretty-print, minify, validate with error messages
- **Base64 Encode / Decode**
- **URL Encode / Decode**
- **Regex Tester** — pattern, flags, test string, matches listed
- **Markdown Preview** — simple live preview (headings, bold, italic, lists, links, code)
- **Color Converter** — HEX ↔ RGB with live preview swatch
- **Text Tools** — word/character count, UPPERCASE / lowercase, remove extra spaces

### 4. Snippet Library
- Fetch API, Sort an Array, Debounce a Function, Format a Date — each with a Copy button

## How to use

1. Open `index.html` in a browser — or open the GitHub Pages link.
2. **AI Assistant:** open Settings, paste your own **OpenAI-compatible API key** (OpenRouter free model or FreeModel).
   - Endpoint (default): `https://openrouter.ai/api/v1/chat/completions`
   - Model (default): `meta-llama/llama-3.3-70b-instruct:free`
   - For FreeModel, change the endpoint and model name to the ones FreeModel gives you (e.g. `glm-5.3-flash`).
3. Press **Save Key** — the key is stored only in this browser's localStorage.
4. Press **Test Key** to check it works, then type a question and press **Send**.
5. Without a key, use the offline templates, the Playground, Utilities and Snippets — they need no key at all.

## Deploy free on GitHub Pages

1. Create a new public repo on GitHub (for example `coding-agent`).
2. Upload `index.html`, `style.css`, `app.js`, and `README.md` to the repo root.
3. Go to the repo → **Settings → Pages** → **Build and deployment → Source: Deploy from a branch** → Branch: `main`, Folder: `/ (root)` → **Save**.
4. Wait a moment, then open the Pages link (`https://<username>.github.io/coding-agent/`).

## Privacy

- 🔒 Your API key is stored **only in browser localStorage** — it is not in the code and is never sent to any server except the API endpoint you choose.
- 🔒 Your code, files and chat history stay on this device — there is no server.
- 🔒 The AI only sends your messages to the endpoint you choose (OpenRouter / FreeModel).
- ⚠️ Never paste passwords, wallet seed phrases or bank details into the chat.
- To delete the key, press **Delete Key** in Settings.

## Files

- `index.html` — page (4 tabs: AI Assistant, Playground, Utilities, Snippets)
- `style.css` — design (dark code area)
- `app.js` — chat + playground + utilities + snippets (client-side only)
- `README.md` — this file
