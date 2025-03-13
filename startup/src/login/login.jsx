import React from "react";
import "./login.css";

export function Login({ userName, authState, onAuthChange }) {
  return !authState ? (
    <div className="login-main">
      <div className="login-screen">
        <h3 className="login-header">Welcome!</h3>
        <p>
          Ready for adventure? ⚔️
          <br />
          Sign up or log in.
        </p>
        <div className="login-body">
          <form
            action={() => {
              //const email = emailRef.current.value;
              // const password = passwordRef.current.value;
              const email = "temp@gmail.com";
              onAuthChange(email, true);
            }}
            className="login-form"
          >
            <label htmlFor="username">Email</label>
            <input
              className="input-box"
              type="email"
              id="username"
              autoComplete="username"
              placeholder=""
            />
            <br />
            <label htmlFor="current-password">Password</label>
            <input
              className="input-box"
              type="password"
              id="current-password"
              autoComplete="current-password"
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
    </div>
  ) : (
    <p className="login-main">
      {'Login Succesful!\nPlease press the "Play" tab.'}
    </p>
  );
}
