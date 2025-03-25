import React from "react";
import { UnAuth } from "./unauth";
import { Auth } from "./auth";
import { AuthState } from "./authState";
import "./login.css";

export function Login({
  userName,
  setUserName,
  authState,
  onAuthChange,
  navigate,
  logOut,
}) {
  function AuthBody() {
    switch (authState) {
      case AuthState.Unknown:
        return <p className="login-center">{"Unknown Auth State."}</p>;
      case AuthState.Authenticated:
        return <Auth userName={userName} navigate={navigate} logOut={logOut} />;
      case AuthState.Unauthenticated:
        return (
          <UnAuth
            onAuthChange={onAuthChange}
            userName={userName}
            setUserName={setUserName}
          />
        );
    }
  }

  return (
    <div className="login-main" style={{ backgroundImage: "url(bg.jpg)" }}>
      <AuthBody />
      <div className="web-card attribution">
        {"Photo by "}
        <a
          className="footer-item"
          href="https://unsplash.com/@aaronkongsebastian?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >
          Aaron Sebastian
        </a>
        {" on "}
        <a
          className="footer-item"
          href="https://unsplash.com/photos/landscape-photography-of-river-between-hills-bfgEYpS0Znk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        >
          {" Unsplash"}
        </a>
      </div>
    </div>
  );
}
