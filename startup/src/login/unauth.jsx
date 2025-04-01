import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthState } from "./authState";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

export function UnAuth({
  userName,
  setUserName,
  authState,
  onAuthChange,
  logOut,
}) {
  const [password, setPassword] = React.useState("");
  const [myUserName, setMyUserName] = React.useState(userName);
  let navigate = useNavigate();

  async function handleLogin() {
    setUserName(myUserName);
    loginOrCreate(`/api/auth/login`);
  }

  async function handleRegister() {
    setUserName(myUserName);
    loginOrCreate(`/api/auth/create`);
  }

  async function loginOrCreate(endpoint) {
    if (!myUserName || !password) {
      alert("⚠ Please enter a username and password.");
      return;
    }

    const response = await fetch(endpoint, {
      method: "post",
      body: JSON.stringify({ email: myUserName, password: password }),
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
    <div className="login-center">
      <div className="web-card">
        <h3 className="login-header">Ready for adventure?</h3>
        <p>Sign up or log in.</p>
        <div className="login-body">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <InputGroup className="mb-3">
              <InputGroup.Text className="input-group-text">
                Email
              </InputGroup.Text>
              <Form.Control
                // type="email"
                autoComplete="username"
                placeholder=""
                value={myUserName}
                onChange={(e) => setMyUserName(e.target.value)}
                required
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <InputGroup.Text>Password</InputGroup.Text>
              <Form.Control
                type="password"
                autoComplete="current-password"
                placeholder=""
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </InputGroup>
            <div className="button-div">
              <Button
                type="submit"
                className="login-screen-button"
                // onClick={handleLogin}
              >
                Login
              </Button>
              <Button
                type="button"
                variant="outline-primary"
                className="login-screen-button"
                onClick={handleRegister}
              >
                Sign Up
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
