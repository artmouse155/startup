import React from "react";
import "./leaderboard.css";
import scoresJSON from "./scores.json";

export function Leaderboard() {
  function TableBody() {
    let s = scoresJSON.scores.sort((a, b) => b.score - a.score);
    let rows = [];
    for (let i = 0; i < s.length; i++) {
      rows.push(
        <tr>
          <td>{i + 1}</td>
          <td>{s[i].player}</td>
          <td>{s[i].score}</td>
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
