import React from "react";
import { DndProvider, useDragLayer, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Aspects } from "../aspects.jsx";
// import { apiCall } from "../api_stub/api_stub.jsx";
import { marked } from "marked";
import Parser from "html-react-parser";
//import { renderer } from "./md_extension.jsx";
// import items from "../server/items.json";
import "./textbox.css";
// import {
//   initTextbox,
//   setTextboxPushFunc,
//   setTextboxSetCurrentTurnFunc,
//   getItemData,
// } from "../server/server.jsx";

export function TextBox({ story, tempStory, dragItemType, useCard }) {
  // const [story, setStory] = React.useState([]);
  // const [currentPlayerName, setCurrentPlayerName] =
  //   React.useState(initialPlayerName);
  // setTextboxPushFunc((storyElem) => {
  //   console.log("Pushing story element", storyElem);
  //   let storyCopy = [...story];
  //   storyCopy.push(storyElem);
  //   setStory(storyCopy);
  // });
  // const [isSetupComplete, setIsSetupComplete] = React.useState(false);
  // React.useEffect(() => {
  //   if (!isSetupComplete) {
  //     const { init_story, init_name } = initTextbox();
  //     console.log("Init story", init_story);
  //     setStory([...init_story]);
  //     setCurrentPlayerName(init_name);
  //     setIsSetupComplete(true);
  //   }
  // }, []);

  // setTextboxSetCurrentTurnFunc((playerTurnName) => {
  //   setCurrentPlayerName(playerTurnName);
  // });

  const heroName = heroData.heroName;
  const heroGender = heroData.heroGender;

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

  // React.useEffect(() => {
  //   async function parseMD() {
  //     // Check if anything in story doesn't have the rendered flag
  //     if (story.length == 0) {
  //       return;
  //     }
  //     // Check if anything in story doesn't have the rendered flag
  //     if (story.every((elem) => elem.rendered)) {
  //       return;
  //     }

  //     let _story = [...story];
  //     //_story.push({ type: "turn", playerTurnName: currentPlayerName });
  //     let s = "";
  //     for (let i = 0; i < _story.length; i++) {
  //       if (_story[i].rendered) {
  //         continue;
  //       }
  //       const {
  //         type,
  //         playerTurnName,
  //         title,
  //         text = [],
  //         results: resultArr = [],
  //       } = _story[i];
  //       switch (type) {
  //         case "intro":
  //           s += `<h3 class="title">${title}</h3>\n\n`;
  //           break;
  //         case "turn":
  //           s += `<h5 class="playerTurn">${playerTurnName}'s Turn</h5>\n\n`;
  //           break;
  //       }
  //       s += `${text.join("\n\n")}\n\n`;
  //       for (let j = 0; j < resultArr.length; j++) {
  //         const { type: resultType, item, amt, aspect } = resultArr[j];
  //         switch (resultType) {
  //           case "aspect-points":
  //             s += `<b style="color: ${Aspects[aspect].color}">+${amt} ${Aspects[aspect].text}</b>\n\n`;
  //             break;
  //           case "item-obtained":
  //             s += `<i class= "item">${
  //               getItemData(item).name
  //             } obtained</i>\n\n`;
  //             break;
  //         }
  //       }
  //       _story[i].rendered = true;
  //     }
  //     const matches = s.match(insertRegex);
  //     if (matches) {
  //       for (let j = 0; j < matches.length; j++) {
  //         const m = matches[j];
  //         let r = "DEFAULT REPLACE";
  //         switch (m) {
  //           case "$n$":
  //             r = heroName;
  //             break;
  //           case "$They$":
  //             r = pronouns.They[heroGender];
  //             break;
  //           case "$Their$":
  //             r = pronouns.Their[heroGender];
  //             break;
  //           case "$Theirs$":
  //             r = pronouns.Theirs[heroGender];
  //             break;
  //           case "$Them$":
  //             r = pronouns.Them[heroGender];
  //             break;
  //           case "$they$":
  //             r = pronouns.they[heroGender];
  //             break;
  //           case "$their$":
  //             r = pronouns.their[heroGender];
  //             break;
  //           case "$theirs$":
  //             r = pronouns.theirs[heroGender];
  //             break;
  //           case "$them$":
  //             r = pronouns.them[heroGender];
  //             break;
  //           default:
  //             r = await apiCall(m);
  //             break;
  //         }
  //         s = s.replace(`${m}`, r);
  //       }
  //     }

  //     //marked.use(renderer);

  //     // Run marked
  //     document.getElementById("parsedMD").innerHTML += marked.parse(s);
  //     document.getElementById("parsedMDTemp").innerHTML = marked.parse(
  //       `<h5 class="playerTurn">${currentPlayerName}'s Turn</h5>\n\n`
  //     );

  //     const elem = document.getElementById("textScroll");
  //     elem.scrollTop = elem.scrollHeight;
  //   }
  //   parseMD();
  // }, [story]);

  function TextAdvText({ story, tempStory }) {
    marked.use(renderer);

    return (
      <div>
        <div className="text-adventure-text" id="parsedMD">
          {Parser(marked.parse(story))}
        </div>
        <div className="text-adventure-text" id="parsedMDTemp">
          {Parser(marked.parse(tempStory))}
        </div>
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
        <TextAdvText story={story} tempStory={tempStory} />
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
