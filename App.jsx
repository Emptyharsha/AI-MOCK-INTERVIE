import './App.css';
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";
import Candidate from "./pages/Candidate";
import Logout from "./pages/Logout";
import Questions from "./pages/Questions";
import Openingtype from "./pages/Openingtype";
import UpdateOpening from './pages/UpdateOpening';
import JobOpeningForm from './pages/JobOpeningForm';
import LandingPage from './pages/Home';
import MyContext from './context';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute

function App() {
  const [jobData, setJobData] = useState({});
  const [userId, setUserId] = useState(null); // Add userId state

  return (
    <MyContext.Provider value={[{ jobData, setJobData, userId, setUserId }]}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<PrivateRoute element={Admin} />} />
          <Route path="/candidate" element={<PrivateRoute element={Candidate} />} />
          <Route path="/logout" element={<PrivateRoute element={Logout} />} />
          <Route path="/questions" element={<PrivateRoute element={Questions} />} />
          <Route path="/openingtype" element={<PrivateRoute element={Openingtype} />} />
          <Route path="/update-opening" element={<PrivateRoute element={UpdateOpening} />} />
          <Route path="/job-opening" element={<PrivateRoute element={JobOpeningForm} />} />
        </Routes>
      </BrowserRouter>
    </MyContext.Provider>
  );
}

export default App;