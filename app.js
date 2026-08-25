(() => {
  "use strict";

  const questions = window.MARTINA_QUESTIONS;
  const screens = { welcome: document.querySelector("#welcome"), profile: document.querySelector("#profile"), quiz: document.querySelector("#quiz"), results: document.querySelector("#results"), ranking: document.querySelector("#ranking") };
  const state = { name: "", index: 0, score: 0, startedAt: 0, interval: null, photo: null, resultId: null };
  const supabase = window.MARTINA_SUPABASE;
  const positive = window.MARTINA_FEEDBACK?.positive || [
    "Esatto. Martina approverebbe con un cenno molto teatrale.",
    "Risposta giusta: il vostro gruppo WhatsApp può stare tranquillo.",
    "Ci hai preso. Quasi sospetto che tu abbia studiato.",
    "Brava. Hai evitato una piccola crisi diplomatica.",
    "Perfetto. Hai appena guadagnato punti anche nella vita reale.",
    "Confermo: almeno una dei suoi vocali l’hai ascoltata davvero.",
    "Esattamente. Martina si sente vista, capita e leggermente spiata.",
    "Giusta. Ti sei ufficialmente meritata il posto accanto a lei all’aperitivo.",
    "Molto bene. Le altre iniziano a percepirti come una minaccia.",
    "Centro pieno. Questa amicizia ha basi sorprendentemente solide.",
    "Corretto. La commissione migliore amica prende diligentemente nota.",
    "Lo sapevi. E adesso puoi anche vantartene con moderazione.",
    "Risposta impeccabile. Martina annuisce dall’alto della sua importanza.",
    "Sì. Evidentemente nei momenti cruciali prestavi attenzione.",
    "Esatto. Il vostro archivio di inside joke non è stato costruito invano.",
    "Bravissima. Questa vale almeno mezzo spritz offerto.",
    "Hai indovinato. La chat delle amiche approva senza riserve.",
    "Perfetta. A questo ritmo Martina ti affida anche le password.",
    "Giustissima. Sei pericolosamente vicina allo status di anima gemella.",
    "Bingo. Qualcuna qui conosce decisamente troppo bene la situazione.",
    "Esatto. Nessun trauma relazionale da segnalare per questa domanda.",
    "Corretto. Il reparto gossip certifica la tua preparazione.",
    "Che classe. Risposta giusta e dignità dell’amicizia preservata.",
    "Proprio così. Martina probabilmente lo racconta da almeno tre anni.",
    "Ottimo colpo. Le concorrenti sono invitate a prendere appunti.",
    "Sì, sì e ancora sì. Questa era roba da vere intenditrici.",
    "Risposta esatta. Puoi continuare a definirti una persona informata.",
    "Applausi discreti ma convinti: hai capito tutto.",
    "Perfetto. La vostra amicizia supera un altro controllo qualità.",
    "Ci sei arrivata. Martina è orgogliosa, anche se non lo ammetterà."
  ];
  const negative = window.MARTINA_FEEDBACK?.negative || [
    "No. Martina sta rivalutando tutta la vostra amicizia.",
    "Sbagliato. Serve urgentemente un aperitivo chiarificatore.",
    "Ahi. Questa verrà sicuramente ricordata nel gruppo.",
    "Nope. La delusione è palpabile, ma andiamo avanti.",
    "Errore grave. Martina ha già iniziato a scrivere un vocale.",
    "Non proprio. Forse quei sette minuti di audio andavano ascoltati.",
    "Risposta sbagliata. Il comitato amicizia chiede spiegazioni.",
    "Male. Molto male. Ma fingiamo che fosse una domanda trabocchetto.",
    "No. Il vostro prossimo caffè avrà un’atmosfera particolare.",
    "Questa fa male. Soprattutto a Martina, che pensava foste più vicine.",
    "Hai mancato il bersaglio con una sicurezza quasi ammirevole.",
    "Sbagliata. La chat di gruppo ha appena trattenuto il respiro.",
    "No. Qualcuna durante gli aperitivi era evidentemente distratta.",
    "Ahi. Il posto al tavolo delle migliori amiche ora traballa.",
    "Niente da fare. Martina si aspettava decisamente di più da te.",
    "Risposta errata. Parte immediatamente un’indagine interna.",
    "Non ci siamo. Però la convinzione con cui hai cliccato era notevole.",
    "No. Questa amicizia ha bisogno di un piccolo aggiornamento software.",
    "Brutta caduta. Tranquilla: le altre ne parleranno solo per sempre.",
    "Sbagliato. Martina sta cercando ricevute delle vostre conversazioni.",
    "Questa non era difficile. O almeno, così sosterrà Martina.",
    "Errore registrato e archiviato per future discussioni passive-aggressive.",
    "Nope. Un’altra così e scatta il corso di recupero.",
    "Ahi ahi. La memoria selettiva oggi non gioca a tuo favore.",
    "No. Martina potrebbe chiederti di restituire il titolo di bestie.",
    "Sbagliata. Ti salva soltanto il fatto che nessuno è perfetto.",
    "Questa risposta ha appena creato materiale per tre nuovi meme.",
    "Non esattamente. Mettiamola tra le cose da chiarire davanti a un drink.",
    "Errore. Martina sorride, ma dentro sta prendendo appunti.",
    "No. Per fortuna il test non prevede l’espulsione dal gruppo."
  ];
  let feedbackPools = { positive: [], negative: [] };

  function shuffled(messages) {
    const result = [...messages];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function showScreen(name) { Object.entries(screens).forEach(([key, screen]) => { screen.hidden = key !== name; }); }
  function elapsed() { const seconds = Math.floor((Date.now() - state.startedAt) / 1000); return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }

  function apiHeaders(extra = {}) { return { apikey: supabase.anonKey, Authorization: `Bearer ${supabase.anonKey}`, ...extra }; }

  function formatSeconds(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }

  async function uploadPhoto() {
    if (!state.photo) return null;
    const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    const filename = `${crypto.randomUUID()}.${extensions[state.photo.type]}`;
    const response = await fetch(`${supabase.url}/storage/v1/object/quiz-photos/${filename}`, { method: "POST", headers: apiHeaders({ "Content-Type": state.photo.type }), body: state.photo });
    if (!response.ok) throw new Error("Non sono riuscita a caricare la foto.");
    return filename;
  }

  async function saveResult(timeSeconds) {
    const photoPath = await uploadPhoto();
    const payload = { player_name: state.name, photo_path: photoPath, score: state.score, total_questions: questions.length, time_seconds: timeSeconds };
    const response = await fetch(`${supabase.url}/rest/v1/quiz_results`, { method: "POST", headers: apiHeaders({ "Content-Type": "application/json", Prefer: "return=representation" }), body: JSON.stringify(payload) });
    if (!response.ok) throw new Error("Non sono riuscita a salvare il risultato.");
    const rows = await response.json();
    state.resultId = rows[0]?.id || null;
  }

  function renderLeaderboard(rows, list = document.querySelector("#leaderboard-list")) {
    list.replaceChildren();
    rows.forEach((row, index) => {
      const item = document.createElement("div"); item.className = `leaderboard-row${row.id === state.resultId ? " leaderboard-current" : ""}`;
      const rank = document.createElement("span"); rank.className = "leaderboard-rank"; rank.textContent = index < 3 ? ["🥇", "🥈", "🥉"][index] : `${index + 1}.`;
      const avatar = document.createElement(row.photo_path ? "img" : "span"); avatar.className = "leaderboard-avatar";
      if (row.photo_path) { avatar.src = `${supabase.url}/storage/v1/object/public/quiz-photos/${encodeURIComponent(row.photo_path)}`; avatar.alt = ""; } else avatar.textContent = row.player_name.trim().charAt(0).toUpperCase();
      const details = document.createElement("div"); details.className = "leaderboard-player"; const name = document.createElement("strong"); name.textContent = row.player_name; const time = document.createElement("small"); time.textContent = formatSeconds(row.time_seconds); details.append(name, time);
      const score = document.createElement("span"); score.className = "leaderboard-score"; score.textContent = `${row.score}/${row.total_questions}`;
      item.append(rank, avatar, details, score); list.append(item);
    });
  }

  async function fetchLeaderboard() {
    const response = await fetch(`${supabase.url}/rest/v1/quiz_results?select=id,player_name,photo_path,score,total_questions,time_seconds&order=score.desc,time_seconds.asc,created_at.asc&limit=50`, { headers: apiHeaders() });
    if (!response.ok) throw new Error("Non sono riuscita a caricare la classifica.");
    return response.json();
  }

  async function updateLeaderboard(timeSeconds) {
    const status = document.querySelector("#leaderboard-status"); status.hidden = false; status.textContent = "Sto salvando il tuo risultato…";
    try {
      await saveResult(timeSeconds);
      status.textContent = "Sto preparando la classifica…";
      renderLeaderboard(await fetchLeaderboard()); status.hidden = true;
    } catch (error) { status.textContent = `${error.message} Controlla che la tabella e il bucket siano stati creati su Supabase.`; }
  }

  function renderQuestion() {
    const question = questions[state.index];
    document.querySelector("#question-number").textContent = `Domanda ${state.index + 1} di ${questions.length}`;
    document.querySelector("#progress-bar").style.width = `${(state.index / questions.length) * 100}%`;
    document.querySelector("#category").textContent = question.category;
    document.querySelector("#question-text").textContent = question.question;
    document.querySelector("#feedback").hidden = true;
    const quizScreen = document.querySelector("#quiz");
    quizScreen.classList.remove("question-enter");
    void quizScreen.offsetWidth;
    quizScreen.classList.add("question-enter");
    const answers = document.querySelector("#answers");
    answers.replaceChildren();
    question.answers.forEach((answer, index) => {
      const button = document.createElement("button");
      button.className = "answer";
      button.type = "button";
      const letter = document.createElement("span");
      letter.className = "answer-letter";
      letter.textContent = String.fromCharCode(65 + index);
      button.append(letter, document.createTextNode(answer));
      button.addEventListener("click", () => selectAnswer(index));
      answers.append(button);
    });
  }

  function selectAnswer(index) {
    const question = questions[state.index];
    const correct = index === question.correct;
    if (correct) state.score += 1;
    const buttons = document.querySelectorAll(".answer");
    buttons.forEach(button => { button.disabled = true; });
    buttons[question.correct].classList.add("correct");
    if (!correct) buttons[index].classList.add("incorrect");
    const type = correct ? "positive" : "negative";
    if (!feedbackPools[type].length) feedbackPools[type] = shuffled(correct ? positive : negative);
    document.querySelector("#feedback-text").textContent = question.comment || feedbackPools[type].pop() || (correct ? "Risposta corretta!" : "Risposta sbagliata!");
    document.querySelector("#next-button").firstChild.textContent = state.index === questions.length - 1 ? "Scopri il verdetto " : "Prossima domanda ";
    document.querySelector("#feedback").hidden = false;
    if (window.matchMedia("(max-width: 600px)").matches) {
      requestAnimationFrame(() => document.querySelector("#feedback").scrollIntoView({ behavior: "smooth", block: "nearest" }));
    }
  }

  function finish() {
    clearInterval(state.interval);
    const timeSeconds = Math.floor((Date.now() - state.startedAt) / 1000);
    const percentage = Math.round((state.score / questions.length) * 100);
    let title, description;
    if (state.score === questions.length) { title = "Martina sotto mentite spoglie"; description = "Trenta su trenta. O sei la sua anima gemella, o sei letteralmente Martina con un altro nome."; }
    else if (state.score >= 27) { title = "Anima gemella certificata"; description = "Conosci Martina meglio di quanto lei conosca sé stessa. Leggermente inquietante, ma anche molto tenero."; }
    else if (state.score >= 22) { title = "Bestie di altissimo livello"; description = "Sei chiaramente tra le persone fidate. Qualche dettaglio ti sfugge, ma il posto nel gruppo è assolutamente salvo."; }
    else if (state.score >= 16) { title = "Bestie"; description = "Le basi ci sono e pure qualche colpo di genio. Ti manca soltanto un ripasso dei vocali più importanti."; }
    else if (state.score >= 10) { title = "Amica, con riserva"; description = "Ci sono margini di miglioramento. Forse durante gli ultimi aperitivi stavi seguendo più lo spritz che Martina."; }
    else { title = "Ma vi conoscete davvero?"; description = "Martina chiede gentilmente nome, cognome e da quanto tempo vi frequentate. Perché qualcosa non torna."; }
    document.querySelector("#score-value").textContent = state.score;
    document.querySelector("#result-greeting").textContent = `${state.name}, abbiamo bisogno di parlare…`;
    document.querySelector("#score-circle small").textContent = `su ${questions.length}`;
    document.querySelector("#result-title").textContent = title;
    document.querySelector("#result-description").textContent = description;
    document.querySelector("#result-name").textContent = state.name;
    document.querySelector("#result-time").textContent = elapsed();
    document.querySelector("#result-percentage").textContent = `${percentage}%`;
    document.querySelector("#progress-bar").style.width = "100%";
    showScreen("results");
    updateLeaderboard(timeSeconds);
  }

  function updateProfileForm() {
    const hasName = Boolean(document.querySelector("#player-name").value.trim());
    document.querySelector("#profile-submit").disabled = !hasName || !state.photo;
    document.querySelector(".profile-name").classList.toggle("profile-complete", hasName);
  }

  document.querySelector("#player-name").addEventListener("input", updateProfileForm);

  document.querySelector("#player-photo").addEventListener("change", event => {
    const photo = event.target.files[0]; const error = document.querySelector("#photo-error"); error.hidden = true;
    if (!photo) { state.photo = null; updateProfileForm(); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type) || photo.size > 5 * 1024 * 1024) { state.photo = null; event.target.value = ""; error.textContent = "Scegli una foto JPG, PNG o WebP di massimo 5 MB."; error.hidden = false; updateProfileForm(); return; }
    state.photo = photo;
    const preview = document.querySelector("#photo-preview"); preview.replaceChildren(); const image = document.createElement("img"); image.src = URL.createObjectURL(photo); image.alt = ""; preview.append(image);
    document.querySelector("#photo-caption").textContent = "Perfetta: in classifica farai faville.";
    document.querySelector(".photo-upload").classList.add("photo-ready");
    updateProfileForm();
  });

  document.querySelector("#start-form").addEventListener("submit", event => {
    event.preventDefault();
    state.name = document.querySelector("#player-name").value.trim();
    if (!state.name) return;
    if (!state.photo) { const error = document.querySelector("#photo-error"); error.textContent = "Prima la foto: in classifica vogliamo riconoscerti!"; error.hidden = false; return; }
    state.index = 0; state.score = 0; state.startedAt = Date.now(); state.resultId = null;
    feedbackPools = { positive: shuffled(positive), negative: shuffled(negative) };
    clearInterval(state.interval);
    document.querySelector("#timer").textContent = "00:00";
    state.interval = setInterval(() => { document.querySelector("#timer").textContent = elapsed(); }, 1000);
    renderQuestion(); showScreen("quiz");
  });
  document.querySelector("#next-button").addEventListener("click", () => { state.index += 1; state.index < questions.length ? renderQuestion() : finish(); });
  document.querySelector("#restart-button").addEventListener("click", () => { showScreen("welcome"); });
  document.querySelector("#begin-button").addEventListener("click", () => { showScreen("profile"); updateProfileForm(); });
  document.querySelector("#open-leaderboard").addEventListener("click", async () => {
    showScreen("ranking");
    const status = document.querySelector("#ranking-status"); const list = document.querySelector("#ranking-list");
    status.hidden = false; status.textContent = "Sto preparando la classifica…"; list.replaceChildren();
    try { const rows = await fetchLeaderboard(); renderLeaderboard(rows, list); status.hidden = rows.length > 0; if (!rows.length) status.textContent = "Nessuna ha ancora completato il quiz. Puoi essere la prima!"; }
    catch (error) { status.textContent = error.message; }
  });
  document.querySelector("#back-from-ranking").addEventListener("click", () => showScreen("welcome"));
})();
