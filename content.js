"use strict";

/* Illustrative values each answer assigns to the model's quantities (see app.js). */
const VALUES = {
  c:  { agree: 0.95, unsure: 0.5,   disagree: 0.02 },
  fP: { agree: 0.3,  unsure: 0.02,  disagree: 1e-9 },
  fI: { agree: 0.1,  unsure: 0.005, disagree: 1e-7 },
  N:  { agree: 1e6,  unsure: 1e3,   disagree: 0.5 },
};

const NOT_SURE = { id: "unsure", label: "I'm not sure",
  arg: "That's an honest place to stand. Your answer is recorded as a midpoint: neither dismissing the premise nor trusting it. Everything downstream will reflect that doubt.",
  reply: "" };

/* arg = strongest version of the objection; reply = how a defender of the argument responds. */
const STEPS = [
  {
    key: "c", name: "Consciousness", tag: "Premise 1 of 4",
    q: "Could a computer simulation be conscious?",
    ctx: "If a sufficiently advanced civilization could accurately reproduce the relevant processes of a human brain, would the resulting simulated person actually be conscious?",
    why: "The argument counts observers. If simulated people aren't conscious, nobody is inside to be fooled, and there is nothing to count.",
    deeper: "Bostrom assumes “substrate independence”: what matters for a mind is the structure of its information processing, not the material it runs on. Functionalists accept this. Others tie consciousness to biology or to physical causation that digital hardware lacks. Bostrom treats it as an assumption, not something he proves.",
    objection: "A simulated storm soaks no one. Computation is symbol manipulation, and consciousness may need the specific causal powers of brains (Searle), or a physical structure digital hardware doesn't have (integrated information theory).",
    forAgree: "Replace your neurons one at a time with functionally identical chips. It is hard to say when your experience would fade, since your reports and behavior never change. If it doesn't fade, the substrate doesn't matter (Chalmers' “fading qualia”).",
    objections: [
      { id: "notreal", label: "A simulation isn't the real thing",
        arg: "Simulating a process isn't the process. A simulated fire doesn't burn; a simulated digestion digests nothing. Consciousness may be like that: a physical phenomenon, not a pattern.",
        reply: "Fire is defined by physical effects; minds may be defined by information processing. Whether consciousness is more like “computing a sum” or “burning” is exactly what's disputed." },
      { id: "bio", label: "Consciousness needs biology or physics we don't understand",
        arg: "Brains might depend on things like quantum effects or electromagnetic fields, or on integrated causal structure (IIT), that digital computers lack however they're programmed.",
        reply: "Then a sufficiently faithful simulation, down to those physical processes, would include them. The question becomes cost, not possibility." },
      { id: "impossible", label: "The required technology may be physically impossible",
        arg: "Accurately modelling a brain might need more precision than physics allows, or energy and memory far beyond anything buildable.",
        reply: "We only need it to be possible somewhere in a very large universe, and only at the resolution that matters to experience, which may be coarse." },
      { id: "verify", label: "We could never know, so the premise is empty",
        arg: "We cannot check a machine's inner life from outside. A premise nobody can test shouldn't carry an argument.",
        reply: "The same is true of other humans. We attribute minds on structural and behavioral grounds, and a faithful brain copy would meet them all." },
    ],
  },
  {
    key: "fP", name: "Survival", tag: "Premise 2 of 4",
    q: "Could civilizations survive long enough to build such machines?",
    ctx: "Running a convincing simulated world takes computing power far beyond ours. Do civilizations like ours tend to get there, or do they usually collapse or stall first?",
    why: "Without any posthuman civilizations there are no simulators. Option A of the trilemma lives here.",
    deeper: "This is Robin Hanson's “Great Filter”: the Fermi paradox (why is the sky silent?) suggests some step between dead matter and an expanding civilization is very hard to pass. If that step is still ahead of us, option A is plausible. Note the argument only needs a tiny fraction to make it.",
    objection: "The silence of the cosmos suggests civilizations don't make it. And existential risks (engineered pandemics, nuclear war, unaligned AI) compound over centuries. Surviving long enough to become posthuman may be very unlikely.",
    forAgree: "The universe is vast: only a sliver of civilizations needs to survive. And risk need not compound forever, because the technologies that create risk also create the means to manage it.",
    objections: [
      { id: "filter", label: "Civilizations probably won't survive long enough",
        arg: "The Fermi paradox is evidence of a filter. If it lies ahead of us, nearly every civilization, including ours, fails before maturity.",
        reply: "The filter could just as well be behind us (life or intelligence being rare). And a filter ahead only blocks the argument if it stops essentially everyone." },
      { id: "physics", label: "The required technology may be physically impossible",
        arg: "Planet-scale computation could hit hard limits: heat, energy supply, speed of light.",
        reply: "Physical limits computed by Bostrom and others leave an enormous gap between those limits and what a few simulated minds need." },
      { id: "stagnate", label: "Societies stagnate or turn inward before getting there",
        arg: "Technological progress isn't inevitable. Cultures may choose stability, or resource limits may stall growth well short of posthumanity.",
        reply: "Only one branch needs to keep going, and a single expansionist subculture is enough." },
    ],
  },
  {
    key: "fI", name: "Motivation", tag: "Premise 3 of 4",
    q: "Would they actually create vast numbers of simulated worlds?",
    ctx: "Suppose posthuman civilizations exist. Would they use their power to run detailed simulations of their ancestors, for research, history, art, entertainment, or reasons we can't guess?",
    why: "Being able to simulate isn't doing it. Option B of the trilemma says they almost never bother.",
    deeper: "The claim needed here is strong in one direction: B requires that nearly every posthuman civilization, and nearly every individual in it, abstains. One enthusiast with a planet-sized computer is enough to produce huge numbers. Bostrom doesn't say they would, only that we can't confidently say they wouldn't.",
    objection: "Mature minds may converge on strong ethics: creating billions of beings without their consent, some of whom suffer, could be seen as monstrous. Or they simply find ancestor simulation pointless compared with other uses of resources.",
    forAgree: "We can't predict the values of beings so different from us, and the argument needs only a small fraction (or a few individuals) to run simulations. Humans already simulate worlds, histories and people in games and models today.",
    objections: [
      { id: "wouldnt", label: "Advanced civilizations wouldn't want to run simulations",
        arg: "Why would they? Real history is already recorded. Simulations may be a dull use of resources for beings with far richer options.",
        reply: "Our own curiosity about origins, and our love of games and fiction, make “no one ever wants to” a strong claim about all minds forever." },
      { id: "ethics", label: "It would be unethical, so they'd refrain",
        arg: "A simulated history contains suffering, wars and plagues. Knowingly creating billions of suffering people is a serious moral violation a wise civilization would forbid.",
        reply: "Option B really does rest on this. But it needs near-universal abstention, across all civilizations and all individuals, including those with different moral views." },
      { id: "resources", label: "Resources would go to better things",
        arg: "Compute, energy and attention are finite, and a posthuman civilization may have much higher priorities.",
        reply: "Posthuman resources are vast; even a tiny fraction yields enormous numbers of simulated people." },
    ],
  },
  {
    key: "N", name: "Numbers", tag: "Premise 4 of 4",
    q: "Would simulated people vastly outnumber biological ones?",
    ctx: "A single planet-sized computer could run enormous numbers of minds. One biological civilization has one history; a simulating one could host millions.",
    why: "This is the multiplier. If simulations are plentiful, even rare simulators swamp the real population.",
    deeper: "Bostrom estimates a planetary-mass computer could perform ~10^42 operations per second, while a human brain's relevant activity is roughly 10^14–10^17. Even devoting a tiny fraction of capacity to ancestor simulations would run vastly more human-like lives than have ever existed biologically.",
    objection: "Simulation fidelity is unknown. If experience needs near-atomic detail, each simulated person costs many orders of magnitude more. And the budget for ancestor simulations may be a small share of everything else a civilization does.",
    forAgree: "The multiplication is generous: even if each simulation costs a million times more than expected, a modest share of one planet-sized computer still runs far more minds than have ever lived. And the simulations needn't model everything, only what observers perceive.",
    objections: [
      { id: "numbers", label: "The numbers wouldn't necessarily work",
        arg: "We don't know the real cost of a conscious simulation. If it needs molecular fidelity, simulations stay rare and the ratio never tips.",
        reply: "Rendering only what's observed, and compressing the rest, cuts cost hugely. And the margin is so large that even big cost errors don't flip the result." },
      { id: "budget", label: "Only a small share of resources would go to this",
        arg: "Ancestor simulations may be a hobby. If the budget is small and each run is expensive, the total count of sims stays small.",
        reply: "The numbers needed are tiny compared with the capacity; it takes only a small share of a vast budget." },
      { id: "few", label: "Simulated worlds might hold few observers",
        arg: "Simulations might be narrow, a single person or a handful, rather than full civilizations.",
        reply: "That would still add many observers per simulating civilization, and many such civilizations would run it." },
    ],
  },
  {
    key: "self", name: "You", tag: "The Inference",
    q: "Should you treat yourself as a typical observer?",
    ctx: "If most observers with experiences like yours were simulated, and you have no evidence that you're one of the rest, how likely should you think it is that you are simulated?",
    why: "The earlier steps give a statistic about the world. This step turns it into a claim about you.",
    deeper: "Bostrom invokes a weak “principle of indifference”: absent distinguishing evidence, your credence should match the proportion of similar observers who are in each situation, as with any other reasoning about your place in a population. This is a form of anthropic reasoning, which is notoriously contested.",
    objection: "The “reference class” problem: which observers count as “like you”? And naive anthropic reasoning produces strange results elsewhere (the Doomsday Argument, the Presumptuous Philosopher), so we may not trust it here.",
    forAgree: "If 99% of people with your exact symptoms have a disease and nothing else distinguishes you, you'd believe you probably have it. Resisting means claiming evidence that simulated observers, by hypothesis, would share.",
    objections: [
      { id: "special", label: "My own experience is evidence I'm biological",
        arg: "I'm directly acquainted with my own existence. That's more than a statistic can override.",
        reply: "A simulated person would feel exactly the same acquaintance and say exactly the same words. It cannot discriminate between the cases." },
      { id: "refclass", label: "“Observers like me” is too vague to count",
        arg: "Counting only makes sense relative to a well-defined class, and the answer swings wildly with how you define it.",
        reply: "Real, and a genuine weakness. But the conclusion is robust across a range of reasonable classes, which is the strongest reply available." },
      { id: "anthropic", label: "Anthropic reasoning can't be trusted",
        arg: "Self-locating reasoning produces paradoxes. A method that gives silly answers elsewhere shouldn't underwrite a claim about reality.",
        reply: "Then every probabilistic claim about your place in the world is shaky, and some principle of this kind is hard to avoid." },
    ],
  },
];

/* Ordering shown to the user for each step's objection list: step-specific, then “not sure”. */
STEPS.forEach(s => s.objections.push(NOT_SURE));
