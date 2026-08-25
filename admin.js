(() => {
  "use strict";

  const model = { questions: structuredClone(window.MARTINA_QUESTIONS), feedback: structuredClone(window.MARTINA_FEEDBACK) };
  let dirty = false;
  const status = document.querySelector("#save-status");

  function markDirty() { dirty = true; status.textContent = "Hai modifiche non salvate"; status.className = ""; }
  function updateCounts() { document.querySelector("#question-count").textContent = model.questions.length; document.querySelector("#positive-count").textContent = model.feedback.positive.length; document.querySelector("#negative-count").textContent = model.feedback.negative.length; }

  function inputField(label, value, callback, placeholder = "") {
    const wrapper = document.createElement("div"); wrapper.className = "field";
    const title = document.createElement("label"); title.textContent = label;
    const input = document.createElement("input"); input.value = value || ""; input.placeholder = placeholder;
    input.addEventListener("input", () => { callback(input.value); markDirty(); });
    wrapper.append(title, input); return wrapper;
  }

  function renderQuestions() {
    const list = document.querySelector("#question-list"); list.replaceChildren();
    model.questions.forEach((question, index) => {
      const card = document.createElement("article"); card.className = "question-card";
      const header = document.createElement("div"); header.className = "card-header";
      const number = document.createElement("span"); number.className = "card-number"; number.textContent = `DOMANDA ${index + 1}`;
      const actions = document.createElement("div"); actions.className = "card-actions";
      for (const [direction, label] of [[-1, "↑"], [1, "↓"]]) { const button = document.createElement("button"); button.type = "button"; button.className = "move-button"; button.textContent = label; button.disabled = index + direction < 0 || index + direction >= model.questions.length; button.addEventListener("click", () => { [model.questions[index], model.questions[index + direction]] = [model.questions[index + direction], model.questions[index]]; markDirty(); renderQuestions(); }); actions.append(button); }
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "delete-button"; remove.textContent = "Elimina"; remove.addEventListener("click", () => { if (!confirm(`Eliminare la domanda ${index + 1}?`)) return; model.questions.splice(index, 1); markDirty(); renderQuestions(); updateCounts(); });
      actions.append(remove); header.append(number, actions); card.append(header);
      card.append(inputField("Categoria", question.category, value => { question.category = value; }, "Es. AMICIZIE & DRAMA"));
      card.append(inputField("Domanda", question.question, value => { question.question = value; }, "Scrivi qui la domanda"));
      const answersLabel = document.createElement("span"); answersLabel.className = "answers-label"; answersLabel.textContent = "Risposte: seleziona il pallino accanto a quella corretta"; card.append(answersLabel);
      question.answers.forEach((answer, answerIndex) => { const row = document.createElement("div"); row.className = "answer-row"; const radio = document.createElement("input"); radio.type = "radio"; radio.name = `correct-${index}`; radio.className = "answer-radio"; radio.checked = question.correct === answerIndex; radio.addEventListener("change", () => { question.correct = answerIndex; markDirty(); }); const letter = document.createElement("span"); letter.className = "answer-letter"; letter.textContent = String.fromCharCode(65 + answerIndex); const input = document.createElement("input"); input.className = "answer-input"; input.value = answer; input.placeholder = `Risposta ${letter.textContent}`; input.addEventListener("input", () => { question.answers[answerIndex] = input.value; markDirty(); }); row.append(radio, letter, input); card.append(row); });
      card.append(inputField("Frase personalizzata per questa domanda (facoltativa)", question.comment, value => { if (value.trim()) question.comment = value; else delete question.comment; }, "Lascia vuoto per usare una frase casuale"));
      list.append(card);
    });
  }

  function renderFeedback(type) {
    const list = document.querySelector(`#${type}-list`); list.replaceChildren();
    model.feedback[type].forEach((message, index) => { const row = document.createElement("div"); row.className = "feedback-row"; const input = document.createElement("input"); input.className = "feedback-input"; input.value = message; input.placeholder = "Scrivi una frase"; input.addEventListener("input", () => { model.feedback[type][index] = input.value; markDirty(); }); const remove = document.createElement("button"); remove.type = "button"; remove.className = "delete-button"; remove.textContent = "×"; remove.addEventListener("click", () => { model.feedback[type].splice(index, 1); markDirty(); renderFeedback(type); updateCounts(); }); row.append(input, remove); list.append(row); });
  }

  function validate() {
    if (!model.questions.length) return "Inserisci almeno una domanda.";
    for (let index = 0; index < model.questions.length; index += 1) { const question = model.questions[index]; if (!question.category.trim() || !question.question.trim()) return `Completa categoria e testo della domanda ${index + 1}.`; if (question.answers.some(answer => !answer.trim())) return `Completa tutte le risposte della domanda ${index + 1}.`; }
    if (!model.feedback.positive.length || !model.feedback.negative.length) return "Inserisci almeno una frase per ciascun tipo di risposta.";
    if ([...model.feedback.positive, ...model.feedback.negative].some(message => !message.trim())) return "Completa o elimina le frasi vuote.";
    return "";
  }

  async function save() {
    const error = validate(); if (error) { status.textContent = error; status.className = "error"; return; }
    const button = document.querySelector("#save-button"); button.disabled = true; status.textContent = "Salvataggio in corso…"; status.className = "";
    try { const response = await fetch("/api/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(model) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Salvataggio non riuscito."); dirty = false; status.textContent = "Salvato! Ora puoi fare commit e push."; status.className = "success"; }
    catch (saveError) { status.textContent = location.protocol === "file:" ? "Avvia prima il server con: node server.js" : saveError.message; status.className = "error"; }
    finally { button.disabled = false; }
  }

  document.querySelectorAll(".tab").forEach(tab => { tab.addEventListener("click", () => { document.querySelectorAll(".tab").forEach(other => { other.classList.toggle("active", other === tab); }); document.querySelectorAll(".panel").forEach(panel => { panel.hidden = panel.id !== `${tab.dataset.tab}-panel`; }); }); });
  document.querySelector("#add-question").addEventListener("click", () => { model.questions.push({ category: "", question: "", answers: ["", "", "", ""], correct: 0 }); markDirty(); renderQuestions(); updateCounts(); document.querySelector("#question-list").lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" }); });
  document.querySelectorAll(".add-feedback").forEach(button => { button.addEventListener("click", () => { const type = button.dataset.type; model.feedback[type].push(""); markDirty(); renderFeedback(type); updateCounts(); document.querySelector(`#${type}-list`).lastElementChild.querySelector("input").focus(); }); });
  document.querySelector("#save-button").addEventListener("click", save);
  window.addEventListener("beforeunload", event => { if (dirty) event.preventDefault(); });
  updateCounts(); renderQuestions(); renderFeedback("positive"); renderFeedback("negative");
})();
