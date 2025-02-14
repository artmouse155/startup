import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";
import "./aspects.css";
import "./header.css";

import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { Login } from "./login/login";
import { Play } from "./play/play";
import { Scores } from "./scores/scores";
import { About } from "./about/about";

export default function App() {
  return (
    <BrowserRouter>
      <div class="body">
        <header>
          <a class="header-title" href="index.html">
            <img src="header_icon.png" width="30px" />
          </a>

          <nav>
            <menu>
              <li class="header-menu">
                <a href="index.html" class="header-menu-link header-text">
                  Home
                </a>
              </li>
              <li class="header-menu">
                <a href="play.html" class="header-menu-link header-text">
                  Play
                </a>
              </li>
              <li class="header-menu">
                <a href="leaderboard.html" class="header-menu-link header-text">
                  Leaderboard
                </a>
              </li>
            </menu>
          </nav>

          <div class="header-right">
            <div class="trophy-section header-text">
              <b>🏆 37</b>
            </div>
            <form method="get" action="index.html">
              <button type="submit" class="log-out-button">
                Log Out
              </button>
            </form>
            <p class="header-text">Cosmo</p>
            <img src="account_circle.png" width="30px" class="account_circle" />
          </div>
        </header>

        <footer>
          <span class="text-reset footer-item">Chase Odom</span>
          <a class="footer-item" href="https://github.com/artmouse155/startup">
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
