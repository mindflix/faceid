import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

import * as ROUTES from "./constants/routes";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ImageInput from "./components/ImageInput";
import Account from "./components/Account";

import { authService } from "./services";

function AuthenticatedRoute({ component: C, appProps, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        appProps.user.loggedIn ? (
          <C {...props} {...appProps} />
        ) : (
          <Redirect to="/signin" />
        )
      }
    />
  );
}

function UnauthenticatedRoute({ component: C, appProps, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        !appProps.user.loggedIn ? (
          <C {...props} {...appProps} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
}

function App() {
  const [user, setUser] = useState({ loggedIn: true });

  useEffect(() => {
    const unsubscribe = authService.auth.onAuthStateChanged((user) => {
      if (user) {
        setUser({ loggedIn: true });
      } else {
        setUser({ loggedIn: false });
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {user.loggedIn ? (
            <Redirect to="/account" />
          ) : (
            <Redirect to="/signin" />
          )}
        </Route>
        <UnauthenticatedRoute
          path={ROUTES.SIGNIN}
          component={SignIn}
          appProps={{ user }}
        />
        <UnauthenticatedRoute
          path={ROUTES.SIGNUP}
          component={SignUp}
          appProps={{ user }}
        />
        <AuthenticatedRoute
          path={ROUTES.IMAGE}
          component={ImageInput}
          appProps={{ user }}
        />
        <AuthenticatedRoute
          path={ROUTES.ACCOUNT}
          component={Account}
          appProps={{ user }}
        />
      </Switch>
    </Router>
  );
}

export default App;
