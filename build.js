"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

async function build() {
  const output = path.join(__dirname, "dist");
  await fs.mkdir(output, { recursive: true });

  for (const filename of ["index.html", "styles.css", "app.js", "questions.js", "feedback.js", "supabase-config.js"]) {
    await fs.copyFile(path.join(__dirname, filename), path.join(output, filename));
  }

  await fs.cp(path.join(__dirname, "assets"), path.join(output, "assets"), { recursive: true });
  console.log("Quiz statico pronto per Vercel nella cartella dist.");
}

build().catch(error => {
  console.error("Errore durante la preparazione del quiz:", error.message);
  process.exitCode = 1;
});
