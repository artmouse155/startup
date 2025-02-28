import React from "react";
import { Aspects } from "../aspects.jsx";
import { apiCall } from "../api_stub/api_stub.jsx";
import storyJSON from "./story.json";
import { marked } from "marked";

export function TextBox() {
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
        text = "No Text",
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
            break;
          case "item-obtained":
            s += `<b style="color: ${itemColor}">${item} Obtained</b>\n\n`;
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

  React.useEffect(FakeServer, []);

  return (
    <div className="text-adventure">
      <div className="text-adventure-text" id="parsedMD">
        Eldrond had barely finished stepping both feet inside the dungeon when{" "}
        <b>WHAM!</b> the gate slammed down behind him.
        <br />"<span>This doesn't look like Kansas anymore!</span>" exclaimed
        Eldrond.
        <br />
        <br />
        Eldrond looked around and found himself in a small musty room that was
        <span>filled with bugs</span>. He looked ahead and saw an archway, and
        inscripted above the arch were the following words: <br />
        <br />
        <i>
          <span>
            “It's easy to stand in the crowd but it takes courage to stand
            alone.” - Ghandi
          </span>
        </i>
        <br />
        <br />
        Feeling inspired, Eldron began his trek into the unknown.
        <br />
        <br />
        <b>Alice's Turn</b>
        <br />
        <br />
        As Elrond walked, his foot suddenly hit something small and hard. He
        looked down and... it was a book titled "
        <span>A Summary of Every Book Ever Written</span>".
        <br />
        <br />"<span>Gadzooks!</span>" exclaimed Elrond. He sat on the floor and
        began to inspect its pages and before he knew it, he had read the whole
        thing!
        <br />
        <br />
        <b>+5 📖 Intelligence</b>
        <br />
        <br />
        <br />
        <b>Bob's Turn</b>
        <br />
        <br />
        Down a dark staircase, Elrond noticed a mysterious object glimmering in
        a hole in the rock on his left. Curious, He reached his hand in and
        pulled out...
        <br />
        <br />
        A luxirous top hat!
        <br />
        <br />
        Elrond tried the item on, noticed it was very fashionable, and
        satisfied, placed the clothing item back where he found it. Maybe his
        adventure was short-lived, but he felt that it somehow left a lasting
        mark on his appearance.
        <br />
        <br />
        <b>+300 💄 Intelligence</b>
        <br />
        <br />
        <br />
        <b>Seth's Turn</b>
        <br />
        <br />
        After several hours of walking (and a few minutes of skipping) Elrond
        came across a well that looked so old, it was as if it would crumble to
        dust if he touched it. He noticed the bucket was close to the surface of
        the well and so he took a look inside. He could see what was inside! It
        was...
        <br />
        <br />
        A mysterious potion of unknown consequence!
        <br />
        <br />
        Just barely able to reach it, Elrond grabbed the item and stuffed it
        into his inventory. <br />
        <br />
        <b>Mysterious Potion Obtained</b>
        <br />
      </div>
    </div>
  );
}
