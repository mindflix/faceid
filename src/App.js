import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Account from "./components/Account";
import PrivateRoute from "./components/routes/PrivateRoute";

function App() {
  return (
    <Router>
      <Switch>
        <PrivateRoute exact path="/">
          <Account />
        </PrivateRoute>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
      </Switch>
    </Router>
  );
}

export default App;
