import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthState } from "./authState";
import Button from "react-bootstrap/Button";

export function UnAuth({
  userName,
  setUserName,
  authState,
  onAuthChange,
  logOut,
}) {
  const [password, setPassword] = React.useState("");
  let navigate = useNavigate();

  async function handleLogin() {
    loginOrCreate(`/api/auth/login`);
  }

  async function handleRegister() {
    loginOrCreate(`/api/auth/create`);
  }

  async function loginOrCreate(endpoint) {
    if (!userName || !password) {
      alert("⚠ Please enter a username and password.");
      return;
    }
    const response = await fetch(endpoint, {
      method: "post",
      body: JSON.stringify({ email: userName, password: password }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 200) {
      const body = await response.json();
      onAuthChange(body, AuthState.Authenticated);
    } else {
      const body = await response.json();
      alert(`⚠ Error: ${body.msg}`);
    }
  }

  return (
    <div className="login-main">
      <div className="login-screen">
        <h3 className="login-header">Welcome!</h3>
        <p>
          Ready for adventure? ⚔️
          <br />
          Sign up or log in.
        </p>
        <div className="login-body">
          <form className="login-form">
            <label htmlFor="username">Email</label>
            <input
              className="input-box"
              type="email"
              id="username"
              autoComplete="username"
              placeholder=""
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <br />
            <label htmlFor="current-password">Password</label>
            <input
              className="input-box"
              type="password"
              id="current-password"
              autoComplete="current-password"
              placeholder=""
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <br />
          </form>
          <div className="button-div">
            <Button
              type="submit"
              variant="secondary"
              className="login-screen-button"
              onClick={handleLogin}
            >
              Login
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="login-screen-button"
              onClick={handleRegister}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
