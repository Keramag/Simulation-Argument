# Simulation Argument

An interactive walk through Nick Bostrom's simulation argument. Visitors answer each premise
(agree / disagree) and watch how their answers move the conclusion, ending at the
A / B / C trilemma with a sensitivity table and sliders to try their own numbers.

Static site, no build step: open `index.html` or run `python3 -m http.server`.

The model: `f_sim = c · x / (x + 1)` with `x = f_P · f_I · N` (see the comment atop `app.js`).
The values assigned to each answer are illustrative and live in `VALUES`.
