import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

export function Auth({ userName, navigate, logOut }) {
  return (
    <div className="login-center">
      <Card>
        <Card.Body>
          <Card.Title>{`Welcome, ${userName.split("@")[0]}!`}</Card.Title>
          <Card.Text>Login Successful.</Card.Text>
          <div className="button-div">
            <Button
              className="login-screen-button"
              variant="primary"
              onClick={() => navigate("/play")}
            >
              Play
            </Button>
            <Button
              variant="secondary"
              className="login-screen-button"
              onClick={logOut}
              // className="log-out-button"
            >
              Log Out
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
