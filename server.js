"use strict";

const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml" };

function json(response, status, value) { response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" }); response.end(JSON.stringify(value)); }

async function save(request, response) {
  let body = "";
  for await (const chunk of request) { body += chunk; if (body.length > 1_000_000) { json(response, 413, { error: "Contenuto troppo grande." }); return; } }
  let content; try { content = JSON.parse(body); } catch { json(response, 400, { error: "Dati non validi." }); return; }
  if (!Array.isArray(content.questions) || !content.questions.length || !content.questions.every(question => typeof question.category === "string" && question.category.trim() && typeof question.question === "string" && question.question.trim() && Array.isArray(question.answers) && question.answers.length === 4 && question.answers.every(answer => typeof answer === "string" && answer.trim()) && Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4)) { json(response, 400, { error: "Controlla le domande e le risposte." }); return; }
  if (!content.feedback || !["positive", "negative"].every(type => Array.isArray(content.feedback[type]) && content.feedback[type].length && content.feedback[type].every(message => typeof message === "string" && message.trim()))) { json(response, 400, { error: "Controlla le frasi di risposta." }); return; }
  const questions = `// Modifica le domande dalla pagina admin.html.\n// correct indica la posizione della risposta corretta: 0 = prima, 1 = seconda, ecc.\nwindow.MARTINA_QUESTIONS = ${JSON.stringify(content.questions, null, 2)};\n`;
  const feedback = `// Modifica le frasi dalla pagina admin.html.\nwindow.MARTINA_FEEDBACK = ${JSON.stringify(content.feedback, null, 2)};\n`;
  try { await fs.writeFile(path.join(root, "questions.js"), questions); await fs.writeFile(path.join(root, "feedback.js"), feedback); json(response, 200, { saved: true }); } catch { json(response, 500, { error: "Non riesco a salvare i file del progetto." }); }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (request.method === "POST" && url.pathname === "/api/save") { await save(request, response); return; }
  if (request.method !== "GET" && request.method !== "HEAD") { response.writeHead(405); response.end(); return; }
  let pathname; try { pathname = decodeURIComponent(url.pathname); } catch { response.writeHead(400); response.end("Richiesta non valida"); return; }
  const filename = path.resolve(root, `.${pathname === "/" ? "/admin.html" : pathname}`);
  if (filename !== root && !filename.startsWith(`${root}${path.sep}`)) { response.writeHead(403); response.end("Accesso negato"); return; }
  try { const data = await fs.readFile(filename); response.writeHead(200, { "Content-Type": types[path.extname(filename).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" }); response.end(request.method === "HEAD" ? undefined : data); } catch { response.writeHead(404); response.end("File non trovato"); }
});

server.listen(port, "127.0.0.1", () => { console.log(`Admin Martina: http://127.0.0.1:${port}/admin.html`); console.log(`Quiz Martina:  http://127.0.0.1:${port}/index.html`); });
