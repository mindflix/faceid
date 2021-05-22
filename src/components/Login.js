import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { useHistory } from "react-router-dom";

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

function FaceReco(props) {
  const webcam = useRef();
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [facingMode, setFacingMode] = useState(null);
  let match = null;
  let descriptors = null;

  const fetchData = async () => {
    await loadModels();
    setFaceMatcher(await createMatcher(JSON_PROFILE));
    setInputDevice();
  };

  const setInputDevice = () => {
    navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      let inputDevice = await devices.filter(
        (device) => device.kind === "videoinput"
      );
      if (inputDevice.length < 2) {
        await setFacingMode("user");
      } else {
        await setFacingMode({ exact: "environment" });
      }
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      fetchData();
      if (!isEmpty(webcam.current)) {
        capture();
      }
    }, 1100);

    return () => {
      clearInterval(timer);
    };
  });

  function isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  const capture = async () => {
    let blob = webcam.current?.getScreenshot();
    await getFullFaceDescription(blob, inputSize).then((fullDesc) => {
      if (!!fullDesc) {
        descriptors = fullDesc.map((fd) => fd.descriptor);
      }
    });

    if (descriptors && faceMatcher) {
      match = await descriptors.map((descriptor) =>
        faceMatcher.findBestMatch(descriptor)
      );
    }

    if (!isEmpty(match)) {
      let user = Object.values(match[0])[0];
      checkUser(user);
    }
  };

  const checkUser = (user) => {
    if (user === "Nicolas") {
      signin(
        process.env.REACT_APP_EMAIL_TEST,
        process.env.REACT_APP_PASSWORD_TEST
      ).then(() => {
        history.push("/");
      });
      return true;
    }
  };

  const history = useHistory();
  const { signin } = useAuth();

  let videoConstraints = null;
  if (!!facingMode) {
    videoConstraints = {
      width: WIDTH,
      height: HEIGHT,
    };
  }

  const disableCamera = () => {
    props.parentCallback(false);
  };

  return (
    <div>
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
                      ref={webcam}
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
      <Grid container>
        <Grid item xs>
          <Link href="#" variant="body2" onClick={disableCamera}>
            Se connecter via mot de passe?
          </Link>
        </Grid>
        <Grid item>
          <Link href="/signup" variant="body2">
            {"Pas encore de compte ?"}
          </Link>
        </Grid>
      </Grid>
    </div>
  );
}

function FormLogin() {
  const classes = useStyles();

  const history = useHistory();
  const { signin } = useAuth();

  const { handleSubmit, register } = useForm();

  const onSubmit = async (data) => {
    await signin(data.email, data.password).then(() => {
      history.push("/");
    });
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        {...register("email")}
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
        {...register("password")}
        label="Mot de passe"
        type="password"
        id="password"
        autoComplete="current-password"
      />

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
          <Link href="/signup" variant="body2">
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
    if ("enumerateDevices" in navigator.mediaDevices) {
      setCameraAvailable(true);
    } else {
      setCameraAvailable(false);
    }
  };

  useEffect(() => {
    handleInputDevice();
  }, []);

  const handleCallback = (data) => {
    console.log(data);
    setCameraAvailable(data);
  };

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
      </div>
      {isCameraAvailable ? (
        <FaceReco parentCallback={handleCallback} />
      ) : (
        <FormLogin />
      )}
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

export default SignIn;
