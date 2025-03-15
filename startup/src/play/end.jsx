import React from "react";
import { useNavigate } from "react-router-dom";
import { ConnectionState } from "./connectionState";
import { NUM_PLAYERS } from "./server/server.jsx";
import "./end.css";

export function End({
  userData,
  setUserData,
  returnToLobby,
  gameData,
  heroData,
}) {
  const [trophies, setTrophies] = React.useState(0);
  React.useEffect(() => {
    handleGetTrophies();
  }, []);

  let players = gameData.players.map((player, index) => {
    return {
      name: player.name,
      score: gameData.aspects[player.aspect],
      aspect: player.aspect,
    };
  });

  players.sort((a, b) => b.score - a.score);

  async function handleGetTrophies() {
    const trophies_earned = 5;
    const response = await fetch("api/trophy", {
      method: "post",
      body: JSON.stringify({
        email: userData.email,
        trophies: trophies_earned,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 200) {
      const body = await response.json();
      setTrophies(trophies_earned);
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

  function getStandings() {
    // PlayerID, Standing
    let standings = Array(NUM_PLAYERS);
    for (let i = 0; i < NUM_PLAYERS; i++) {
      standings[i] = 0;
      for (let j = 0; j < NUM_PLAYERS; j++) {
        if (players[i].score < players[j].score) {
          standings[i]++;
        }
      }
    }
    return standings;
  }

  const standings = getStandings();
  let navigate = useNavigate();

  return (
    <div className="end-container">
      <h1 className="end-title">{`Results of ${heroData.heroName}'s Quest`}</h1>
      <div className="standings">
        {players.map((player, index) => (
          <div key={index} className="standing">
            <p className="standing-name">{`${standings[index] + 1}. ${
              player.name
            }`}</p>
            <p className="standing-score">{`${player.score} ${player.aspect}`}</p>
          </div>
        ))}
      </div>
      <div className="trophies">
        <p>{`You won ${trophies} trophies!`}</p>
      </div>
      <div className="end-actions">
        <button className="end-button" onClick={returnToLobby}>
          Back to Lobby
        </button>
        <button className="end-button" onClick={() => navigate("/leaderboard")}>
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
