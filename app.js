"use strict";

/* ---------- Model ----------
   Bostrom's core fraction:  f_sim = (f_P * f_I * N) / (f_P * f_I * N + 1)
   f_P = fraction of civilizations that reach a posthuman stage
   f_I = fraction of those that run many ancestor simulations
   N   = average number of simulated histories per such civilization
   We additionally scale by c, your credence that simulated minds can be conscious.
   Each answer picks an illustrative value for one of these quantities. */

const VALUES = {
  c:  { agree: 0.95, disagree: 0.02 },
  fP: { agree: 0.3, disagree: 1e-9 },
  fI: { agree: 0.1, disagree: 1e-7 },
  N:  { agree: 1e6,  disagree: 0.5 },
};

const STEPS = [
  {
    key: "c", chip: "Consciousness", tag: "Premise 1 of 4",
    q: "Could a sufficiently advanced civilization create conscious simulated beings?",
    ctx: "Bostrom assumes “substrate independence”: what makes a mind conscious is the pattern of information processing, not the stuff it runs on. Neurons are not magic; silicon, or something stranger, could in principle do the same job.",
    opts: {
      agree: ["Yes, minds can run on other substrates", "Consciousness is about structure and function."],
      disagree: ["No, simulation can't produce experience", "A simulated storm doesn't make anything wet; a simulated brain may not feel."],
    },
    reflect: {
      agree: "You accept the foundation. Everything that follows is now about numbers and motives, not metaphysics.",
      disagree: "Then simulated observers are, at best, philosophical zombies and the argument loses its bite. Note that Bostrom explicitly sets this challenge aside as an assumption, so you have rejected the argument at its first step.",
    },
  },
  {
    key: "fP", chip: "Survival", tag: "Premise 2 of 4",
    q: "Could civilizations survive long enough to reach that technological stage?",
    ctx: "Simulating a mind (let alone a world) would need staggering computing power, perhaps planet-sized computers. Do technological civilizations tend to get there, or do wars, engineered pandemics, AI accidents or other “great filters” usually stop them first?",
    opts: {
      agree: ["Yes, a meaningful fraction make it", "Even if most fail, some survive."],
      disagree: ["Almost none ever get there", "Something reliably destroys or stalls civilizations first."],
    },
    reflect: {
      agree: "Notice how little is demanded: only that some civilizations survive. In a very large universe, even tiny fractions are numerous.",
      disagree: "This is option A of the trilemma. It is a grim bet: if you are right, humanity is probably headed for extinction before reaching maturity.",
    },
  },
  {
    key: "fI", chip: "Motivation", tag: "Premise 3 of 4",
    q: "If they could, would they actually create enormous numbers of conscious simulations?",
    ctx: "Posthuman civilizations might run “ancestor simulations” for research, history, entertainment, or reasons we can't imagine. But they might also find it unethical, boring, or pointless, and just not do it. It takes only a small fraction of such civilizations (or individuals) to produce huge numbers.",
    opts: {
      agree: ["Yes, a good number would", "Curiosity about origins and history is a strong motive."],
      disagree: ["Almost none would", "Ethical constraints or lack of interest would nearly always prevail."],
    },
    reflect: {
      agree: "You've accepted that simulating is at least fairly common among those who can.",
      disagree: "This is option B of the trilemma. Note the strength required: not “most don't”, but “nearly all of them, always”, since a rare exception can run vast numbers.",
    },
  },
  {
    key: "N", chip: "Numbers", tag: "Premise 4 of 4",
    q: "If some did, would simulated observers vastly outnumber biological ones?",
    ctx: "A single computer of planetary scale could run an astronomical number of human-like minds. One biological civilization has one history. One simulating civilization could host millions of simulated ones, each full of people.",
    opts: {
      agree: ["Yes, simulations would be cheap and plentiful", "Millions of runs per civilization is plausible."],
      disagree: ["No, simulations would stay rare", "Costs or limits would keep the numbers small."],
    },
    reflect: {
      agree: "This is the engine of the argument. Multiplication by large numbers can swamp even tiny fractions from the earlier steps.",
      disagree: "That is a way out of the argument via option B: simulations exist, but not in numbers that overwhelm the originals.",
    },
  },
  {
    key: "self", chip: "You", tag: "The Inference",
    q: "Given all that, where should you expect yourself to be?",
    ctx: "Suppose the share of simulated observers is what you just estimated. You have no direct evidence about which kind of observer you are. Bostrom's “indifference principle”: your credence that you are simulated should match the share of observers like you who are.",
    dynamic: true,
    opts: {
      agree: ["Match the share", "With no distinguishing evidence, treat myself as a random observer."],
      disagree: ["I have reasons to think I'm biological", "My own experience is evidence the numbers don't capture."],
    },
    reflect: {
      agree: "That is the step that turns a statistic into a personal conclusion.",
      disagree: "You're declining to apply the statistic to yourself. Just be ready to say what that special evidence is, since a simulated person could say the same words.",
    },
  },
];

