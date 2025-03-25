import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import "./bootstrap_overrides.css";
import "./app.css";
import "./header.css";
import "./shadow.css"; // From https://www.cssscript.com/elegant-box-shadows
import { AuthState } from "./login/authState.js";
import Button from "react-bootstrap/Button";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";

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
import { Icons } from "./icons/icons";

export default function App() {
  // console.log(localStorage);
  const [userData, setUserData] = React.useState(
    JSON.parse(localStorage.getItem("userData")) || ""
  );
  const [userName, setUserName] = React.useState(
    userData != "" ? userData.email : ""
  );

  const [authState, setAuthState] = React.useState(
    userName ? AuthState.Authenticated : AuthState.Unauthenticated
  );

  let navigate = useNavigate();

  function logOut() {
    fetch("api/auth/logout", {
      method: "DELETE",
    });
    setAuthState(AuthState.Unauthenticated);
    localStorage.removeItem("userData");
    navigate("/");
  }

  return (
    <div className="body">
      <Navbar expand="lg" className=" ml-auto header">
        <Container>
          <Navbar.Brand href="/">
            <img src="header_icon.png" width="50px" className="header_img" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Navbar.Text className="header-title">
                Text Adventure Showdown
              </Navbar.Text>
              <Nav.Link className="header-text header-menu-link" href="/">
                Home
              </Nav.Link>
              <Nav.Link
                className="header-text header-menu-link"
                href="play"
                disabled={authState == AuthState.Authenticated ? false : true}
              >
                Play
              </Nav.Link>
              <Nav.Link
                className="header-text header-menu-link"
                href="leaderboard"
              >
                Leaderboard
              </Nav.Link>
            </Nav>

            {authState == AuthState.Authenticated ? (
              <Nav className="mr-auto">
                <Navbar.Text className="trophy-section header-text">
                  <b>{`🏆 ${userData.trophies}`}</b>
                </Navbar.Text>
                <Button
                  variant="secondary"
                  className="log-out-button"
                  onClick={logOut}
                  // className="log-out-button"
                >
                  Log Out
                </Button>
                <Navbar.Text className="header-text">{`Signed in as: ${
                  userName.split("@")[0]
                }`}</Navbar.Text>{" "}
              </Nav>
            ) : (
              <div></div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route
          path="/"
          element={
            <Login
              userName={userName}
              setUserName={setUserName}
              authState={authState}
              navigate={navigate}
              logOut={logOut}
              onAuthChange={(userData, authState) => {
                setAuthState(authState);
                setUserName(userData.email);
                console.log("Logging in as " + userData.email);
                localStorage.setItem("userData", JSON.stringify(userData));
                setUserData(userData);
                //navigate("/play");
              }}
            />
          }
          exact
        />
        <Route
          path="/play"
          element={
            <Play
              authState={authState}
              userData={userData}
              setUserData={setUserData}
            />
          }
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/icons" element={<Icons />} />
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
