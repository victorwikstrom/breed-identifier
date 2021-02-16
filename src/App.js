import React, { useReducer, useState, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import { split } from "@tensorflow/tfjs";
import { getByDisplayValue } from "@testing-library/react";
import Header from "./Header.js";

const stateMachine = {
  initial: "initial",
  states: {
    initial: { on: { next: "loadingModel" } },
    loadingModel: { on: { next: "awaitingUpload" } },
    awaitingUpload: { on: { next: "ready" } },
    ready: { on: { next: "classifying" }, showImage: true },
    classifying: { on: { next: "complete" } },
    complete: {
      on: { next: "awaitingUpload" },
      showImage: true,
      showResults: true,
    },
  },
};

const reducer = (currentState, event) =>
  stateMachine.states[currentState].on[event] || stateMachine.initial;

// FORMATS THE CLASS NAME
const formatBreedName = (className) => {
  const splitString = className.split(" ");
  const stringResult =
    splitString.length > 2
      ? splitString.slice(0, 2).join(" ")
      : splitString.join(" ");

  return stringResult.slice(0, 1).toUpperCase() + stringResult.slice(1);
};

// RETURNS A FORMATTED RESULT ITEM
const getResultItem = ({ className, probability }) => {
  return (
    <div className="resultItem">
      <span className="resultHeading" key={className}>
        {formatBreedName(className)}
      </span>
      <div style={{ display: "flex", alignItems: "center", minWidth: "100%" }}>
        <div
          className="percentageBar"
          style={{ width: (probability * 100 + "%").toString() }}
        ></div>
        <span style={{ whiteSpace: "nowrap" }}>
          {(probability * 100).toFixed(2) + " %"}
        </span>
      </div>
      <div className="divider"></div>
    </div>
  );
};

function App() {
  tf.setBackend("cpu");

  const [state, dispatch] = useReducer(reducer, stateMachine.initial);
  const [model, setModel] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const inputRef = useRef();
  const imageRef = useRef();
  const [result, setResults] = useState([]);

  // TRIGGERS NEXT STATE
  const next = () => dispatch("next");

  // LOAD MODEL BUTTON CLICK EVENT
  const loadModel = async () => {
    next();
    const mobilenetModel = await mobilenet.load();
    setModel(mobilenetModel);
    next();
  };

  // UPLOAD BUTTON CLICK EVENT
  const handleUpload = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImageUrl(url);
      next();
    }
  };

  // IDENTIFY BUTTON CLICK EVENT
  const identify = async () => {
    next();
    const classificationResults = await model.classify(imageRef.current);
    setResults(classificationResults);
    next();
  };

  // RESET BUTTON CLICK EVENT
  const reset = () => {
    setResults([]);
    setImageUrl(null);
    next();
  };

  // PROPERTIES FOR ALL BUTTONS
  const buttonProps = {
    initial: { text: "Load model", action: loadModel },
    loadingModel: { text: "Loading model...", action: () => {} },
    awaitingUpload: {
      text: "Upload photo",
      action: () => inputRef.current.click(),
    },
    ready: { text: "Identify breed", action: identify },
    classifying: { text: "Identifying...", action: () => {} },
    complete: { text: "Reset", action: reset },
  };

  const { showImage = false, showResults = false } = stateMachine.states[state];

  return (
    <div className="container">
      <Header />
      <div style={{ display: "flex", margin: "30px 0" }}>
        {showImage && (
          <img src={imageUrl} alt="upload preview" ref={imageRef} />
        )}
        {showResults && (
          <div className="resultContainer">{result.map(getResultItem)}</div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        capture="camera"
        ref={inputRef}
        onChange={handleUpload}
      />
      <button onClick={buttonProps[state].action}>
        {buttonProps[state].text}
      </button>
    </div>
  );
}

export default App;
