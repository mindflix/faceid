import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { useFace } from "../hooks/useFace";

import { loadModels, getFullFaceDescription, createMatcher } from "../api/face";

import Copyright from "./Copyright";
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

function FaceReco() {
  const webcam = useRef();
  let videoConstraints = {
    width: WIDTH,
    height: HEIGHT,
  };

  const { users } = useFace();

  const [faceMatcher, setFaceMatcher] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (users.length !== 0 && faceMatcher.length === 0) {
      loadModels().then(async () => {
        setFaceMatcher(await createMatcher(users));
      });
    }
    if (faceMatcher.length !== 0) {
      const interval = setInterval(() => {
        capture();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [users, faceMatcher]);

  const capture = () => {
    if (!!webcam.current) {
      getFullFaceDescription(webcam.current.getScreenshot(), inputSize).then(
        async (fullDesc) => {
          let descriptors = fullDesc.map((fd) => fd.descriptor);
          if (descriptors.length !== 0 && !!faceMatcher) {
            let match = await descriptors.map((descriptor) =>
              faceMatcher.findBestMatch(descriptor)
            );
            if (match) {
              let label = match.map((m) => m._label);
              if (!label.includes("unknown")) {
                setUser(label.pop());
              }
            }
          }
        }
      );
    }
  };

  return (
    <div>
      {user}
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
              </div>
            </div>
          </div>
        </CardMedia>
      </Card>
      <Grid container>
        <Grid item xs>
          <Link href="#" variant="body2">
            Se connecter via mot de passe?
          </Link>
        </Grid>
        <Grid item xs>
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

  const handleVideoDevice = () => {
    if ("enumerateDevices" in navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(async (devices) => {
        let inputDevice = await devices.filter(
          (device) => device.kind === "videoinput"
        );
        if (inputDevice.length !== 0) {
          setCameraAvailable(true);
        } else {
          setCameraAvailable(false);
        }
      });
    } else {
      setCameraAvailable(false);
    }
  };

  useEffect(() => {
    handleVideoDevice();
  }, []);

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
      {isCameraAvailable ? <FaceReco /> : <FormLogin />}
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

export default SignIn;
