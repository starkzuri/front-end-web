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

  // Load theme preference from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.add("dark-theme");
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

  const cancelLogout = () => {
    setConfirm(false);
  };

  const logout = () => {
    handleWalletDisconnection();
    window.location.reload();
  };

  const showConfirm = () => {
    setConfirm(true);
  };

  const { address, handleWalletConnection, handleWalletDisconnection } =
    useAppContext();

  return (
    <div className={`w3-bar ${styles.top_nav} w3-padding`}>
      {confirm && (
        <ConfirmModal
          message="are you sure you want to log out?"
          heading="log out?"
          onCancelClick={cancelLogout}
          onButtonClick={logout}
        />
      )}
      <button
        className={`${styles.mobile_nav_button} w3-hide-large w3-hide-medium w3-bar-item`}
        onClick={onMobileMenuClick}
      >
        <FontAwesomeIcon className="w3-text-white" icon={faNavicon} />
      </button>
      <span>
        <img src={Logo} className={styles.logo} />
      </span>

      <div className="w3-right">
        <div className={styles.right_objects}>
          <div className={styles.search_input}>
            <FontAwesomeIcon
              className={`${styles.search_font} w3-text-white w3-padding`}
              icon={faSearch}
            />
            <input
              className={`w3-input ${styles.search_input} w3-text-white`}
              placeholder="search"
            />
          </div>

          <button
            className={`w3-button ${styles.connect_button}`}
            onClick={address ? showConfirm : handleWalletConnection}
          >
            {address ? "connected" : "connect wallet"}
          </button>

          <button
            className={`w3-button ${styles.theme_toggle_button}`}
            onClick={toggleTheme}
          >
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopNav;