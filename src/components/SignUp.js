import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { loadModels, getFullFaceDescription } from "../api/face";

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

import Webcam from "react-webcam";

// Import face profile
const fs = require("browserify-fs");
const JSON_PROFILE = require("../descriptors/bnk48.json");

const WIDTH = 420;
const HEIGHT = 420;
const inputSize = 160;

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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function FormSignUp(props) {
  const classes = useStyles();
  const { signup } = useAuth();

  const { handleSubmit, register } = useForm();

  const onSubmit = async (data) => {
    await signup(data.email, data.password).then(() => {
      props.data(data);
    });
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            autoComplete="fname"
            name="firstName"
            variant="outlined"
            required
            fullWidth
            id="firstName"
            {...register("firstName")}
            label="Prénom"
            autoFocus
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant="outlined"
            required
            fullWidth
            id="lastName"
            {...register("lastName")}
            label="Nom"
            name="lastName"
            autoComplete="lname"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            required
            fullWidth
            id="email"
            {...register("email")}
            label="Adresse email"
            name="email"
            autoComplete="email"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            required
            fullWidth
            name="password"
            {...register("password")}
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox value="allowExtraEmails" color="primary" />}
            label="Je souhaite recevoir les nouveautés par email."
          />
        </Grid>
      </Grid>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        S'inscrire
      </Button>
      <Grid container justify="flex-end">
        <Grid item>
          <Link href="/signin" variant="body2">
            Déjà un compte ?
          </Link>
        </Grid>
      </Grid>
    </form>
  );
}

function InitFaceReco() {
  const webcam = useRef();
  const [facingMode, setFacingMode] = useState(null);
  let descriptors = null;
  let bundle = [];

  const fetchData = async () => {
    await loadModels();
    setInputDevice();
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      capture();
      saveDescriptors();
    }, 3000);
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

  const saveDescriptors = () => {
    if (!isEmpty(descriptors)) {
      let map = Object.values(descriptors[0]);
      bundle.push(map);
    }
    if (bundle.length > 1) {
      addToJSON(bundle);
    }
  };

  const addToJSON = (bundle) => {
    let name = "Christophe";
    let json = {};
    json[name] = { name: name, descriptors: bundle };

    let pack = [];
    pack.push(JSON_PROFILE);
    pack.push(json);

    fs.writeFile("../descriptors/bnk48.json", JSON.stringify(pack));

    console.log();
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

  const capture = async () => {
    let blob = webcam.current?.getScreenshot();
    await getFullFaceDescription(blob, inputSize).then((fullDesc) => {
      if (!!fullDesc) {
        descriptors = fullDesc.map((fd) => fd.descriptor);
      }
    });
  };

  let videoConstraints = null;
  if (!!facingMode) {
    videoConstraints = {
      width: WIDTH,
      height: HEIGHT,
    };
  }

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
    </div>
  );
}

function SignUp() {
  const classes = useStyles();

  const [isContinue, setContinue] = useState(false);

  const handleData = (data) => {
    setContinue(true);
    console.log(data);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          S'inscrire
        </Typography>
        {isContinue ? <InitFaceReco /> : <FormSignUp data={handleData} />}
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}

export default SignUp;
