import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";
import "./header.css";

import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";
import { Login } from "./login/login.jsx";
import { Play } from "./play/play";
import { Leaderboard } from "./leaderboard/leaderboard";

export default function App() {
  const [authState, setAuthState] = React.useState(false);
  const [userName, setUserName] = React.useState("Cosmo");

  return (
    <BrowserRouter>
      <div className="body">
        <header>
          <NavLink className="header-title" to="">
            <img src="header_icon.png" width="30px" />
          </NavLink>

          <nav>
            <menu>
              <li className="header-menu">
                <NavLink to="" className="header-menu-link header-text">
                  Home
                </NavLink>
              </li>
              <li className="header-menu">
                {authState ? (
                  <NavLink to="play" className="header-menu-link header-text">
                    Play
                  </NavLink>
                ) : (
                  <p className="disabled header-text">Sign in to Play</p>
                )}
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
          {authState ? (
            <div className="header-right">
              <div className="trophy-section header-text">
                <b>🏆 37</b>
              </div>
              <form method="get">
                <NavLink
                  type="submit"
                  className="log-out-button"
                  onClick={() => {
                    setAuthState(false);
                    Navigate("./login");
                  }}
                >
                  Log Out
                </NavLink>
              </form>
              <p className="header-text">{userName}</p>
              <img
                src="account_circle.png"
                width="30px"
                className="account_circle"
              />
            </div>
          ) : (
            <div></div>
          )}
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <Login
                userName={userName}
                authState={authState}
                onAuthChange={(userName, authState) => {
                  setAuthState(authState);
                  setUserName(userName);
                }}
              />
            }
            exact
          />
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
