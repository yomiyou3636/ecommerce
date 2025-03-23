import Login from "./components/login";
import Dashboard from "./components/dashboard";
import Signup from "./components/Signup";
import Purch_Dashboard from "./components/purch_dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/purchase_dashboard" element={<Purch_Dashboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
