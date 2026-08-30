(() => {
  "use strict";

  const questions = window.MARTINA_QUESTIONS;
  const screens = { welcome: document.querySelector("#welcome"), profile: document.querySelector("#profile"), quiz: document.querySelector("#quiz"), results: document.querySelector("#results"), ranking: document.querySelector("#ranking"), participant: document.querySelector("#participant") };
  const state = { name: "", index: 0, score: 0, startedAt: 0, interval: null, photo: null, photoUrl: "", photoDataUrl: "", resultId: null, answers: [], previousScreen: "ranking", rankingOrigin: "welcome" };
  const sessionKey = "martina-quiz-session-v1";
  const supabase = window.MARTINA_SUPABASE;
  const defaultReactionImage = "assets/martina-compleanno.png";
  const negativeReactionImages = [
    "assets/martina-errore-1.jpeg",
    "assets/martina-errore-2.jpeg",
    "assets/martina-errore-3.jpeg",
    "assets/martina-errore-4.jpeg"
  ];
  const correctReactionImages = [
    "assets/risposta1.jpeg",
    "assets/risposta2.jpeg",
    "assets/risposta3.jpeg",
    "assets/risposta4.jpeg",
    "assets/risposta5.jpeg",
    "assets/risposta6.jpg",
    "assets/risposta7.jpeg",
    "assets/risposta8.jpeg",
    "assets/risposta9.jpeg",
    "assets/risposta10.jpg",
    "assets/risposta11-corretta.jpeg",
    "assets/risposta12.jpg",
    "assets/risposta13.jpeg",
    "assets/risposta14.jpeg",
    "assets/risposta15.jpeg",
    "assets/risposta16.jpeg",
    "assets/risposta30.webp",
    "assets/risposta18.jpeg",
    "assets/risposta19.jpg",
    "assets/risposta20.jpeg",
    "assets/risposta21.jpeg",
    "assets/risposta22.jpeg",
    "assets/risposta23-gender-reveal.png",
    "assets/risposta24.png",
    "assets/risposta25-distrazione.png",
    "assets/risposta26-abbraccio.png",
    "assets/risposta27.jpg",
    "assets/risposta28.jpeg",
    "assets/risposta29-isolamento.png",
    "assets/risposta17.jpeg"
  ];
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
  let negativeImageIndex = 0;

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

  function saveQuizSession() {
    if (!state.startedAt || state.index >= questions.length) return;
    try { localStorage.setItem(sessionKey, JSON.stringify({ name: state.name, index: state.index, score: state.score, startedAt: state.startedAt, answers: state.answers, photoDataUrl: state.photoDataUrl })); } catch (_) { /* La sessione resta comunque utilizzabile nella scheda corrente. */ }
  }

  function clearQuizSession() { localStorage.removeItem(sessionKey); }

  function dataUrlToFile(dataUrl) {
    const [metadata, data] = dataUrl.split(",");
    const mime = metadata.match(/data:([^;]+)/)?.[1] || "image/jpeg";
    const binary = atob(data); const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new File([bytes], "foto-partecipante.jpg", { type: mime });
  }

  async function compactPhoto(file) {
    const source = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
    const image = await loadImage(source); const maxSide = 900; const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d"); context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .82);
  }

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
    const payload = { player_name: state.name, photo_path: photoPath, score: state.score, total_questions: questions.length, time_seconds: timeSeconds, answers: state.answers };
    const response = await fetch(`${supabase.url}/rest/v1/quiz_results`, { method: "POST", headers: apiHeaders({ "Content-Type": "application/json", Prefer: "return=representation" }), body: JSON.stringify(payload) });
    if (!response.ok) throw new Error("Non sono riuscita a salvare il risultato.");
    const rows = await response.json();
    state.resultId = rows[0]?.id || null;
  }

  function renderLeaderboard(rows, list) {
    list.replaceChildren();
    rows.forEach((row, index) => {
      const item = document.createElement("button"); item.type = "button"; item.className = `leaderboard-row${row.id === state.resultId ? " leaderboard-current" : ""}`; item.setAttribute("aria-label", `Apri il riepilogo di ${row.player_name}`);
      const rank = document.createElement("span"); rank.className = "leaderboard-rank"; rank.textContent = index < 3 ? ["🥇", "🥈", "🥉"][index] : `${index + 1}.`;
      const avatar = document.createElement(row.photo_path ? "img" : "span"); avatar.className = "leaderboard-avatar";
      if (row.photo_path) { avatar.src = `${supabase.url}/storage/v1/object/public/quiz-photos/${encodeURIComponent(row.photo_path)}`; avatar.alt = ""; } else avatar.textContent = row.player_name.trim().charAt(0).toUpperCase();
      const details = document.createElement("div"); details.className = "leaderboard-player"; const name = document.createElement("strong"); name.textContent = row.player_name; const time = document.createElement("small"); time.textContent = formatSeconds(row.time_seconds); details.append(name, time);
      const score = document.createElement("span"); score.className = "leaderboard-score"; score.textContent = `${row.score}/${row.total_questions}`;
      item.append(rank, avatar, details, score); item.addEventListener("click", () => openParticipant(row, "ranking")); list.append(item);
    });
  }

  async function fetchLeaderboard() {
    const response = await fetch(`${supabase.url}/rest/v1/quiz_results?select=id,player_name,photo_path,score,total_questions,time_seconds,answers&order=score.desc,time_seconds.asc,created_at.asc&limit=1000`, { headers: apiHeaders() });
    if (!response.ok) throw new Error("Non sono riuscita a caricare la classifica.");
    return response.json();
  }

  function publicPhotoUrl(path) { return `${supabase.url}/storage/v1/object/public/quiz-photos/${encodeURIComponent(path)}`; }

  function renderPodium(rows, target) {
    target.replaceChildren();
    const winners = rows.slice(0, 3);
    if (!winners.length) { const empty = document.createElement("p"); empty.className = "leaderboard-status"; empty.textContent = "Il podio aspetta ancora le sue protagoniste."; target.append(empty); return; }
    const order = winners.length === 1 ? [0] : winners.length === 2 ? [1, 0] : [1, 0, 2];
    order.forEach(rankIndex => {
      const row = winners[rankIndex];
      const item = document.createElement("button"); item.type = "button"; item.className = `podium-place podium-place-${rankIndex + 1}`;
      const medal = document.createElement("span"); medal.className = "podium-medal"; medal.textContent = ["🥇", "🥈", "🥉"][rankIndex];
      const avatar = document.createElement(row.photo_path ? "img" : "span"); avatar.className = "podium-avatar";
      if (row.photo_path) { avatar.src = publicPhotoUrl(row.photo_path); avatar.alt = `Foto di ${row.player_name}`; } else avatar.textContent = row.player_name.trim().charAt(0).toUpperCase();
      const name = document.createElement("strong"); name.textContent = row.player_name;
      const score = document.createElement("small"); score.textContent = `${row.score}/${row.total_questions}`;
      item.append(medal, avatar, name, score); item.addEventListener("click", () => openParticipant(row, target.id === "result-podium" ? "results" : "ranking")); target.append(item);
    });
  }

  function openParticipant(row, previousScreen) {
    state.previousScreen = previousScreen;
    const card = document.querySelector("#participant-card"); card.replaceChildren();
    const avatar = document.createElement(row.photo_path ? "img" : "span"); avatar.className = "participant-avatar";
    if (row.photo_path) { avatar.src = `${supabase.url}/storage/v1/object/public/quiz-photos/${encodeURIComponent(row.photo_path)}`; avatar.alt = `Foto di ${row.player_name}`; } else avatar.textContent = row.player_name.trim().charAt(0).toUpperCase();
    const name = document.createElement("h2"); name.textContent = row.player_name;
    const summary = document.createElement("p"); summary.className = "participant-summary"; summary.textContent = `${row.score} risposte giuste su ${row.total_questions} · ${formatSeconds(row.time_seconds)}`;
    card.append(avatar, name, summary);
    if (row.score < 10) {
      const reactionLabel = document.createElement("p"); reactionLabel.className = "participant-reaction-label"; reactionLabel.textContent = "Forse è il caso di presentarci di nuovo. Piacere, Martina.";
      card.append(reactionLabel);
    }
    const list = document.querySelector("#participant-answers"); list.replaceChildren();
    if (!Array.isArray(row.answers) || !row.answers.length) { const empty = document.createElement("p"); empty.className = "leaderboard-status"; empty.textContent = "Il dettaglio non è disponibile: questo quiz è stato completato prima dell’aggiornamento."; list.append(empty); }
    else row.answers.forEach((answer, index) => {
      const item = document.createElement("article"); item.className = `participant-answer ${answer.is_correct ? "participant-correct" : "participant-incorrect"}`;
      const number = document.createElement("span"); number.className = "participant-question-number"; number.textContent = `${String(index + 1).padStart(2, "0")} · ${answer.is_correct ? "corretta" : "sbagliata"}`;
      const question = document.createElement("h4"); question.textContent = answer.question;
      const selected = document.createElement("p"); selected.textContent = `Risposta: ${answer.selected_answer}`;
      item.append(number, question, selected);
      if (!answer.is_correct) { const correct = document.createElement("p"); correct.className = "participant-correct-answer"; correct.textContent = `Risposta corretta: ${answer.correct_answer}`; item.append(correct); }
      list.append(item);
    });
    showScreen("participant"); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function updateLeaderboard(timeSeconds) {
    const status = document.querySelector("#leaderboard-status"); status.hidden = false; status.textContent = "Sto salvando il tuo risultato…";
    try {
      await saveResult(timeSeconds);
      status.textContent = "Sto preparando la classifica…";
      const rows = await fetchLeaderboard(); renderPodium(rows, document.querySelector("#result-podium")); status.hidden = true;
    } catch (error) { status.textContent = `${error.message} Controlla che la tabella e il bucket siano stati creati su Supabase.`; }
  }

  function renderQuestion() {
    const question = questions[state.index];
    document.querySelector("#question-number").textContent = `Domanda ${state.index + 1} di ${questions.length}`;
    document.querySelector("#progress-bar").style.width = `${(state.index / questions.length) * 100}%`;
    document.querySelector("#category").textContent = question.category;
    document.querySelector("#question-text").textContent = question.question;
    document.querySelector("#feedback").hidden = true;
    document.querySelector("#feedback").classList.remove("feedback-overlay");
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
    state.answers.push({ question: question.question, selected_answer: question.answers[index], correct_answer: question.answers[question.correct], is_correct: correct });
    const buttons = document.querySelectorAll(".answer");
    buttons.forEach(button => { button.disabled = true; });
    buttons[question.correct].classList.add("correct");
    if (!correct) buttons[index].classList.add("incorrect");
    if (!correct && "vibrate" in navigator) navigator.vibrate([80, 45, 120]);
    const type = correct ? "positive" : "negative";
    document.querySelector("#feedback").classList.add("feedback-overlay");
    if (!feedbackPools[type].length) feedbackPools[type] = shuffled(correct ? positive : negative);
    const feedbackImage = document.querySelector("#feedback-image");
    if (correct) feedbackImage.src = correctReactionImages[state.index];
    else {
      feedbackImage.src = negativeReactionImages[negativeImageIndex % negativeReactionImages.length];
      negativeImageIndex += 1;
    }
    document.querySelector("#feedback-text").textContent = question.comment || feedbackPools[type].pop() || (correct ? "Risposta corretta!" : "Risposta sbagliata!");
    document.querySelector("#next-button").firstChild.textContent = state.index === questions.length - 1 ? "Scopri il verdetto " : "Prossima domanda ";
    document.querySelector("#feedback").hidden = false;
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = source; });
  }

  function verdictReaction(score) {
    if (score === 30) return { src: "assets/verdetto-30.jpeg", alt: "Reazione di Martina al risultato perfetto di 30 punti" };
    if (score >= 26 && score <= 29) return { src: "assets/verdetto-26-29.jpeg", alt: "Reazione di Martina al risultato da 26 a 29 punti" };
    if (score >= 21 && score <= 25) return { src: "assets/verdetto-21-25.jpeg", alt: "Reazione di Martina al risultato da 21 a 25 punti" };
    if (score >= 16 && score <= 20) return { src: "assets/verdetto-16-20.jpeg", alt: "Reazione di Martina al risultato da 16 a 20 punti" };
    if (score >= 10 && score <= 15) return { src: "assets/verdetto-10-15.jpeg", alt: "Reazione di Martina al risultato da 10 a 15 punti" };
    if (score >= 0 && score <= 9) return { src: "assets/verdetto-0-9.jpeg", alt: "Reazione di Martina al risultato da 0 a 9 punti" };
    return null;
  }

  function finish(options = {}) {
    clearInterval(state.interval);
    const timeSeconds = options.timeSeconds ?? Math.floor((Date.now() - state.startedAt) / 1000);
    const percentage = Math.round((state.score / questions.length) * 100);
    let title, description;
    if (state.score === questions.length) { title = "INTELLIGENTE E SI APPLICA PURE"; description = "Ma tu esattamente perché sai tutte queste cose? Inizio a pensare di aver parlato un po’ troppo in questi anni. Evidentemente tutto questo tempo insieme è servito a qualcosa: il titolo di migliore amica, per il momento, è salvo. Hai vinto me. Mi dispiace."; }
    else if (state.score >= 26) { title = "IL LIVELLO DI ATTENZIONE È PREOCCUPANTE…"; description = "Complimenti, hai ufficialmente troppe informazioni su di me. A questo punto non è più amicizia, è archivio storico. Se un giorno perdessi la memoria, potresti tranquillamente ricostruirmi la vita."; }
    else if (state.score >= 21) { title = "CONOSCENZA DI MARTINA: PERICOLOSAMENTE AVANZATA"; description = "Anni di informazioni inutili finalmente ripagati. Sei entrata nella zona in cui ricordi dettagli che forse persino io avevo rimosso. Manca ancora qualche informazione completamente inutile per raggiungere la perfezione."; }
    else if (state.score >= 16) { title = "INTELLIGENTE MA NON SI APPLICA"; description = "Direi che possiamo continuare a frequentarci. Qualche lacuna grave, ma niente di irreparabile. Hai seguito le lezioni, ma evidentemente ogni tanto eri assente proprio nei capitoli fondamentali."; }
    else if (state.score >= 10) { title = "POTEVI FARE DI PIÙ"; description = "Evidentemente è il caso di rivedere la tua memoria selettiva ;) Qualcosa sai, ma troppe informazioni fondamentali sono finite nel cestino. Ti concedo un ripasso intensivo davanti a un aperitivo."; }
    else { title = "Forse è il caso di presentarci di nuovo. Piacere, Martina."; description = "Nove risposte giuste o meno e una certezza: in tutti questi anni, evidentemente, parlavo da sola. Ricominciamo dalle basi."; }
    document.querySelector("#score-value").textContent = state.score;
    document.querySelector("#result-greeting").textContent = `${state.name}, abbiamo bisogno di parlare…`;
    document.querySelector("#score-total").textContent = questions.length;
    document.querySelector("#result-title").textContent = title;
    document.querySelector("#result-description").textContent = description;
    const reaction = verdictReaction(state.score);
    const reactionFigure = document.querySelector("#result-reaction");
    if (reaction) {
      const reactionImage = document.querySelector("#result-reaction-image");
      reactionImage.src = reaction.src; reactionImage.alt = reaction.alt; reactionFigure.hidden = false;
    } else reactionFigure.hidden = true;
    document.querySelector("#result-name").textContent = state.name;
    document.querySelector("#result-time").textContent = formatSeconds(timeSeconds);
    document.querySelector("#result-percentage").textContent = `${percentage}%`;
    document.querySelector("#progress-bar").style.width = "100%";
    showScreen("results");
    if (options.restore) {
      const status = document.querySelector("#leaderboard-status"); status.hidden = false; status.textContent = "Sto preparando il podio…";
      fetchLeaderboard().then(rows => { renderPodium(rows, document.querySelector("#result-podium")); status.hidden = true; }).catch(error => { status.textContent = error.message; });
    } else {
      try { localStorage.setItem(sessionKey, JSON.stringify({ completed: true, name: state.name, index: questions.length, score: state.score, startedAt: state.startedAt, timeSeconds, answers: state.answers, photoDataUrl: state.photoDataUrl })); } catch (_) { /* Nessun blocco se lo storage è pieno. */ }
      updateLeaderboard(timeSeconds);
    }
  }

  function restoreQuizSession() {
    let saved;
    try { saved = JSON.parse(localStorage.getItem(sessionKey)); } catch (_) { clearQuizSession(); return; }
    if (!saved?.name || !saved.photoDataUrl || !Number.isInteger(saved.index)) return;
    state.name = saved.name; state.index = saved.index; state.score = Number(saved.score) || 0; state.startedAt = Number(saved.startedAt) || Date.now(); state.answers = Array.isArray(saved.answers) ? saved.answers : [];
    state.photoDataUrl = saved.photoDataUrl; state.photoUrl = saved.photoDataUrl; state.photo = dataUrlToFile(saved.photoDataUrl);
    feedbackPools = { positive: shuffled(positive), negative: shuffled(negative) };
    negativeImageIndex = state.answers.filter(answer => !answer.is_correct).length % negativeReactionImages.length;
    if (saved.completed) { finish({ restore: true, timeSeconds: Number(saved.timeSeconds) || 0 }); return; }
    if (state.index < 0 || state.index >= questions.length) { clearQuizSession(); return; }
    document.querySelector("#timer").textContent = elapsed();
    state.interval = setInterval(() => { document.querySelector("#timer").textContent = elapsed(); }, 1000);
    renderQuestion(); showScreen("quiz");
  }

  function updateProfileForm() {
    const hasName = Boolean(document.querySelector("#player-name").value.trim());
    document.querySelector("#profile-submit").disabled = !hasName || !state.photo;
    document.querySelector(".profile-name").classList.toggle("profile-complete", hasName);
  }

  document.querySelector("#player-name").addEventListener("input", updateProfileForm);

  async function handlePhotoChange(event) {
    const photo = event.target.files[0]; const error = document.querySelector("#photo-error"); error.hidden = true;
    if (!photo) { state.photo = null; updateProfileForm(); return; }
    if (!photo.type.startsWith("image/") || photo.size > 5 * 1024 * 1024) { state.photo = null; event.target.value = ""; error.textContent = "Scegli una foto dalla galleria o scattane una, massimo 5 MB."; error.hidden = false; updateProfileForm(); return; }
    state.photo = null; updateProfileForm();
    try { state.photoDataUrl = await compactPhoto(photo); state.photo = dataUrlToFile(state.photoDataUrl); }
    catch (_) { event.target.value = ""; error.textContent = "Non sono riuscita a preparare questa foto. Provane un’altra."; error.hidden = false; updateProfileForm(); return; }
    if (state.photoUrl) URL.revokeObjectURL(state.photoUrl);
    state.photoUrl = state.photoDataUrl;
    const preview = document.querySelector("#photo-preview"); preview.replaceChildren(); const image = document.createElement("img"); image.src = state.photoUrl; image.alt = ""; preview.append(image);
    document.querySelector("#photo-caption").textContent = "Perfetta: in classifica farai faville.";
    document.querySelector(".photo-upload").classList.add("photo-ready");
    updateProfileForm();
  }

  const photoSourceTrigger = document.querySelector("#photo-source-trigger");
  const photoSourceActions = document.querySelector("#photo-source-actions");
  function closePhotoSources() { photoSourceActions.hidden = true; photoSourceTrigger.setAttribute("aria-expanded", "false"); }
  photoSourceTrigger.addEventListener("click", () => { photoSourceActions.hidden = !photoSourceActions.hidden; photoSourceTrigger.setAttribute("aria-expanded", String(!photoSourceActions.hidden)); });
  document.querySelector("#take-photo-button").addEventListener("click", () => { closePhotoSources(); document.querySelector("#camera-photo").click(); });
  document.querySelector("#choose-photo-button").addEventListener("click", () => { closePhotoSources(); document.querySelector("#player-photo").click(); });
  document.querySelector("#camera-photo").addEventListener("change", handlePhotoChange);
  document.querySelector("#player-photo").addEventListener("change", handlePhotoChange);

  document.querySelector("#start-form").addEventListener("submit", event => {
    event.preventDefault();
    state.name = document.querySelector("#player-name").value.trim();
    if (!state.name) return;
    if (!state.photo) { const error = document.querySelector("#photo-error"); error.textContent = "Prima la foto: in classifica vogliamo riconoscerti!"; error.hidden = false; return; }
    state.index = 0; state.score = 0; state.startedAt = Date.now(); state.resultId = null; state.answers = [];
    feedbackPools = { positive: shuffled(positive), negative: shuffled(negative) };
    negativeImageIndex = 0;
    clearInterval(state.interval);
    document.querySelector("#timer").textContent = "00:00";
    state.interval = setInterval(() => { document.querySelector("#timer").textContent = elapsed(); }, 1000);
    saveQuizSession(); renderQuestion(); showScreen("quiz");
  });
  document.querySelector("#next-button").addEventListener("click", () => { state.index += 1; if (state.index < questions.length) { saveQuizSession(); renderQuestion(); } else finish(); window.scrollTo({ top: 0, behavior: "smooth" }); });
  document.querySelector("#restart-button").addEventListener("click", () => { clearQuizSession(); showScreen("welcome"); });
  document.querySelector("#begin-button").addEventListener("click", () => { showScreen("profile"); updateProfileForm(); });
  async function openRanking(origin) {
    state.rankingOrigin = origin;
    showScreen("ranking");
    const status = document.querySelector("#ranking-status"); const list = document.querySelector("#ranking-list");
    status.hidden = false; status.textContent = "Sto preparando la classifica…"; list.replaceChildren();
    window.scrollTo({ top: 0, behavior: "smooth" });
    try { const rows = await fetchLeaderboard(); renderLeaderboard(rows, list); status.hidden = rows.length > 0; if (!rows.length) status.textContent = "Nessuna ha ancora completato il quiz. Puoi essere la prima!"; }
    catch (error) { status.textContent = error.message; }
  }

  document.querySelector("#open-leaderboard").addEventListener("click", () => openRanking("welcome"));
  document.querySelector("#open-full-ranking").addEventListener("click", () => openRanking("results"));
  document.querySelector("#back-from-ranking").addEventListener("click", () => { showScreen(state.rankingOrigin); window.scrollTo({ top: 0, behavior: "smooth" }); });
  document.querySelector("#back-from-participant").addEventListener("click", () => showScreen(state.previousScreen));

  const themeStorageKey = "martina-color-theme";
  const themeToggle = document.querySelector("#theme-toggle");
  const themeOptions = document.querySelector("#theme-options");
  const themeColors = { rose: "#fffdfb", sage: "#fbfdf9", sky: "#fbfdff", lilac: "#fdfbff", peach: "#fffdfa" };

  function closeThemeOptions() {
    themeOptions.hidden = true;
    themeToggle.setAttribute("aria-expanded", "false");
  }

  function applyTheme(theme) {
    const selectedTheme = themeColors[theme] ? theme : "rose";
    document.documentElement.dataset.theme = selectedTheme;
    document.querySelector('meta[name="theme-color"]').content = themeColors[selectedTheme];
    document.querySelectorAll("[data-theme-choice]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === selectedTheme));
    });
    try { localStorage.setItem(themeStorageKey, selectedTheme); } catch (_) { /* Il tema resta comunque attivo. */ }
  }

  themeToggle.addEventListener("click", () => {
    const willOpen = themeOptions.hidden;
    themeOptions.hidden = !willOpen;
    themeToggle.setAttribute("aria-expanded", String(willOpen));
  });
  document.querySelectorAll("[data-theme-choice]").forEach(button => {
    button.addEventListener("click", () => { applyTheme(button.dataset.themeChoice); closeThemeOptions(); });
  });
  document.addEventListener("click", event => { if (!event.target.closest(".theme-picker")) closeThemeOptions(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeThemeOptions(); });
  applyTheme(document.documentElement.dataset.theme || "rose");
  restoreQuizSession();
})();
