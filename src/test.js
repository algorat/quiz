// Let's make sure all result paths are achieveable and somewhat balanced...

import data from "./questions.json";

import { computeHighestMatch, updateTraits } from "./scoring";

function combineDicts(a, b) {
  const c = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (k in c) {
      c[k] += v;
    } else {
      c[k] = v;
    }
  }
  return c;
}

function shuffleArray(arr) {
  const copy = [...arr];
  return copy.sort((a, b) => Math.random() - 0.5);
}

export function recursiveCount(currentTraits, questionIdx) {
  if (questionIdx >= data.questions.length) {
    // end of recursion, return the match.
    const match = computeHighestMatch(currentTraits);
    const r = {};
    r[match.id] = 1;
    return r;
  }

  const { answers } = data.questions[questionIdx];
  const randomlySelectedAnswers = shuffleArray(answers).slice(0, 1);
  const rAnswers = randomlySelectedAnswers.map((answer) => {
    const { traits } = answer;
    const newTraits = updateTraits(currentTraits, traits);
    return recursiveCount(newTraits, questionIdx + 1);
  });

  let combined = {};
  for (const a of rAnswers) {
    combined = combineDicts(combined, a);
  }
  return combined;
}

function randomSampling() {
  let combined = {};
  for (let i = 0; i < 10000000; i++) {
    const result = recursiveCount({}, 0);
    combined = combineDicts(combined, result);
  }
  console.log(combined);
}
