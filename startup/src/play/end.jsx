import React from "react";
import { useNavigate } from "react-router-dom";
import { ConnectionState } from "./connectionState";
// import { NUM_PLAYERS } from "./server/server.jsx";
import "./end.css";

export function End({
  userData,
  setUserData,
  handleExit,
  getStandings,
  gameData,
  heroData,
}) {
  const [trophyDiff, setTrophyDiff] = React.useState(0);
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
    const response = await fetch("api/trophy", {
      method: "get",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 200) {
      const body = await response.json();
      setTrophyDiff(body.trophies - userData.trophies);
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
        <p>
          <b>{`You won ${trophyDiff} trophies!`}</b>
        </p>
      </div>
      <div className="end-actions">
        <button className="end-button" onClick={handleExit}>
          Back to Lobby
        </button>
        <button className="end-button" onClick={() => navigate("/leaderboard")}>
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
