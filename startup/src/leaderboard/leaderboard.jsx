import React from "react";
import "./leaderboard.css";
import scoresJSON from "./scores.json";

const MAX_SCORES = 10;

export function Leaderboard() {
  const [scores, setScores] = React.useState([]);

  // Demonstrates calling a service asynchronously so that
  // React can properly update state objects with the results.
  React.useEffect(() => {
    fetch("/api/trophies")
      .then((response) => response.json())
      .then((scores) => {
        // console.log("Scores: ", scores);
        setScores(scores);
      });
  }, []);

  function TableBody() {
    let s = scores.sort((a, b) => b.trophies - a.trophies);
    // Limit the number of scores displayed to MAX_SCORES
    s = s.slice(0, MAX_SCORES);
    let rows = [];
    for (let i = 0; i < s.length; i++) {
      rows.push(
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{s[i].userName}</td>
          <td>{s[i].trophies}</td>
        </tr>
      );
    }
    return <tbody>{rows}</tbody>;
  }

  return (
    <div className="leaderboard-main">
      <h3>High Scores</h3>
      <table cellSpacing="0" cellPadding="0">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>🏆 Trophies</th>
          </tr>
        </thead>
        <TableBody />
      </table>
    </div>
  );
}
