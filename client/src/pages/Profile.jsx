import React, { useState, useRef, useEffect } from "react";
import TopNav from "../components/navigation/TopNav";
import SideNav from "../components/navigation/SideNav";
import Main from "../components/middlepage/Main";
import MobileSidenav from "../components/navigation/MobileSidenav";
import AssetsCard from "../components/rightside/AssetsCard";
import FollowersCard from "../components/rightside/FollowersCard";
import ProfileCard from "../components/rightside/ProfileCard";
import FloatingButton from "../components/navigation/FloatingButton";
import ProfileCardMiddle from "../components/profile_essentials/ProfileCardMiddle";
import ProfileNavigationButtons from "../components/profile_essentials/ProfileNavigationButtons";
import SubNavigation from "../components/navigation/SubNavigation";
import Post from "../components/middlepage/Post";
import ModalContainer from "../components/modal/ModalContainer";
import styles from "./styles/Profile.module.css";
import { useAppContext } from "../providers/AppProvider";
import {
  bigintToLongAddress,
  bigintToShortStr,
  convertToReadableNumber,
  formatDate,
  timeAgo,
} from "../utils/AppUtils";
import BigNumber from "bignumber.js";
import { uploadToIPFS } from "../Infura";
import ConnectWallet from "./login_page/ConnectWallet";

