import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";
import "./header.css";

import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { Login } from "./login/login.jsx";
import { Play } from "./play/play";
import { Leaderboard } from "./leaderboard/leaderboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="body">
        <header>
          <a className="header-title" href="index.html">
            <img src="header_icon.png" width="30px" />
          </a>

          <nav>
            <menu>
              <li className="header-menu">
                <NavLink to="" className="header-menu-link header-text">
                  Home
                </NavLink>
              </li>
              <li className="header-menu">
                <NavLink to="play" className="header-menu-link header-text">
                  Play
                </NavLink>
              </li>
              <li className="header-menu">
                <NavLink
                  to="leaderboard"
                  className="header-menu-link header-text"
                >
                  Leaderboard
                </NavLink>
              </li>
            </menu>
          </nav>

          <div className="header-right">
            <div className="trophy-section header-text">
              <b>🏆 37</b>
            </div>
            <form method="get" action="index.html">
              <button type="submit" className="log-out-button">
                Log Out
              </button>
            </form>
            <p className="header-text">Cosmo</p>
            <img
              src="account_circle.png"
              width="30px"
              className="account_circle"
            />
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Login />} exact />
          <Route path="/play" element={<Play />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer>
          <span className="text-reset footer-item">Chase Odom</span>
          <a
            className="footer-item"
            href="https://github.com/artmouse155/startup"
          >
            GitHub
          </a>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}
