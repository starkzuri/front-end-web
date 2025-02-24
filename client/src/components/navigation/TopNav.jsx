import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faNavicon, faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { connect, disconnect } from "starknetkit";
import styles from "./TopNav.module.css";
import Logo from "../../assets/logo.png";
import { useAppContext } from "../../providers/AppProvider";
import ConfirmModal from "../confirmModal/ConfirmModal";

const TopNav = ({ onMobileMenuClick }) => {
  const [confirm, setConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  const { address, handleWalletConnection, handleWalletDisconnection } = useAppContext();

  // Load theme preference from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    } else {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    }
  }, []);

  // Toggle between dark and light themes
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    // Update the body class
    if (newTheme) {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
    }

    // Save the theme preference to localStorage
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const showConfirm = () => setConfirm(true);
  const cancelLogout = () => setConfirm(false);
  
  const logout = () => {
    handleWalletDisconnection();
    window.location.reload();
  };

  return (
    <header className={`${styles.top_nav} w3-padding`}>
      {/* Confirmation Modal */}
      {confirm && (
        <ConfirmModal
          message="Are you sure you want to log out?"
          heading="Log out?"
          onCancelClick={cancelLogout}
          onButtonClick={logout}
        />
      )}
      
      {/* Mobile Navigation Button */}
      <button
        className={`${styles.mobile_nav_button} w3-hide-large w3-hide-medium`}
        onClick={onMobileMenuClick}
        aria-label="Open navigation menu"
      >
        <FontAwesomeIcon 
          className={isDarkMode ? "w3-text-white" : ""} 
          icon={faNavicon} 
        />
      </button>
      
      {/* Logo */}
      <div className={styles.logo_container}>
        <img src={Logo} alt="Logo" className={styles.logo} />
      </div>

      {/* Right Side Elements */}
      <div className={styles.right_section}>
        <div className={styles.right_objects}>
          {/* Search Bar */}
          <div className={styles.search_input_container}>
            <FontAwesomeIcon
              className={`${styles.search_font} ${isDarkMode ? "w3-text-white" : ""}`}
              icon={faSearch}
            />
            <input
              className={`${styles.search_input} ${isDarkMode ? "w3-text-white" : ""}`}
              placeholder="Search"
              aria-label="Search"
            />
          </div>

          {/* Connect Wallet Button */}
          <button
            className={styles.connect_button}
            onClick={address ? showConfirm : handleWalletConnection}
          >
            {address ? "Connected" : "Connect Wallet"}
          </button>

          {/* Theme Toggle Button */}
          <button
            className={styles.theme_toggle_button}
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;