import React from "react";
import { DndProvider, useDragLayer, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Aspects from "../aspects.json";
// import { apiCall } from "../api_stub/api_stub.jsx";
import { marked, parse } from "marked";
import Parser from "html-react-parser";
import Button from "react-bootstrap/Button";
//import { renderer } from "./md_extension.jsx";
// import items from "../server/items.json";
import "./textbox.css";

export function TextBox({
  story,
  tempStory,
  dragItemType,
  useCard,
  setGameLoaded,
}) {
  const [storyMD, setStoryMD] = React.useState("");
  const [tempStoryMD, setTempStoryMD] = React.useState("");
  const [showResults, setShowResults] = React.useState(false);
  const parseMD = async (sections, setFunc, setShowResults) => {
    // console.log("Parsing MD", sections);
    // Check if anything in story doesn't have the rendered flag
    if (sections.length == 0) {
      return `No story elements found.`;
    }
    // Check if anything in story doesn't have the rendered flag
    if (sections.every((elem) => elem.rendered)) {
      return `Everything has been rendered.`;
    }

    let _story = [...sections];
    //_story.push({ type: "turn", playerTurnName: currentPlayerName });
    let s = "";
    for (let i = 0; i < _story.length; i++) {
      if (_story[i].rendered) {
        continue;
      }
      const {
        type,
        playerTurnName = "",
        title = "",
        text = [],
        results: resultArr = [],
      } = _story[i];
      switch (type) {
        case "intro":
          s += `<h3 class="title">${title}</h3>\n\n`;
          break;
        case "turn":
          s += `<h5 class="playerTurn">${playerTurnName}'s Turn</h5>\n\n`;
          break;
        case "ending":
          setShowResults(true);
          s += `<h3 class="title">${"Ending"}</h3>\n\n`;
        case "empty":
          break;
      }
      s += `${text.join("\n\n")}\n\n`;
      for (let j = 0; j < resultArr.length; j++) {
        const { type: resultType, item, amt, aspect } = resultArr[j];
        switch (resultType) {
          case "aspect-points":
            s += `<b style="color: ${Aspects[aspect].color}">+${amt} ${Aspects[aspect].text}</b>\n\n`;
            break;
          case "item-obtained":
            s += `<i class= "item">${item ? item.name : `❔`} obtained</i>\n\n`;
            break;
        }
      }
      _story[i].rendered = true;
    }
    setFunc(s);
  };
  React.useEffect(() => {
    parseMD(story, setStoryMD, setShowResults);
  }, [story]);

  React.useEffect(() => {
    parseMD([tempStory], setTempStoryMD, setShowResults);
  }, [tempStory]);

  React.useEffect(() => {
    const textScroll = document.getElementById("textScroll");
    textScroll.scrollTop = textScroll.scrollHeight;
  }, [storyMD, tempStoryMD]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: dragItemType,
    drop(item, monitor) {
      // console.log(item);

      useCard(item);
      return undefined;
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  // React.useEffect(() => {
  //   async
  //   parseMD();
  // }, [story]);

  function TextAdvText({ storyMD, tempStoryMD, showResults }) {
    return (
      <div className="textbox-text-and-button-container">
        <div className="text-adventure-text" id="parsedMD">
          {Parser(marked.parse(storyMD))}
        </div>
        <div className="text-adventure-text" id="parsedMDTemp">
          {Parser(marked.parse(tempStoryMD))}
        </div>
        {showResults ? (
          <Button
            className="textbox-button"
            onClick={() => setGameLoaded(false)}
          >
            Finish Game
          </Button>
        ) : (
          <></>
        )}
      </div>
    );
  }

  return (
    <div className={`text-adventure-container`} ref={drop}>
      <div
        className={`text-adventure ${isOver ? "is-over" : "not-over"} ${
          isOver ? "is-over-grow" : ""
        }`}
        id="textScroll"
      >
        <TextAdvText
          storyMD={storyMD}
          tempStoryMD={tempStoryMD}
          showResults={showResults}
        />
      </div>
      {isDragging ? (
        <div className={`drag-drop-overlay ${isOver ? "is-over-grow" : ""}`}>
          <h1>Drag Card Here</h1>
        </div>
      ) : (
        <div style={{ display: "none" }}></div>
      )}
    </div>
  );
}