const Profile = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { contract, address } = useAppContext();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState("");
  const [cover, setCover] = useState("");
  const [about, setAbout] = useState("");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [sellZuriModalOpen, setSellZuriModalOpen] = useState(false);

  const [coverPhoto, setCoverPhoto] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [previewProfile, setPreviewProfile] = useState("");
  const [previewCover, setPreviewCover] = useState("");

  const profileImage = useRef();
  const zuriPoints = useRef();
  const coverImage = useRef();

  const handleSellZuriPoints = () => {
    const _zuriPoints = zuriPoints.current.value;

    const myCall = contract.populate("withdraw_zuri_points", [_zuriPoints]);
    setLoading(true);
    contract["withdraw_zuri_points"](myCall.calldata)
      .then((res) => {
        console.info("Successful Response:", res);
        zuriPoints.current.value = "";
      })
      .catch((err) => {
        console.error("Error: ", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log(cover);
  }, [cover]);

  useEffect(() => {
    console.log(profile);
  }, [profile]);

  const view_user = () => {
    const myCall = contract.populate("view_user", [address]);
    setLoading(true);
    contract["view_user"](myCall.calldata, {
      parseResponse: false,
      parseRequest: false,
    })
      .then((res) => {
        let val = contract.callData.parse("view_user", res?.result ?? res);
        console.log(val);
        setUser(val);
        // Pre-populate form fields with existing user data
        if (val) {
          setName(bigintToShortStr(val.name));
          setUsername(bigintToShortStr(val.username));
          setAbout(val.about);
          setPreviewProfile(val.profile_pic);
          setPreviewCover(val.cover_photo);
        }
      })
      .catch((err) => {
        console.error("Error: ", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const get_individual_posts = () => {
    const myCall = contract.populate("filter_post", [address]);
    setLoading(true);
    contract["filter_post"](myCall.calldata, {
      parseResponse: false,
      parseRequest: false,
    })
      .then((res) => {
        let val = contract.callData.parse("filter_post", res?.result ?? res);
        console.log(val);
        setPosts(val.reverse());
      })
      .catch((err) => {
        console.error("Error: ", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleuserNameChange = async (e) => {
    setUsername(e.target.value);
  };

  async function onChangeFile(e) {
    var file = e.target.files[0];
    
    if (file) {
      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);
      setPreviewProfile(previewUrl);
      
      const response = await uploadToIPFS(file);
      console.log(response);
      setProfilePhoto(response);
    }
  }

  const handleCoverChange = async (e) => {
    var file = e.target.files[0];
    
    if (file) {
      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);
      setPreviewCover(previewUrl);
      
      const response = await uploadToIPFS(file);
      console.log(response);
      setCoverPhoto(response);
    }
  };

  const makeInteraction = () => {
    if (!name || !username) {
      alert("Name and username are required");
      return;
    }
    
    const myCall = contract.populate("add_user", [
      name,
      username,
      about,
      profilePhoto,
      coverPhoto,
    ]);
    setLoading(true);
    contract["add_user"](myCall.calldata)
      .then((res) => {
        console.info("Successful Response:", res);
        setModalOpen(false);
        view_user(); // Refresh user data
      })
      .catch((err) => {
        console.error("Error: ", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAboutChange = (e) => {
    setAbout(e.target.value);
  };

  useEffect(() => {
    if (contract && address) {
      view_user();
      get_individual_posts();
    }
  }, [contract]);

  const handleMobileMenuClick = () => {
    setNavOpen(!navOpen);
    console.log(navOpen);
  };
  
  return (
    <div>
      <TopNav onMobileMenuClick={handleMobileMenuClick} />
      <SideNav />

      {navOpen && <MobileSidenav />}

      <Main>
        {sellZuriModalOpen && (
          <ModalContainer closeModal={() => setSellZuriModalOpen(false)}>
            <div className={styles.modalHeader}>
              <h3>Sell Zuri Points</h3>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Enter Amount</label>
                <input
                  className={`w3-input ${styles.input}`}
                  ref={zuriPoints}
                  placeholder="0.00"
                  type="number"
                />
              </div>
              <div className={styles.formActions}>
                <button
                  className={`w3-button ${styles.cancelBtn}`}
                  onClick={() => setSellZuriModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={`w3-button ${styles.primaryBtn}`}
                  onClick={handleSellZuriPoints}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Sell"}
                </button>
              </div>
            </div>
          </ModalContainer>
        )}
        
        {modalOpen && (
          <ModalContainer closeModal={() => setModalOpen(false)}>
            <div className={styles.modalHeader}>
              <h3>Edit Profile</h3>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.imagePreviewSection}>
                <div className={styles.coverPreview} style={{ backgroundImage: `url(${previewCover})` }}>
                  <label htmlFor="coverUpload" className={styles.uploadLabel}>
                    <i className="fa fa-camera"></i>
                    <span>Update Cover</span>
                  </label>
                  <input
                    id="coverUpload"
                    type="file"
                    onChange={handleCoverChange}
                    ref={coverImage}
                    accept="image/*"
                    className={styles.hiddenInput}
                  />
                </div>
                
                <div className={styles.profilePreviewWrapper}>
                  <div 
                    className={styles.profilePreview} 
                    style={{ backgroundImage: `url(${previewProfile})` }}
                  >
                    <label htmlFor="profileUpload" className={styles.uploadLabel}>
                      <i className="fa fa-camera"></i>
                    </label>
                    <input
                      id="profileUpload"
                      type="file"
                      onChange={onChangeFile}
                      ref={profileImage}
                      accept="image/*"
                      className={styles.hiddenInput}
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    value={name}
                    onChange={handleNameChange}
                    className={`w3-input ${styles.input}`}
                    type="text"
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Username</label>
                  <div className={styles.usernameInput}>
                    <span className={styles.atSymbol}>@</span>
                    <input
                      value={username}
                      onChange={handleuserNameChange}
                      className={`w3-input ${styles.input}`}
                      type="text"
                      placeholder="username"
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>About</label>
                  <textarea
                    value={about}
                    onChange={handleAboutChange}
                    className={`w3-input ${styles.textarea}`}
                    placeholder="Tell us about yourself"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className={styles.formActions}>
                  <button
                    onClick={() => setModalOpen(false)}
                    className={`w3-button ${styles.cancelBtn}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={makeInteraction}
                    className={`w3-button ${styles.primaryBtn}`}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </ModalContainer>
        )}
        
        <div className="w3-row-padding w3-stretch">
          <div className="w3-col l8">
            {address ? (
              <>
                {address && user ? (
                  <ProfileCard
                    about={user.about}
                    name={bigintToShortStr(user.name)}
                    username={bigintToShortStr(user.username)}
                    no_following={user.number_following.toString()}
                    no_of_followers={user.no_of_followers.toString()}
                    profile_pic={user.profile_pic}
                    cover_photo={user.cover_photo}
                    zuri_points={user.zuri_points.toString()}
                    date_registered={formatDate(
                      user.date_registered.toString() * 1000
                    )}
                  />
                ) : (
                  ""
                )}
                <br />
                <ProfileNavigationButtons
                  onSellZuriModalOpen={() => setSellZuriModalOpen(true)}
                  onModalOpen={() => setModalOpen(true)}
                />
                <SubNavigation
                  borderData={[
                    { linkName: "posts" },
                    { linkName: "blog" },
                    { linkName: "Zuri Coin" },
                    { linkName: "Diamonds" },
                    { linkName: "NFTs" },
                  ]}
                />
                <br />
                {posts
                  ? posts.map((post) => {
                      return (
                        <Post
                          key={post.postId}
                          postId={post.postId.toString()}
                          content={post.content}
                          likes={post.likes.toString()}
                          comments={post.comments.toString()}
                          shares={post.shares.toString()}
                          zuri_points={post.zuri_points.toString()}
                          userAddress={
                            post.caller ? bigintToLongAddress(post.caller) : ""
                          }
                          images={post.images.split(" ")}
                          time_posted={timeAgo(
                            post.date_posted.toString() * 1000
                          )}
                        />
                      );
                    })
                  : ""}
              </>
            ) : (
              <ConnectWallet />
            )}
          </div>

          <div className="w3-col l4">
            <AssetsCard />
            <br />
            <FollowersCard />
          </div>
        </div>
        <FloatingButton />
      </Main>
    </div>
  );
};

export default Profile;