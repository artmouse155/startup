import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";
import "./header.css";
import "./shadow.css"; // From https://www.cssscript.com/elegant-box-shadows

import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { Login } from "./login/login.jsx";
import { Play } from "./play/play";
import { Leaderboard } from "./leaderboard/leaderboard";

export default function App() {
  const [authState, setAuthState] = React.useState(false);
  const [userName, setUserName] = React.useState();
  let navigate = useNavigate();

  function logOut() {
    navigate("/");
  }

  return (
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
              <button type="submit" className="log-out-button" onClick={logOut}>
                Log Out
              </button>
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
                console.log("Logging in as " + userName);
                navigate("/play");
              }}
              logOut={logOut}
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
  );
}

function NotFound() {
  return <div className="body">404: Return to sender. Address unknown.</div>;
}
