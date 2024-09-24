import data from "./questions.json";
import ratTypes from "./rat-types.json";

const testdata = {
  "finer things in life": 5,
  "non-confrontational": 5,
  traditional: 5,
  "so smart": 5,
  literate: 0,
  planner: 5,
  curious: 5,
  "free-thinker": 15,
  "creature of habit": 10,
  "risk-taker": 0,
  demanding: 10,
  smelly: 15,
  maverick: 20,
  feral: 13,
  indecisive: 5,
  collector: 5,
  "community-oriented": 5,
  friendly: 0,
  "out of touch": 5,
  armor: 10,
  charisma: 10,
  "trying their best": 4,
  shame: 10,
  mysterious: 50,
  hater: 10,
};

function sumData() {
  const traitMap = {};
  for (const question of data.questions) {
    const { answers } = question;
    for (const answer of answers) {
      const { traits } = answer;
      for (const [key, value] of Object.entries(traits)) {
        if (traitMap[key]) {
          traitMap[key] += value;
        } else {
          traitMap[key] = value;
        }
      }
    }
  }
  return traitMap;
}

const maxScores = sumData();

function defaultScoring(targetTraits, traits) {
  const scores = [];
  for (const trait of targetTraits) {
    let score = traits[trait] ?? 0;
    const maxScore = maxScores[trait];
    if (!maxScore) {
      console.error("invalid attribute", trait);
    }
    scores.push(score / maxScore);
  }
  const totalScore = scores.reduce((a, b) => a + b, 0);
  return (totalScore / scores.length) * 100;
}

function trueRatScoring(traits) {
  const mysteryScore = traits["feral"];
  if (!mysteryScore || mysteryScore < 40) {
    return 0;
  }
  return mysteryScore + 50;
}

function doesntKnowScoring(traits) {
  for (const v of Object.values(traits)) {
    if (v > 15) {
      return 0;
    }
  }
  return 100;
}

function notRatScoring(traits) {
  const mysteryScore = traits["mysterious"];
  if (!mysteryScore || mysteryScore < 40) {
    return 0;
  }
  for (const [k, v] of Object.entries(traits)) {
    if (v > 20 && k !== "mysterious") {
      return 0;
    }
  }
  return mysteryScore + 50;
}

function grudgeScoring(traits) {
  const hateScore = traits["hater"];
  const nonConfScore = traits["non-confrontational"];
  const collectorScore = traits["collector"];

  const maxHateScore = maxScores["hater"];
  const maxNonConfScore = maxScores["non-confrontational"];
  const maxCollectorScore = maxScores["collector"];

  if (!hateScore || hateScore / maxHateScore < 0.6) {
    return 0;
  }
  if (!nonConfScore || nonConfScore / maxNonConfScore < 0.5) {
    return 50;
  }
  if (!collectorScore || collectorScore / maxCollectorScore < 0.5) {
    return 70;
  }
  return 100;
}

function fourScoring(traits) {
  const maverickScore = traits["maverick"];
  const finerScore = traits["finer things in life"];

  const maxMaverickScore = maxScores["maverick"];
  const maxFinerScore = maxScores["finer things in life"];

  if (!maverickScore || maverickScore / maxMaverickScore < 0.5) {
    return 0;
  }
  if (finerScore !== undefined && finerScore / maxFinerScore > 0.3) {
    return 60;
  }
  return (maverickScore / maxMaverickScore) * 100 + 50;
}

function deceitScoring(traits) {
  const honestScore = traits["honest"];
  const charismaScore = traits["charisma"];
  const criminalScore = traits["criminal"];

  const maxHonestScore = maxScores["honest"];
  const maxCharismaScore = maxScores["charisma"];
  const maxCriminalScore = maxScores["criminal"];

  if (charismaScore === undefined || charismaScore / maxCharismaScore < 0.6) {
    return 25;
  }

  if (honestScore !== undefined && honestScore / maxHonestScore > 0.2) {
    return 40;
  }

  return (criminalScore / maxCriminalScore) * 100;
}

function itchyScoring(traits) {
  const hateScore = traits["hater"];
  const nonConfScore = traits["non-confrontational"];

  const maxHateScore = maxScores["hater"];
  const maxNonConfScore = maxScores["non-confrontational"];

  if (!hateScore || hateScore / maxHateScore < 0.6) {
    return 0;
  }
  if (nonConfScore !== undefined && nonConfScore / maxNonConfScore > 0.2) {
    return 50;
  }
  return (hateScore / maxHateScore) * 100 + 40;
}

function balanceScoring(traits) {
  const numTraits = Object.keys(traits).length;
  let sum = 0;
  for (const [k, v] of Object.entries(traits)) {
    sum += v;
  }
  const avg = sum / numTraits;

  // console.log("balance avg", avg);

  let matches = 0;
  for (const v of Object.values(traits)) {
    if (Math.abs(avg - v) < 2.3) {
      matches++;
    }
  }
  return (matches / numTraits) * 100;
}

const scoringFunctions = {
  notrat: notRatScoring,
  truerat: trueRatScoring,
  grudge: grudgeScoring,
  balance: balanceScoring,
  itch: itchyScoring,
  four: fourScoring,
  deceit: deceitScoring,
  doesntknow: doesntKnowScoring,
};

export function computeHighestMatch(traits) {
  let maxScore = 0;
  let maxMatch = null;

  // We don't use this but keep track for testing.
  const debuggingScores = {};

  // We want to grab this one as a fallback answer.
  let notARat = null;

  for (const ratType of ratTypes.types) {
    const id = ratType.id;
    let score = 0;
    if (id in scoringFunctions) {
      const func = scoringFunctions[id];
      score = func(traits);
    } else if (ratType.attributes) {
      score = defaultScoring(ratType.attributes, traits);
    } else {
      console.warn("no way to score:", id);
    }

    debuggingScores[id] = score;

    // TODO(connie): randomize if it's a tie.
    if (score > maxScore) {
      maxScore = score;
      maxMatch = ratType;
    }

    if (id === "notrat") {
      notARat = ratType;
    }
  }

  // console.log("debuggingScores", debuggingScores);

  if (maxMatch === null) {
    console.warn("no match?");
    return notARat;
  } else {
    return maxMatch;
  }
}

export function computeHighestTraits(traits) {
  const entries = Object.entries(traits);
  const sorted = entries.sort((a, b) => {
    return b[1] - a[1];
  });
  return sorted.slice(0, 5);
}

export function percentFeral(traits) {
  const feral = traits["feral"];
  const maxFeral = maxScores["feral"];
  return feral / maxFeral;
}

export function updateTraits(currentTraits, addedTraits) {
  const newTraits = { ...currentTraits };
  for (const trait of Object.entries(addedTraits)) {
    const [key, value] = trait;
    newTraits[key.toLowerCase()] = newTraits[key]
      ? newTraits[key] + value
      : value;
  }
  return newTraits;
}
