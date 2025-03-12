import React from "react";
import { DndProvider, useDragLayer, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Aspects } from "../aspects.jsx";
import { apiCall } from "../api_stub/api_stub.jsx";
import { marked } from "marked";
//import { renderer } from "./md_extension.jsx";
import "./textbox.css";
import {
  initTextbox,
  setTextboxPushFunc,
  setTextboxSetCurrentTurnFunc,
} from "../server/server.jsx";

export function TextBox({
  dragItemType,
  heroData,
  initialPlayerName,
  useCard,
}) {
  const [story, setStory] = React.useState([]);
  const [currentPlayerName, setCurrentPlayerName] =
    React.useState(initialPlayerName);
  setTextboxPushFunc((storyElem) => {
    console.log("Pushing story element", storyElem);
    let storyCopy = [...story];
    storyCopy.push(storyElem);
    setStory(storyCopy);
  });
  const [isSetupComplete, setIsSetupComplete] = React.useState(false);
  React.useEffect(() => {
    if (!isSetupComplete) {
      const { init_story, init_name } = initTextbox();
      setStory(init_story);
      setCurrentPlayerName(init_name);
      setIsSetupComplete(true);
    }
  }, []);

  setTextboxSetCurrentTurnFunc((playerTurnName) => {
    setCurrentPlayerName(playerTurnName);
  });
  const heroName = heroData.heroName;
  const heroGender = heroData.heroGender;

  const pronouns = {
    They: {
      male: "He",
      female: "She",
      other: "They",
    },
    Their: {
      male: "His",
      female: "Her",
      other: "Their",
    },
    Theirs: {
      male: "His",
      female: "Hers",
      other: "Theirs",
    },
    Them: {
      male: "Him",
      female: "Her",
      other: "Them",
    },
    they: {
      male: "he",
      female: "she",
      other: "they",
    },
    their: {
      male: "his",
      female: "her",
      other: "their",
    },
    theirs: {
      male: "his",
      female: "hers",
      other: "theirs",
    },
    them: {
      male: "him",
      female: "her",
      other: "them",
    },
  };

  const insertRegex = /\$([^$]*)\$/g;

  function parseMD() {
    let _story = [...story];
    _story.push({ type: "turn", playerTurnName: currentPlayerName });
    let s = "";
    for (let i = 0; i < _story.length; i++) {
      const {
        type,
        playerTurnName,
        title,
        text = [],
        result: resultArr = [],
      } = _story[i];
      switch (type) {
        case "intro":
          s += `<h3 class="title">${title}</h3>\n\n`;
          break;
        case "turn":
          s += `<h5 class="playerTurn">${playerTurnName}'s Turn</h5>\n\n`;
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
            s += `<i class= "item">${item} Obtained</i>\n\n`;
        }
      }
    }
    const matches = s.match(insertRegex);
    if (matches) {
      for (let j = 0; j < matches.length; j++) {
        const m = matches[j];
        let r = "DEFAULT REPLACE";
        switch (m) {
          case "$n$":
            r = heroName;
            break;
          case "$They$":
            r = pronouns.They[heroGender];
            break;
          case "$Their$":
            r = pronouns.Their[heroGender];
            break;
          case "$Theirs$":
            r = pronouns.Theirs[heroGender];
            break;
          case "$Them$":
            r = pronouns.Them[heroGender];
            break;
          case "$they$":
            r = pronouns.they[heroGender];
            break;
          case "$their$":
            r = pronouns.their[heroGender];
            break;
          case "$theirs$":
            r = pronouns.theirs[heroGender];
            break;
          case "$them$":
            r = pronouns.them[heroGender];
            break;
          default:
            r = apiCall(m);
            break;
        }
        s = s.replace(`${m}`, r);
      }
    }

    //marked.use(renderer);

    // Run marked
    document.getElementById("parsedMD").innerHTML = marked.parse(s);

    const elem = document.getElementById("textScroll");
    elem.scrollTop = elem.scrollHeight;
  }

  const [{ isOver }, drop] = useDrop(() => ({
    accept: dragItemType,
    drop(item, monitor) {
      console.log(item);

      useCard(item);
      return undefined;
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  React.useEffect(parseMD, [story]);

  return (
    <div className={`text-adventure-container`} ref={drop}>
      <div
        className={`text-adventure ${isOver ? "is-over" : "not-over"} ${
          isOver ? "is-over-grow" : ""
        }`}
        id="textScroll"
      >
        <div className="text-adventure-text" id="parsedMD"></div>
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
