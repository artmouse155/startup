import React from "react";
import "./login.css";

export function Login() {
  return (
    <main>
      <div className="login-screen">
        <h3 className="login-header">Welcome!</h3>
        <p>
          Ready for adventure? ⚔️
          <br />
          Sign up or log in.
        </p>
        <div className="login-body">
          <form method="get" action="play" className="login-form">
            <label htmlFor="user_email">Email</label>
            <input
              className="input-box"
              type="email"
              id="user_email"
              placeholder=""
            />
            <br />
            <label htmlFor="user_password">Password</label>
            <input
              className="input-box"
              type="password"
              id="user_password"
              placeholder=""
            />
            <br />
            <div className="button-div">
              <button
                type="submit"
                className="login-screen-button login-button"
              >
                Login
              </button>
              <button
                type="submit"
                className="login-screen-button signup-button"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
