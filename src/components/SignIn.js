import React, { Component, useEffect, useState } from "react";
import { authService } from "../services";

import { loadModels, getFullFaceDescription, createMatcher } from "../api/face";
import Webcam from "react-webcam";

import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";

// Import face profile
const JSON_PROFILE = require("../descriptors/bnk48.json");

const WIDTH = 420;
const HEIGHT = 420;
const inputSize = 160;

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        FaceID
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

class FaceRecognition extends Component {
  constructor(props) {
    super(props);
    this.webcam = React.createRef();
    this.state = {
      fullDesc: null,
      descriptors: null,
      faceMatcher: null,
      match: null,
      facingMode: null,
      user: null,
    };
  }

  UNSAFE_componentWillMount = async () => {
    await loadModels();
    this.setState({ faceMatcher: await createMatcher(JSON_PROFILE) });
    this.setInputDevice();
  };

  setInputDevice = () => {
    navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      let inputDevice = await devices.filter(
        (device) => device.kind === "videoinput"
      );
      if (inputDevice.length < 2) {
        await this.setState({
          facingMode: "user",
        });
      } else {
        await this.setState({
          facingMode: { exact: "environment" },
        });
      }
      this.startCapture();
    });
  };

  startCapture = () => {
    this.interval = setInterval(() => {
      this.capture();
    }, 1500);
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  capture = async () => {
    if (!!this.webcam.current) {
      await getFullFaceDescription(
        this.webcam.current.getScreenshot(),
        inputSize
      ).then((fullDesc) => {
        if (!!fullDesc) {
          this.setState({
            descriptors: fullDesc.map((fd) => fd.descriptor),
          });
        }
      });

      if (!!this.state.descriptors && !!this.state.faceMatcher) {
        let match = await this.state.descriptors.map((descriptor) =>
          this.state.faceMatcher.findBestMatch(descriptor)
        );
        this.setState({ match });
        if (match.length !== 0) {
          this.state.user = Object.values(match[0])[0];
        }
      }
    }
  };

  render() {
    if (this.state.user === "Nicolas") {
      authService.doSignInWithEmailAndPassword(
        "nyco.demol@gmail.com",
        "125478Nyco-"
      );
    }

    const { facingMode } = this.state;
    let videoConstraints = null;
    if (!!facingMode) {
      videoConstraints = {
        width: WIDTH,
        height: HEIGHT,
      };
    }

    return (
      <Card>
        <CardMedia>
          <div
            className="Camera"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: WIDTH,
                height: HEIGHT,
              }}
            >
              <div style={{ position: "relative", width: WIDTH }}>
                {!!videoConstraints ? (
                  <div style={{ position: "absolute" }}>
                    <Webcam
                      audio={false}
                      width={WIDTH}
                      height={HEIGHT}
                      mirrored
                      ref={this.webcam}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </CardMedia>
      </Card>
    );
  }
}

function FormLogin() {
  const classes = useStyles();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);


  const onSubmit = (event) => {
    event.preventDefault();

    authService
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        setEmail("");
        setPassword("");
        setError(null);
      })
      .catch((error) => {
        setError(error);
      });
  };

  const onChange = (handler, event) => {
    handler(event.target.value);
  };

  return (
    <form className={classes.form} onSubmit={onSubmit}>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        value={email}
        onChange={(event) => onChange(setEmail, event)}
        label="Adresse email"
        name="email"
        autoComplete="email"
        autoFocus
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="password"
        label="Mot de passe"
        type="password"
        id="password"
        value={password}
        onChange={(event) => onChange(setPassword, event)}
        autoComplete="current-password"
      />
      {error && <p className="text-red-500 text-xs italic">{error.message}</p>}

      <FormControlLabel
        control={<Checkbox value="remember" color="primary" />}
        label="Se rappeler"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        Se connecter
      </Button>
      <Grid container>
        <Grid item xs>
          <Link href="#" variant="body2">
            Mot de passe oublié?
          </Link>
        </Grid>
        <Grid item>
          <Link href="#" variant="body2">
            {"Pas encore de compte ?"}
          </Link>
        </Grid>
      </Grid>
    </form>
  );
}

function SignIn() {
  const classes = useStyles();
  const [isCameraAvailable, setCameraAvailable] = useState(false);

  const handleInputDevice = () => {
    navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      let inputDevice = await devices.filter(
        (device) => device.kind === "videoinput"
      );
      if (inputDevice.length === 0) {
        setCameraAvailable(false);
      } else {
        setCameraAvailable(true);
      }
    });
    return isCameraAvailable;
  };

  handleInputDevice();

  useEffect(() => {
    const timer = setTimeout(function () {
      setCameraAvailable(false);
    }, 20000);
    return () => clearTimeout(timer);
  });

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Se connecter
        </Typography>
        {isCameraAvailable ? <FaceRecognition /> : <FormLogin />}
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

export default SignIn;
