import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 import React ,{useState} from "react"
import './App.css';
import HomePage from './components/HomePage.jsx';
import Join from "./components/Join.jsx";
import Login from "./components/Login.jsx";
import ServicesIn from './components/ServicesIn.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Footerr from './components/Footerr.jsx'
import ServiceDetails from './components/ServiceDetails.jsx';
import ServBtn from './components/ServBtn.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// <<<<<<< HEAD
// =======
// import "bootstrap/dist/css/bootstrap.min.css";

// >>>>>>> 41456b6b58f39b0744a571e50e097fecaf9048c9
import WorkerProfile from './components/WorkerProfile.jsx';
import Booknow from './components/Booknow.jsx';
export default function App() {
    const [theme, setTheme] = useState('light');
  return (
   

    
    <Router>
      <Navbar  theme={theme} setTheme={setTheme}/>
    <div className="App">
        <Routes>
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/" element={<HomePage theme={theme} />} />  {/* تم تمرير theme إلى HomePage */}
          <Route path="/ServicesIn" element={<ServicesIn/>} />
          <Route path="/services-in/:id" element={<ServiceDetails />} />  {/* تمرير الـ ID هنا */}
          <Route path="/ServBtn"  element={<ServBtn theme={theme} />} />

          <Route path="/worker/:id" element={<WorkerProfile />} /> إضافة هذا المسار
          <Route path="/booknow" element={<Booknow />} />

          {/* <Route path="/" element={<Services />} /> */}
          <Route path="/Login" element={<Login />} />
          <Route path="/Join" element={<Join />} />
       
        </Routes>
    </div>
    
    <Footerr theme={theme} setTheme={setTheme}/>
    </Router>
  );        
}