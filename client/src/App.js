import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "./components/layouts/Landing";
import Navbar from "./components/layouts/Navbar";
// import { BrowserRouter as Router, Route } from 'react-router-dom';
// import Navbar from "./components/layouts/Navbar";
// import Landing from "./components/layouts/Landing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
// import Alert from "./components/layouts/Alert";
// import Dashboard from "./components/dashboard/Dashboard";
// import CreateProfile from "./components/profile-forms/CreateProfile";
// import EditProfile from "./components/profile-forms/EditProfile";
// import AddExperience from "./components/profile-forms/AddExperience";
// import AddEducation from "./components/profile-forms/AddEducation";
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* <h1>piyush mahajan</h1> */}
        <Route exact path="/" Component={Landing} />
      </Routes>
      <section className="container">
        <Routes>
          <Route exact path="/register" Component={Register} />
          <Route exact path="/login" Component={Login} />{" "}
        </Routes>
      </section>
    </Router>
  );
};

export default App;
