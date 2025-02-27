import React from "react";
import "./leaderboard.css";

export function Leaderboard() {
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
        <tbody>
          <tr>
            <td>1</td>
            <td>Joe Scruggs</td>
            <td>741</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Sam I am</td>
            <td>33</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Tom Stephens</td>
            <td>29</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
