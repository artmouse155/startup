import React from "react";
import { UnAuth } from "./unauth";
import { AuthState } from "./authState";
import "./login.css";

export function Login({ userName, setUserName, authState, onAuthChange }) {
  switch (authState) {
    case AuthState.Unknown:
      return <p className="login-main">{"Unknown Auth State."}</p>;
    case AuthState.Authenticated:
      return (
        <p className="login-main">
          {'Login Succesful!\nPlease press the "Play" tab.'}
        </p>
      );
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