/* ---------- State ---------- */
const KEY = "simarg.v1";
let state = { answers: {}, step: -1, custom: null };
try { Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

/* ---------- Computation ---------- */
function paramsFrom(answers) {
  const p = {};
  for (const k of Object.keys(VALUES)) p[k] = VALUES[k][answers[k]];
  return p;
}
function compute(p) {
  const x = p.fP * p.fI * p.N;
  const fsim = p.c * (x / (x + 1));
  return { x, fsim };
}
function classify(p) {
  const { x } = compute(p);
  if (p.c < 0.1) return "noSim";
  if (x >= 10 && p.c >= 0.5) return "C";
  if (x < 0.1) return p.fP < 1e-3 ? "A" : "B";
  return "mixed";
}
const core = ["c", "fP", "fI", "N"];
const complete = () => core.every(k => state.answers[k]);

function pct(f) {
  if (f >= 0.9999) return ">99.99%";
  if (f < 0.0001) return "<0.01%";
  const v = f * 100;
  return (v >= 10 ? v.toFixed(0) : v.toFixed(1)) + "%";
}
function ratio(x) {
  if (x >= 1000) return "about " + Math.round(x).toLocaleString() + " to 1";
  if (x >= 1) return "about " + x.toFixed(1) + " to 1";
  if (x > 0.001) return "about 1 to " + Math.round(1 / x);
  return "vanishingly few";
}

/* ---------- Rendering ---------- */
const $ = id => document.getElementById(id);
const stage = $("stage");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function go(step) {
  state.step = step; save(); render();
  window.scrollTo({ top: 0 });
  stage.focus({ preventScroll: true });
}

function render() {
  renderChips();
  renderGauge();
  if (state.step < 0) return renderIntro();
  if (state.step >= STEPS.length) return renderResult();
  renderStep(STEPS[state.step]);
}

function renderChips() {
  const el = $("chips");
  el.innerHTML = STEPS.map((s, i) => {
    const a = state.answers[s.key];
    const reachable = i === 0 || state.answers[STEPS[i - 1].key] || a;
    const cur = state.step === i ? " current" : "";
    return `<button class="chip ${a || ""}${cur}" data-i="${i}" ${reachable ? "" : "disabled"}>${esc(s.chip)}</button>`;
  }).join("") + (complete() ? `<button class="chip${state.step >= STEPS.length ? " current" : ""}" data-i="${STEPS.length}" ${state.answers.self ? "" : "disabled"}>Trilemma</button>` : "");
  el.querySelectorAll(".chip:not([disabled])").forEach(b => b.onclick = () => go(+b.dataset.i));
}

function renderGauge() {
  const g = $("gauge");
  if (!complete()) {
    const n = core.filter(k => state.answers[k]).length;
    g.innerHTML = `<div class="gauge-in">Your position so far: ${n} of 4 premises answered. The running estimate appears once you've weighed all four.</div>`;
    return;
  }
  const { fsim, x } = compute(paramsFrom(state.answers));
  g.innerHTML = `<div class="gauge-in"><strong>Share of observers like us who are simulated, given your answers: ${pct(fsim)}</strong>
    <div class="meter" role="img" aria-label="${pct(fsim)} simulated"><i style="width:${Math.max(fsim * 100, 0.5)}%"></i></div></div>`;
}

function renderIntro() {
  stage.innerHTML = `<section class="step">
    <div class="tag">An argument you complete yourself</div>
    <h1>Are you living in a simulation?</h1>
    <p>In 2003 the philosopher Nick Bostrom argued that at least one of three unlikely-sounding things must be true. He didn't claim we are simulated. He claimed you can't comfortably deny all three.</p>
    <p>This site won't hand you the conclusion. You'll face the argument one premise at a time and say whether you <em>agree</em> or <em>disagree</em>. The numbers underneath update as you go, so you can see exactly which of your beliefs carry the weight.</p>
    <p class="muted">Five questions. About five minutes. You can go back and change any answer.</p>
    <div class="row"><button class="btn" id="begin">Begin</button>${state.answers.self ? '<button class="btn ghost" id="jump">Jump to my result</button>' : ""}</div>
  </section>`;
  $("begin").onclick = () => go(0);
  if ($("jump")) $("jump").onclick = () => go(STEPS.length);
}

function renderStep(s) {
  const chosen = state.answers[s.key];
  const dyn = s.dynamic && complete()
    ? `<p class="ctx"><strong>From your answers:</strong> there would be ${ratio(compute(paramsFrom(state.answers)).x)} simulated to biological observers (${pct(compute(paramsFrom(state.answers)).fsim)} of all observers simulated).</p>` : "";
  const last = s.key === "self";
  stage.innerHTML = `<section class="step">
    <div class="tag">${esc(s.tag)}</div>
    <h2>${esc(s.q)}</h2>
    <p class="ctx">${esc(s.ctx)}</p>${dyn}
    <div class="choices" role="group" aria-label="Your answer">
      ${["agree", "disagree"].map(k => `<button class="choice ${k}${chosen === k ? " sel" : ""}" data-k="${k}" aria-pressed="${chosen === k}">
        <span class="k">${esc(s.opts[k][0])}</span><small>${esc(s.opts[k][1])}</small></button>`).join("")}
    </div>
    ${chosen ? `<div class="reflect"><div class="tag">What this means</div><p>${esc(s.reflect[chosen])}</p></div>
      <div class="row"><button class="btn" id="next">${last ? "See the trilemma" : "Continue"}</button></div>` : ""}
  </section>`;
  stage.querySelectorAll(".choice").forEach(b => b.onclick = () => {
    state.answers[s.key] = b.dataset.k; state.custom = null; save(); render();
  });
  if (chosen) $("next").onclick = () => go(state.step + 1);
}

function renderResult() {
  const p = state.custom || paramsFrom(state.answers);
  const { fsim, x } = compute(p);
  const cls = classify(p);
  const cred = state.answers.self;
  let yours;
  if (cred === "agree") yours = `Applying the indifference principle, your credence that you are simulated comes out at <strong>${pct(fsim)}</strong>.`;
  else yours = `You exempt yourself from the statistic, so your credence rests on whatever evidence you think distinguishes you, not on the <strong>${pct(fsim)}</strong> share.`;

  const verdicts = {
    noSim: "Your answer to Premise 1 sidesteps the trilemma altogether: if simulated beings can't be conscious, there are no simulated observers to count. This is the one assumption Bostrom doesn't defend.",
    A: "Your answers commit you to <strong>A</strong>: civilizations almost never reach the posthuman stage. Defending that means believing humanity probably won't last.",
    B: "Your answers commit you to <strong>B</strong>: posthuman civilizations almost never run enormous numbers of ancestor simulations. Defending that means believing nearly every advanced mind refrains, forever.",
    C: "Your answers commit you to <strong>C</strong>: simulated observers vastly outnumber biological ones. And if you accept the indifference step, you should take seriously that you are one of them.",
    mixed: "Your answers spread across the options. No single branch of the trilemma clearly wins, so you're hedging between them, which is a legitimate place to be.",
  };

  // sensitivity: flip each premise holding others fixed
  const rows = core.map(k => {
    const cells = ["agree", "disagree"].map(opt => {
      const pp = { ...paramsFrom(state.answers) };
      pp[k] = VALUES[k][opt];
      return `<td class="${state.answers[k] === opt && !state.custom ? "now" : ""}">${pct(compute(pp).fsim)}</td>`;
    }).join("");
    return `<tr><th scope="row">${esc(STEPS.find(s => s.key === k).chip)}</th>${cells}</tr>`;
  }).join("");

  const sl = (id, label, min, max, val, step) =>
    `<label for="${id}">${label}: <span id="${id}-v"></span></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">`;

  stage.innerHTML = `<section class="step">
    <div class="tag">The Trilemma</div>
    <h2>At least one of these is true</h2>
    <div class="trilemma">
      <div class="card A${cls === "A" ? " on" : ""}"><h3>A. The doom option</h3>Civilizations almost never reach the posthuman stage.</div>
      <div class="card B${cls === "B" ? " on" : ""}"><h3>B. The abstention option</h3>Posthuman civilizations almost never run enormous numbers of ancestor simulations.</div>
      <div class="card C${cls === "C" ? " on" : ""}"><h3>C. The simulation option</h3>Simulated observers vastly outnumber biological observers.</div>
    </div>
    <p>${verdicts[cls]}</p>
    <div class="reflect"><div class="big">${pct(fsim)}</div>of observers simulated. ${yours}</div>

    <h3>What would change it?</h3>
    <p class="muted">Share of simulated observers if you changed one answer and kept the others. Your actual answer is highlighted.</p>
    <table><thead><tr><th></th><th>If you agreed</th><th>If you disagreed</th></tr></thead><tbody>${rows}</tbody></table>

    <h3>Try your own numbers</h3>
    <div class="sliders">
      ${sl("s-c", "Chance simulated minds can be conscious (%)", 0, 100, Math.round(p.c * 100), 1)}
      ${sl("s-fP", "Civilizations reaching posthuman stage (log₁₀)", -9, 0, Math.log10(p.fP).toFixed(1), 0.1)}
      ${sl("s-fI", "…of which run many simulations (log₁₀)", -9, 0, Math.log10(p.fI).toFixed(1), 0.1)}
      ${sl("s-N", "Simulated histories per such civilization (log₁₀)", -1, 9, Math.log10(p.N).toFixed(1), 0.1)}
    </div>

    <p class="muted" style="margin-top:28px">Notice the pattern: the argument doesn't need you to believe in simulations. It needs you to find a way to reject <em>all three</em> branches. Weigh how comfortable you are denying each. Critics also challenge the hidden steps: whether consciousness is substrate independent, whether indifference reasoning is valid, and whether simulations are computationally feasible.</p>
    <div class="row"><button class="btn ghost" id="back">Revisit my answers</button><button class="btn ghost" id="again">Start over</button></div>
  </section>`;

  const wire = () => {
    const read = id => +$(id).value;
    const q = { c: read("s-c") / 100, fP: 10 ** read("s-fP"), fI: 10 ** read("s-fI"), N: 10 ** read("s-N") };
    $("s-c-v").textContent = Math.round(q.c * 100) + "%";
    $("s-fP-v").textContent = q.fP < 0.001 ? q.fP.toExponential(1) : (q.fP * 100).toPrecision(2) + "%";
    $("s-fI-v").textContent = q.fI < 0.001 ? q.fI.toExponential(1) : (q.fI * 100).toPrecision(2) + "%";
    $("s-N-v").textContent = q.N >= 10 ? Math.round(q.N).toLocaleString() : q.N.toPrecision(2);
    return q;
  };
  wire();
  ["s-c", "s-fP", "s-fI", "s-N"].forEach(id => $(id).oninput = () => {
    const q = wire();
    state.custom = q;
    const r = compute(q);
    document.querySelector(".big").textContent = pct(r.fsim);
    document.querySelectorAll(".card").forEach(c => c.classList.toggle("on", c.classList.contains(classify(q))));
    $("gauge").querySelector("strong").textContent = "Share of observers like us who are simulated, with your adjusted numbers: " + pct(r.fsim);
    $("gauge").querySelector("i").style.width = Math.max(r.fsim * 100, 0.5) + "%";
  });
  $("back").onclick = () => { state.custom = null; go(0); };
  $("again").onclick = reset;
}

function reset() {
  state = { answers: {}, step: -1, custom: null }; save(); render();
  window.scrollTo({ top: 0 });
}
$("reset").onclick = reset;

/* Only keep a resumed position if it's still valid. */
if (state.step >= STEPS.length && !(complete() && state.answers.self)) state.step = -1;
render();
