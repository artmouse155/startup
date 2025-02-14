import React from "react";

export function Login() {
  return (
    <main>
      <div class="login-screen">
        <h3 class="login-header">Welcome! ⚔️</h3>
        <p>
          Ready for adventure?
          <br />
          Sign up or log in.
        </p>
        <div class="login-body">
          <form method="get" action="play.html" class="login-form">
            <label for="user_email">Email</label>
            <input
              class="input-box"
              type="email"
              id="user_email"
              placeholder=""
            />
            <br />
            <label for="user_password">Password</label>
            <input
              class="input-box"
              type="password"
              id="user_password"
              placeholder=""
            />
            <br />
            <div class="button-div">
              <button type="submit" class="login-screen-button login-button">
                Login
              </button>
              <button type="submit" class="login-screen-button signup-button">
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
