import React, { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BeatLoader } from "react-spinners";
import TopNav from "../../components/navigation/TopNav";
import SideNav from "../../components/navigation/SideNav";
import Main from "../../components/middlepage/Main";
import styles from "./NewCommunity.module.css";
import { useAppContext } from "../../providers/AppProvider";
import { uploadToIPFS } from "../../Infura";

const NewCommunity = () => {
  const communityName = useRef();
  const description = useRef();
  const profileImage = useRef();
  const coverImage = useRef();
  const [profile, setProfile] = useState("");
  const [cover, setCover] = useState("");
  const { contract, address, handleWalletConnection } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [previewProfile, setPreviewProfile] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);

  const handleSubmit = () => {
    const _communityName = communityName.current.value;
    const _description = description.current.value;
    
    if (!_communityName || !_description) {
      toast.error("Please fill in all required fields", {
        className: styles.toast_message,
      });
      return;
    }
    
    if (address) {
      const myCall = contract.populate("create_community", [
        _communityName,
        _description,
        profile,
        cover,
      ]);
      setLoading(true);
      contract["create_community"](myCall.calldata)
        .then((res) => {
          console.info("Successful response", res);
          toast.success("Community created successfully!", {
            className: styles.toast_message,
          });
          // Reset form
          communityName.current.value = "";
          description.current.value = "";
          setProfile("");
          setCover("");
          setPreviewProfile(null);
          setPreviewCover(null);
        })
        .catch((err) => {
          console.error("Error: ", err);
          toast.error("Failed to create community. Please try again.", {
            className: styles.toast_message,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      handleWalletConnection();
    }
  };

  const handleProfileUpload = async () => {
    const _profile = profileImage.current.files[0];
    if (!_profile) return;
    
    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewProfile(e.target.result);
    };
    reader.readAsDataURL(_profile);
    
    setLoading(true);
    try {
      const response = await uploadToIPFS(_profile);
      if (response) {
        setProfile(response);
        toast.info("Profile image uploaded successfully", {
          className: styles.toast_message,
        });
      }
    } catch (error) {
      toast.error("Failed to upload profile image", {
        className: styles.toast_message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async () => {
    const _cover = coverImage.current.files[0];
    if (!_cover) return;
    
    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewCover(e.target.result);
    };
    reader.readAsDataURL(_cover);
    
    setLoading(true);
    try {
      const response = await uploadToIPFS(_cover);
      if (response) {
        setCover(response);
        toast.info("Cover image uploaded successfully", {
          className: styles.toast_message,
        });
      }
    } catch (error) {
      toast.error("Failed to upload cover image", {
        className: styles.toast_message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <TopNav />
      <SideNav />
      <Main>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>Create New Community</h2>
            <p>Fill in the details below to establish your community space</p>
          </div>
          
          <div className={styles.formBody}>
            <div className={styles.formSection}>
              <h3>Basic Information</h3>
              <div className={styles.inputGroup}>
                <label htmlFor="communityName">Community Name*</label>
                <input
                  id="communityName"
                  ref={communityName}
                  placeholder="Enter community name"
                  className={styles.textInput}
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  ref={description}
                  placeholder="Describe what your community is about"
                  className={styles.textareaInput}
                  rows="4"
                  required
                />
              </div>
            </div>
            
            <div className={styles.formSection}>
              <h3>Community Visuals</h3>
              
              <div className={styles.imageUploaders}>
                <div className={styles.imageUploader}>
                  <label>Profile Image</label>
                  <div 
                    className={styles.dropZone}
                    onClick={() => profileImage.current.click()}
                  >
                    {previewProfile ? (
                      <img src={previewProfile} alt="Profile preview" className={styles.imagePreview} />
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M9 11L12 8 15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Upload profile image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={profileImage}
                      onChange={handleProfileUpload}
                      accept="image/*"
                      className={styles.fileInput}
                    />
                  </div>
                  <small>Recommended size: 400x400px</small>
                </div>
                
                <div className={styles.imageUploader}>
                  <label>Cover Image</label>
                  <div 
                    className={styles.dropZone}
                    onClick={() => coverImage.current.click()}
                  >
                    {previewCover ? (
                      <img src={previewCover} alt="Cover preview" className={styles.imagePreview} />
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M9 11L12 8 15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Upload cover image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={coverImage}
                      onChange={handleCoverUpload}
                      accept="image/*"
                      className={styles.fileInput}
                    />
                  </div>
                  <small>Recommended size: 1200x400px</small>
                </div>
              </div>
            </div>
            
            <div className={styles.formActions}>
              {loading ? (
                <button className={styles.submitButton} disabled>
                  <BeatLoader loading={loading} color="#fff" size={10} />
                </button>
              ) : (
                <button
                  className={styles.submitButton}
                  onClick={handleSubmit}
                >
                  Create Community
                </button>
              )}
            </div>
          </div>
        </div>
      </Main>
    </div>
  );
};

export default NewCommunity;