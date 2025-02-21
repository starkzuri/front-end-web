import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import styles from "./SideNav.module.css";
import { sideNavigations } from "../../utils/AppUtils";

const SideNav = () => {
  return (
    <div className={`w3-sidebar w3-text-white w3-bar-block ${styles.sidebar}`}>
      {sideNavigations.map(({ navName, icon, to }, key) => (
        <Link
          to={to}
          key={key}
          className={`w3-bar-item w3-block ${styles.navItem}`}
        >
          <FontAwesomeIcon icon={icon} className={styles.icon} />
          {navName}
        </Link>
      ))}
      <br />
      <button className={`w3-button ${styles.postButton}`}>Post</button>
      <Link
        to="/explore/new-community"
        className={`w3-button ${styles.communityButton}`}
      >
        New Community
      </Link>
    </div>
  );
};

export default SideNav;