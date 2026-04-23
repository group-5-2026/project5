import React from "react";
import {
  Button,
  Box,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import "./loginRegister.css";
import axios from "axios";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/**
 * Login and registration view.
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: "",
        login_name: "",
        password: "",
        password_repeat: "",
      },
      showLoginError: false,
      showRegistrationError: false,
      showRegistrationSuccess: false,
      showRegistration: false,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleShowRegistration = this.handleShowRegistration.bind(this);
  }

  handleShowRegistration() {
    this.setState((prevState) => ({
      showRegistration: !prevState.showRegistration,
    }));
  }

  handleLogin() {
    const loginData = {
      login_name: this.state.user.login_name,
      password: this.state.user.password,
    };

    axios
      .post("/admin/login", loginData)
      .then((response) => {
        this.setState({
          showLoginError: false,
          showRegistrationError: false,
          showRegistrationSuccess: false,
        });
        this.props.changeUser(response.data);
      })
      .catch(() => {
        this.setState({
          showLoginError: true,
          showRegistrationError: false,
          showRegistrationSuccess: false,
        });
      });
  }

  handleRegister() {
    const { user } = this.state;

    if (user.password !== user.password_repeat) {
      this.setState({
        showRegistrationError: true,
        showLoginError: false,
        showRegistrationSuccess: false,
      });
      return;
    }

    const registerData = {
      login_name: user.login_name,
      password: user.password,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    };

    axios
      .post("/user", registerData)
      .then(() => {
        this.setState({
          user: {
            first_name: "",
            last_name: "",
            location: "",
            description: "",
            occupation: "",
            login_name: "",
            password: "",
            password_repeat: "",
          },
          showRegistrationSuccess: true,
          showRegistrationError: false,
          showLoginError: false,
          showRegistration: false,
        });
      })
      .catch(() => {
        this.setState({
          showRegistrationError: true,
          showLoginError: false,
          showRegistrationSuccess: false,
        });
      });
  }

  handleChange(event) {
    const { id, value } = event.target;
    this.setState((prevState) => ({
      user: {
        ...prevState.user,
        [id]: value,
      },
    }));
  }

render() {
  const { user } = this.state;

  // If user is already logged in, don't show login form
  if (this.props.user) {
    return (
      <Typography variant="h6">
        You are already logged in.
      </Typography>
    );
  }

  return (
    <div>
      <Box component="form" autoComplete="off">
        {this.state.showLoginError && (
          <Alert severity="error">Login Failed</Alert>
        )}
        {this.state.showRegistrationError && (
          <Alert severity="error">Registration Failed</Alert>
        )}
        {this.state.showRegistrationSuccess && (
          <Alert severity="success">Registration Succeeded</Alert>
        )}

        <TextField
          id="login_name"
          label="Login Name"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={user.login_name}
          onChange={this.handleChange}
        />

        <TextField
          id="password"
          label="Password"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          required
          value={user.password}
          onChange={this.handleChange}
        />

        <Box mb={2}>
          <Button variant="contained" onClick={this.handleLogin}>
            Login
          </Button>
        </Box>

        <Accordion
          expanded={this.state.showRegistration}
          onChange={this.handleShowRegistration}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="registration-content"
            id="registration-header"
          >
            <Typography>User Registration</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Box>
              <TextField
                id="password_repeat"
                label="Repeat Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type="password"
                required={this.state.showRegistration}
                value={user.password_repeat}
                onChange={this.handleChange}
              />

              <TextField
                id="first_name"
                label="First Name"
                variant="outlined"
                fullWidth
                margin="normal"
                required={this.state.showRegistration}
                value={user.first_name}
                onChange={this.handleChange}
              />

              <TextField
                id="last_name"
                label="Last Name"
                variant="outlined"
                fullWidth
                margin="normal"
                required={this.state.showRegistration}
                value={user.last_name}
                onChange={this.handleChange}
              />

              <TextField
                id="location"
                label="Location"
                variant="outlined"
                fullWidth
                margin="normal"
                value={user.location}
                onChange={this.handleChange}
              />

              <TextField
                id="description"
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                margin="normal"
                value={user.description}
                onChange={this.handleChange}
              />

              <TextField
                id="occupation"
                label="Occupation"
                variant="outlined"
                fullWidth
                margin="normal"
                value={user.occupation}
                onChange={this.handleChange}
              />

              <Button variant="contained" onClick={this.handleRegister}>
                Register Me
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </div>
  );
}
}

export default LoginRegister;
