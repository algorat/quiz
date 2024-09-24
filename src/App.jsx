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
    <div>
      <fieldset>
        <legend>{question}</legend>
        {answers.map(({ response, traits }, aIdx) => {
          const id = `question${qIdx}, response${aIdx}`;
          const onClick = () => {
            nextQuestion(traits);
          };
          return (
            <div key={id}>
              <input
                type="radio"
                id={id}
                name={qIdx}
                onClick={onClick}
                key={id}
              ></input>
              <label htmlFor={id}>{response}</label>
            </div>
          );
        })}
      </fieldset>
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
    <div>
      <h2>You are the {result.name}</h2>
      <p>{result.description}</p>
      <ul>
        {highestTraits.map((trait) => {
          return <ol>{trait[0]}</ol>;
        })}
      </ul>
      <p>You are {feralNess * 100}% feral</p>
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

  if (currentQuestion >= data.questions.length) {
    return <Result traits={currentTraits} />;
  }

  return (
    <main>
      <Question
        questionData={data.questions[currentQuestion]}
        qIdx={currentQuestion}
        nextQuestion={nextQuestion}
      />
    </main>
  );
}
