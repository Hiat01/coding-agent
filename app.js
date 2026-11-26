(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ---------- Tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabs.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach(function (p) { p.classList.add("hidden"); });
      var panel = $("panel-" + btn.getAttribute("data-tab"));
      if (panel) panel.classList.remove("hidden");
    });
  });

  /* ---------- Share ---------- */
  $("shareBtn").addEventListener("click", function () {
    var url = window.location.href;
    function done() { alert("Link copied! Share it anywhere:\n" + url); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url); done(); });
    } else { fallbackCopy(url); done(); }
  });
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- AI Assistant ---------- */
  var SYSTEM_PROMPT = "You are a helpful coding assistant. Answer in English. Explain briefly, then give code in fenced code blocks with the language name. Keep code correct and runnable when possible.";
  var LS = { key: "codingagent_api_key", endpoint: "codingagent_api_endpoint", model: "codingagent_api_model" };
  try {
    if (localStorage.getItem(LS.key)) $("apiKey").value = localStorage.getItem(LS.key);
    if (localStorage.getItem(LS.endpoint)) $("apiEndpoint").value = localStorage.getItem(LS.endpoint);
    if (localStorage.getItem(LS.model)) $("apiModel").value = localStorage.getItem(LS.model);
  } catch (e) {}
  function refreshKeyStatus() {
    var has = false;
    try { has = !!localStorage.getItem(LS.key); } catch (e) {}
    $("keyStatus").textContent = has ? "Key status: saved in this browser" : "Key status: not saved yet";
    $("noKeyNotice").style.display = has ? "none" : "block";
  }
  refreshKeyStatus();
  $("saveKeyBtn").addEventListener("click", function () {
    var k = $("apiKey").value.trim();
    if (!k) { alert("Please paste your API key first."); return; }
    try {
      localStorage.setItem(LS.key, k);
      localStorage.setItem(LS.endpoint, $("apiEndpoint").value.trim());
      localStorage.setItem(LS.model, $("apiModel").value.trim());
    } catch (e) { alert("Could not save the key in this browser."); return; }
    refreshKeyStatus(); alert("Key saved in this browser only.");
  });
  $("clearKeyBtn").addEventListener("click", function () {
    try { localStorage.removeItem(LS.key); } catch (e) {}
    $("apiKey").value = ""; refreshKeyStatus(); alert("Key deleted.");
  });
  function addMsg(role, text) {
    var div = document.createElement("div");
    div.className = "msg " + role;
    div.textContent = text;
    $("chatLog").appendChild(div);
    $("chatLog").scrollTop = $("chatLog").scrollHeight;
    return div;
  }
  async function callAI(userText) {
    var key = "", endpoint = $("apiEndpoint").value.trim(), model = $("apiModel").value.trim();
    try { key = localStorage.getItem(LS.key) || ""; } catch (e) {}
    if (!key) { alert("No API key saved yet. Add your own key in Settings, or use the offline templates below."); return; }
    $("aiStatus").textContent = "Thinking...";
    var thinking = addMsg("ai", "Thinking...");
    try {
      var res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userText }
          ]
        })
      });
      var data = await res.json();
      var answer = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      if (!answer) throw new Error("Empty response. Check the model name and endpoint, then try again.");
      thinking.textContent = answer;
      $("aiStatus").textContent = "";
    } catch (err) {
      thinking.textContent = "Error: " + err.message;
      $("aiStatus").textContent = "Request failed. Check your key, endpoint and model in Settings.";
    }
  }
  function sendCurrent() {
    var text = $("chatInput").value.trim();
    if (!text) { alert("Type your code or question first."); return; }
    addMsg("user", text);
    $("chatInput").value = "";
    callAI(text);
  }
  $("sendBtn").addEventListener("click", sendCurrent);
  $("chatInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendCurrent();
  });
  $("clearChatBtn").addEventListener("click", function () { $("chatLog").innerHTML = ""; });
  document.querySelectorAll("#quickActions .chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var action = chip.getAttribute("data-prompt");
      var extra = $("chatInput").value.trim();
      var text = extra ? action + ": " + extra : action + ". Please ask me for the code first if I did not paste any.";
      addMsg("user", text);
      callAI(text);
    });
  });
  $("testKeyBtn").addEventListener("click", async function () {
    var key = "";
    try { key = localStorage.getItem(LS.key) || ""; } catch (e) {}
    if (!key) { alert("Save your API key first."); return; }
    $("keyStatus").textContent = "Testing key...";
    try {
      var res = await fetch($("apiEndpoint").value.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
        body: JSON.stringify({
          model: $("apiModel").value.trim(),
          messages: [{ role: "user", content: "Reply with one short English greeting." }]
        })
      });
      var data = await res.json();
      var ok = data && data.choices && data.choices[0] && data.choices[0].message;
      $("keyStatus").textContent = ok ? "Key works! Test reply received." : "Test failed — check the model name and endpoint.";
    } catch (err) {
      $("keyStatus").textContent = "Test failed: " + err.message;
    }
  });

  /* ---------- Offline templates ---------- */
  var TEMPLATES = {
    hello: "// Hello World (JavaScript)\nconsole.log('Hello, World!');\n\n// Hello World (Python)\n# print('Hello, World!')",
    fetch: "// Fetch API example (JavaScript)\nasync function getUser(id) {\n  const res = await fetch('https://jsonplaceholder.typicode.com/users/' + id);\n  const user = await res.json();\n  console.log(user.name);\n  return user;\n}\ngetUser(1);",
    sort: "// Sort an array (JavaScript)\nconst numbers = [5, 2, 9, 1, 7];\nconst sorted = [...numbers].sort((a, b) => a - b);\nconsole.log(sorted); // [1, 2, 5, 7, 9]"
  };
  function showTemplate(name) { $("offlineOutput").textContent = TEMPLATES[name]; }
  $("tplHelloBtn").addEventListener("click", function () { showTemplate("hello"); });
  $("tplFetchBtn").addEventListener("click", function () { showTemplate("fetch"); });
  $("tplSortBtn").addEventListener("click", function () { showTemplate("sort"); });
  $("copyOfflineBtn").addEventListener("click", function () {
    fallbackCopy($("offlineOutput").textContent);
    alert("Template copied.");
  });

  /* ---------- Playground ---------- */
  function updatePlayCount() {
    var v = $("playCode").value;
    $("playCount").textContent = v.split("\n").length + " lines • " + v.length + " characters";
  }
  $("playCode").addEventListener("input", updatePlayCount);
  updatePlayCount();
  $("playLang").addEventListener("change", function () {
    var lang = $("playLang").value;
    $("playNote").textContent = lang === "javascript"
      ? "JavaScript runs locally with console.log captured. Python / HTML are not executed — copy them to run elsewhere."
      : "Only JavaScript runs in this playground. This " + lang + " code is shown for reference — copy it to run elsewhere.";
    $("runBtn").disabled = lang !== "javascript";
  });
  $("runBtn").addEventListener("click", function () {
    var code = $("playCode").value;
    var logs = [];
    var fakeConsole = {
      log: function () { logs.push(Array.prototype.map.call(arguments, function (a) { try { return typeof a === "object" ? JSON.stringify(a) : String(a); } catch (e) { return String(a); } }).join(" ")); },
      error: function () { logs.push("ERROR: " + Array.prototype.join.call(arguments, " ")); },
      warn: function () { logs.push("WARN: " + Array.prototype.join.call(arguments, " ")); }
    };
    try {
      var fn = new Function("console", code);
      fn(fakeConsole);
      $("playOutput").textContent = logs.length ? logs.join("\n") : "// Ran with no console output.";
    } catch (err) {
      $("playOutput").textContent = "Error: " + err.message;
    }
  });
  $("copyPlayBtn").addEventListener("click", function () { fallbackCopy($("playCode").value); alert("Code copied."); });
  $("downloadPlayBtn").addEventListener("click", function () {
    var lang = $("playLang").value;
    var ext = lang === "javascript" ? "js" : lang === "python" ? "py" : "html";
    var blob = new Blob([$("playCode").value], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "code." + ext;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  /* ---------- JSON ---------- */
  $("jsonPrettyBtn").addEventListener("click", function () {
    try { $("jsonOutput").textContent = JSON.stringify(JSON.parse($("jsonInput").value), null, 2); $("jsonStatus").textContent = "Valid JSON."; }
    catch (err) { $("jsonStatus").textContent = "Invalid JSON: " + err.message; }
  });
  $("jsonMinifyBtn").addEventListener("click", function () {
    try { $("jsonOutput").textContent = JSON.stringify(JSON.parse($("jsonInput").value)); $("jsonStatus").textContent = "Valid JSON."; }
    catch (err) { $("jsonStatus").textContent = "Invalid JSON: " + err.message; }
  });
  $("jsonValidateBtn").addEventListener("click", function () {
    try { JSON.parse($("jsonInput").value); $("jsonStatus").textContent = "Valid JSON."; $("jsonOutput").textContent = "Valid JSON."; }
    catch (err) { $("jsonStatus").textContent = "Invalid JSON: " + err.message; }
  });

  /* ---------- Base64 ---------- */
  $("b64EncodeBtn").addEventListener("click", function () {
    try { $("b64Output").textContent = btoa(unescape(encodeURIComponent($("b64Input").value))); }
    catch (err) { $("b64Output").textContent = "Error: " + err.message; }
  });
  $("b64DecodeBtn").addEventListener("click", function () {
    try { $("b64Output").textContent = decodeURIComponent(escape(atob($("b64Input").value))); }
    catch (err) { $("b64Output").textContent = "Error: invalid Base64 — " + err.message; }
  });

  /* ---------- URL ---------- */
  $("urlEncodeBtn").addEventListener("click", function () { $("urlOutput").textContent = encodeURIComponent($("urlInput").value); });
  $("urlDecodeBtn").addEventListener("click", function () {
    try { $("urlOutput").textContent = decodeURIComponent($("urlInput").value); }
    catch (err) { $("urlOutput").textContent = "Error: " + err.message; }
  });

  /* ---------- Regex ---------- */
  $("regexTestBtn").addEventListener("click", function () {
    var pattern = $("regexPattern").value, flags = $("regexFlags").value, text = $("regexText").value;
    try {
      var re = new RegExp(pattern, flags);
      var matches = text.match(re);
      if (!matches) { $("regexOutput").textContent = "No matches found."; $("regexStatus").textContent = ""; return; }
      $("regexOutput").textContent = matches.map(function (m, i) { return (i + 1) + ". " + m; }).join("\n");
      $("regexStatus").textContent = matches.length + " match(es) found.";
    } catch (err) {
      $("regexOutput").textContent = "Error: " + err.message;
      $("regexStatus").textContent = "";
    }
  });

  /* ---------- Markdown ---------- */
  $("mdPreviewBtn").addEventListener("click", function () {
    var lines = $("mdInput").value.split("\n");
    var html = "";
    var inList = false;
    lines.forEach(function (line) {
      var t = line.trim();
      if (t.indexOf("### ") === 0) { if (inList) { html += "</ul>"; inList = false; } html += "<h3>" + esc(t.slice(4)) + "</h3>"; }
      else if (t.indexOf("## ") === 0) { if (inList) { html += "</ul>"; inList = false; } html += "<h2>" + esc(t.slice(3)) + "</h2>"; }
      else if (t.indexOf("# ") === 0) { if (inList) { html += "</ul>"; inList = false; } html += "<h1>" + esc(t.slice(2)) + "</h1>"; }
      else if (t.indexOf("- ") === 0) { if (!inList) { html += "<ul>"; inList = true; } html += "<li>" + inlineMd(t.slice(2)) + "</li>"; }
      else if (t === "") { if (inList) { html += "</ul>"; inList = false; } }
      else { if (inList) { html += "</ul>"; inList = false; } html += "<p>" + inlineMd(t) + "</p>"; }
    });
    if (inList) html += "</ul>";
    $("mdOutput").innerHTML = html || "<em>Nothing to preview.</em>";
  });
  function inlineMd(s) {
    var h = esc(s);
    h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
    h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return h;
  }

  /* ---------- Color converter ---------- */
  function hexToRgb(hex) {
    var h = hex.replace("#", "").trim();
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgbToHex(r, g, b) {
    function p(n) { var s = n.toString(16); return s.length === 1 ? "0" + s : s; }
    return "#" + p(r) + p(g) + p(b);
  }
  $("hexToRgbBtn").addEventListener("click", function () {
    var rgb = hexToRgb($("hexInput").value);
    if (!rgb) { $("colorStatus").textContent = "Invalid HEX color. Use format #2563eb."; return; }
    $("rgbInput").value = rgb.join(", ");
    $("colorSwatch").style.background = $("hexInput").value;
    $("colorStatus").textContent = "Converted: " + $("hexInput").value + " = rgb(" + rgb.join(", ") + ")";
  });
  $("rgbToHexBtn").addEventListener("click", function () {
    var parts = $("rgbInput").value.split(",").map(function (x) { return parseInt(x.trim(), 10); });
    if (parts.length !== 3 || parts.some(function (n) { return isNaN(n) || n < 0 || n > 255; })) {
      $("colorStatus").textContent = "Invalid RGB. Use format 37, 99, 235."; return;
    }
    var hex = rgbToHex(parts[0], parts[1], parts[2]);
    $("hexInput").value = hex;
    $("colorSwatch").style.background = hex;
    $("colorStatus").textContent = "Converted: rgb(" + parts.join(", ") + ") = " + hex;
  });

  /* ---------- Text tools ---------- */
  $("textCountBtn").addEventListener("click", function () {
    var t = $("textInput").value;
    var words = t.trim() ? t.trim().split(/\s+/).length : 0;
    $("textOutput").textContent = "Characters: " + t.length + "\nCharacters (no spaces): " + t.replace(/\s/g, "").length + "\nWords: " + words + "\nLines: " + t.split("\n").length;
    $("textStatus").textContent = "";
  });
  $("textUpperBtn").addEventListener("click", function () { $("textOutput").textContent = $("textInput").value.toUpperCase(); });
  $("textLowerBtn").addEventListener("click", function () { $("textOutput").textContent = $("textInput").value.toLowerCase(); });
  $("textSpacesBtn").addEventListener("click", function () { $("textOutput").textContent = $("textInput").value.replace(/\s+/g, " ").trim(); });

  /* ---------- Snippets ---------- */
  var SNIPPETS = [
    { title: "Fetch API (GET JSON)", lang: "JavaScript", code: "async function getData(url) {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error('Request failed: ' + res.status);\n  return res.json();\n}\n\ngetData('https://jsonplaceholder.typicode.com/posts/1')\n  .then(data => console.log(data))\n  .catch(err => console.error(err));" },
    { title: "Sort an Array", lang: "JavaScript", code: "const numbers = [5, 2, 9, 1, 7];\nconst ascending = [...numbers].sort((a, b) => a - b);\nconst descending = [...numbers].sort((a, b) => b - a);\nconsole.log(ascending);   // [1, 2, 5, 7, 9]\nconsole.log(descending);  // [9, 7, 5, 2, 1]" },
    { title: "Debounce a Function", lang: "JavaScript", code: "function debounce(fn, delay) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}\n\nconst onSearch = debounce((q) => console.log('Search:', q), 300);" },
    { title: "Format a Date", lang: "JavaScript", code: "function formatDate(d) {\n  const date = new Date(d);\n  return date.toLocaleDateString('en-US', {\n    year: 'numeric', month: 'long', day: 'numeric'\n  });\n}\n\nconsole.log(formatDate('2026-11-26')); // November 26, 2026" }
  ];
  var list = $("snippetList");
  SNIPPETS.forEach(function (s) {
    var div = document.createElement("div");
    div.className = "snippet";
    var h = document.createElement("h3");
    h.textContent = s.title + " — " + s.lang;
    var pre = document.createElement("pre");
    pre.className = "code-output";
    pre.textContent = s.code;
    var btn = document.createElement("button");
    btn.className = "btn btn-ghost";
    btn.type = "button";
    btn.textContent = "📋 Copy Snippet";
    btn.addEventListener("click", function () { fallbackCopy(s.code); alert("Snippet copied."); });
    div.appendChild(h); div.appendChild(pre); div.appendChild(btn);
    list.appendChild(div);
  });
})();
