import React from "react";
import { DndProvider, useDragLayer, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Aspects } from "../aspects.jsx";
import { apiCall } from "../api_stub/api_stub.jsx";
import storyJSON from "./story.json";
import { marked } from "marked";
import "./textbox.css";

export function TextBox({ dragItemType }) {
  const [story, setStory] = React.useState([]);
  const [playerName, setPlayerName] = React.useState("Billy Bob");
  const [playerGender, setPlayerGender] = React.useState("male");

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

  function FakeServer() {
    parseMD();
  }

  //   const getHTML = () => {
  //     fetch("story.md")
  //       .then((response) => response.text())
  //       .then((text) => setStory({ terms: text }));
  //   };
  const insertRegex = /\$([^$]*)\$/g;

  const parseMD = () => {
    let s = "";
    for (let i = 0; i < storyJSON.sections.length; i++) {
      const {
        type,
        playerTurnName,
        text = [],
        result: resultArr = [],
      } = storyJSON.sections[i];
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
            const e = document.getElementById(aspect).querySelector("#amt");
            e.textContent = amt;
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
          r = playerName;
          break;
        case "$They$":
          r = pronouns.They[playerGender];
          break;
        case "$Their$":
          r = pronouns.Their[playerGender];
          break;
        case "$Theirs$":
          r = pronouns.Theirs[playerGender];
          break;
        case "$Them$":
          r = pronouns.Them[playerGender];
          break;
        case "$they$":
          r = pronouns.they[playerGender];
          break;
        case "$their$":
          r = pronouns.their[playerGender];
          break;
        case "$theirs$":
          r = pronouns.theirs[playerGender];
          break;
        case "$them$":
          r = pronouns.them[playerGender];
          break;
        default:
          r = apiCall(m);
          break;
      }
      s = s.replace(`${m}`, r);
    }

    document.getElementById("parsedMD").innerHTML = marked.parse(s);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: dragItemType,
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));
  //let isDragging = true;

  React.useEffect(FakeServer, []);

  return (
    <div className={`text-adventure-container`} ref={drop}>
      <div
        className={`text-adventure ${isOver ? "is-over" : "not-over"} ${
          isOver ? "is-over-grow" : ""
        }`}
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
