import { useState, useEffect } from "react";
import "../css/Header.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Check if the screen is mobile size on component mount and window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Check if user is logged in (you would replace this with your auth check)
    const checkAuthStatus = () => {
      // Example: Check localStorage, cookies, or context for auth status
      const token = localStorage.getItem('authToken');
      const name = localStorage.getItem('userName');
      setIsLoggedIn(!!token);
      setUserName(name || "");
    };

    checkAuthStatus();

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogin = () => {
    // Redirect to login page
    window.location.href = "/login";
  };

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    // Redirect to home or login page
    window.location.href = "/";
  };

  return (
    <>
      <div className="header-container">
        {/* Mobile Hamburger Navbar */}
        {isMobile && (
          <div className="navbar">
            <span className="hamburger" onClick={toggleSidebar}>
              ☰ &nbsp; &nbsp;
            </span>
            <div className="logo"><a href="/">AInterview</a> </div>
            {isLoggedIn ? (
              <button className="login-btn-mobile" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <button className="login-btn-mobile" onClick={handleLogin}>
                Login
              </button>
            )}
          </div>
        )}

        {/* Sidebar for Mobile */}
        <div className={`sidebar ${isOpen ? "open" : ""} ${!isMobile ? "hidden" : ""}`}>
          <a href="#" className="closebtn" onClick={toggleSidebar}>
            &times;
          </a>

          {isLoggedIn ? (
            <>
              <div className="wrapper">
                <i className="bx bxs-user-circle"></i>
                <p>Welcome, {userName}</p>
              </div>
              <a href="/admin">Opening</a>
              <a href="questions">Question bank</a>
              <a href="#" onClick={handleLogout}>Log out</a>
            </>
          ) : (
            <div className="sidebar-login-container">
              <button className="login-btn logout-link" onClick={handleLogin}>
                Login
              </button>
            </div>
          )}
        </div>

        {/* Topbar for Desktop */}
        {!isMobile && (
          <div className="topbar">
            <div className="logo"><a href="/">AInterview</a>
            </div>

            <div className="nav-links">
              {isLoggedIn && (
                <>
                  <a href="/admin">Opening</a>
                  <a href="questions">Question bank</a>
                </>
              )}
            </div>

            <div className="user-info">
              {isLoggedIn ? (
                <>
                  <i className="bx bxs-user-circle"></i>
                  <span>Welcome, {userName}</span>
                  <a href="#" className="logout-link login-btn" onClick={handleLogout}>
                    Log out
                  </a>
                </>
              ) : (
                <button className="login-btn logout-link" onClick={handleLogin}>
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}