import React, { useState } from "react";
import TopNav from "../components/navigation/TopNav";
import SideNav from "../components/navigation/SideNav";
import Main from "../components/middlepage/Main";
import MobileSidenav from "../components/navigation/MobileSidenav";
import WalletBalance from "../components/wallet/WalletBalance";
import Transactions from "../components/wallet/Transactions";
import MyAssets from "../components/wallet/MyAssets";
import ConnectWallet from "./login_page/ConnectWallet";
import { useAppContext } from "../providers/AppProvider";
import FollowersCard from "../components/rightside/FollowersCard";

const Wallet = () => {
  const { address } = useAppContext();
  const [navOpen, setNavOpen] = useState(false);
  const handleMobileMenuClick = () => {
    setNavOpen(!navOpen);
    console.log("something is wrong");
    console.log(navOpen);
  };
  return (
    <div>
      <TopNav onMobileMenuClick={handleMobileMenuClick} />
      <SideNav />

      {navOpen && <MobileSidenav />}

      <Main>
        <div className="w3-row-padding w3-strech">
          <div className="w3-col l8">
            {address ? (
              <>
                <WalletBalance />
                <br />
                <Transactions />
              </>
            ) : (
              <ConnectWallet />
            )}
          </div>
          <div className="w3-col l4">
            {address && <MyAssets />}
            <FollowersCard />
          </div>
        </div>
      </Main>
    </div>
  );
};

export default Wallet;
