import React from "react";
import { useNavigate } from "react-router-dom";
import { ConnectionState } from "./connectionState";
import Button from "react-bootstrap/Button";
import Aspects from "./aspects.json";
// import { NUM_PLAYERS } from "./server/server.jsx";
import "./end.css";

export function End({
  userData,
  myPlayerId,
  setUserData,
  handleExit,
  getStandings,
  gameData,
  heroData,
}) {
  React.useEffect(() => {
    handleGetTrophies();
  }, []);

  const myTrophies = gameData.players[myPlayerId].trophiesEarned;

  let players = gameData.players.map((player, index) => {
    return {
      name: player.name,
      score: gameData.aspects[player.aspect],
      aspect: player.aspect,
    };
  });

  players.sort((a, b) => b.score - a.score);

  async function handleGetTrophies() {
    const response = await fetch("api/trophy", {
      method: "get",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 200) {
      const body = await response.json();
      setUserData((d) => {
        let temp = { ...d };
        temp.trophies = body.trophies;
        localStorage.setItem("userData", JSON.stringify(temp));
        return temp;
      });
    } else {
      const body = await response.json();
      alert(`⚠ Error: ${body.msg}`);
    }
  }

  const standings = getStandings();
  let navigate = useNavigate();

  function ResultsTable() {
    let s = players.sort((a, b) => b.score - a.score);
    let rows = [];
    for (let i = 0; i < s.length; i++) {
      rows.push(
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{s[i].name}</td>
          <td>{Aspects[s[i].aspect].text}</td>
          <td>{s[i].score}</td>
          <td>{5}</td>
        </tr>
      );
    }
    return (
      <table>
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Name</th>
            <th>Aspect</th>
            <th>Score</th>
            <th>🏆 Trophies Won</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  return (
    <div className="end-container">
      <h1 className="end-title">{`Results of ${heroData.name}'s Quest`}</h1>
      <div className="standings">
        <ResultsTable />
      </div>
      <div className="trophies">
        <p>
          <b>{`You won ${myTrophies ? myTrophies : `?`} trophies!`}</b>
        </p>
      </div>
      <div className="end-actions">
        <Button onClick={handleExit}>Back to Lobby</Button>
        <Button onClick={() => navigate("/leaderboard")}>
          View Leaderboard
        </Button>
      </div>
    </div>
  );
}
