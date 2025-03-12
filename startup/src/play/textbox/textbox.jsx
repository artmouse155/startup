import React from "react";
import { DndProvider, useDragLayer, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Aspects } from "../aspects.jsx";
import { apiCall } from "../api_stub/api_stub.jsx";
import storyJSON from "./story.json";
import { marked } from "marked";
//import { renderer } from "./md_extension.jsx";
import "./textbox.css";
import { setTextboxPushFunc } from "../server/server.jsx";

export function TextBox({ dragItemType, heroData, playerID, useCard }) {
  const [story, setStory] = React.useState(storyJSON.sections);
  setTextboxPushFunc((storyElem) => {
    console.log("Pushing story element", storyElem);
    let storyCopy = [...story];
    storyCopy.push(storyElem);
    setStory(storyCopy);
  });
  const heroName = heroData.heroName;
  const heroGender = heroData.heroGender;

  const itemColor = "#c90000";

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

  //   const getHTML = () => {
  //     fetch("story.md")
  //       .then((response) => response.text())
  //       .then((text) => setStory({ terms: text }));
  //   };
  const insertRegex = /\$([^$]*)\$/g;

  function parseMD() {
    let s = "";
    for (let i = 0; i < story.length; i++) {
      const {
        type,
        playerTurnName,
        text = [],
        result: resultArr = [],
      } = story[i];
      switch (type) {
        case "turn":
          s += `##### ${playerTurnName}'s Turn\n\n`;
          break;
      }
      s += `${text.join("\n\n")}\n\n`;
      for (let j = 0; j < resultArr.length; j++) {
        const { type: resultType, item, amt, aspect } = resultArr[j];
        switch (resultType) {
          case "aspect-points":
            s += `<b style="color: ${Aspects[aspect].color}">+${amt} ${Aspects[aspect].text}</b>\n\n`;
            // const e = document.getElementById(aspect).querySelector("#amt");
            // e.textContent = amt;
            break;
          case "item-obtained":
            s += `<i style="color: ${itemColor}">${item} Obtained</i>\n\n`;
        }
      }
    }
    const matches = s.match(insertRegex);
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

      useCard(playerID, item);
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
      <button onClick={() => console.log(story)}>Print Story</button>
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
