import { useState } from "react";
import "./App.css";
import data from "./questions.json";
import {
  computeHighestMatch,
  computeHighestTraits,
  percentFeral,
  updateTraits,
} from "./scoring";

import { recursiveCount } from "./test";

function Question({ questionData, qIdx, nextQuestion }) {
  const { question, answers } = questionData;

  return (
    <div className="question" role="radiogroup">
      <p role="legend">{question}</p>
      <div className="answers">
        {answers.map(({ response, traits }, aIdx) => {
          const id = `question${qIdx}, response${aIdx}`;
          const onClick = () => {
            nextQuestion(traits);
          };
          return (
            <button role="radio" key={id} id={id} name={qIdx} onClick={onClick}>
              {response}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Result({ traits }) {
  console.log("traits", traits);
  const result = computeHighestMatch(traits);
  const highestTraits = computeHighestTraits(traits);
  console.log("your match", result, traits);
  const feralNess = percentFeral(traits);
  return (
    <div className="result">
      <h2>You are the {result.name}</h2>
      <p>{result.description}</p>
      <ul>
        {highestTraits.map((trait) => {
          return <ol>{trait[0]}</ol>;
        })}
      </ul>
      <p>You are {feralNess * 100}% feral</p>
      <button onClick={() => window.location.reload()}>Reset Quiz</button>
    </div>
  );
}

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentTraits, setCurrentTraits] = useState({});
  const nextQuestion = (traits) => {
    const newTraits = updateTraits(currentTraits, traits);
    setCurrentTraits(newTraits);
    setCurrentQuestion(currentQuestion + 1);
  };

  let contents = '';

  if (currentQuestion >= data.questions.length) {
    contents = <Result traits={currentTraits} />;
  } else {
    contents = <Question
      questionData={data.questions[currentQuestion]}
      qIdx={currentQuestion}
      nextQuestion={nextQuestion}
    />
  }

  return (
    <main>
      <div className="console" />
      <div className="screen">
        {contents}
      </div>
    </main>
  );
}
