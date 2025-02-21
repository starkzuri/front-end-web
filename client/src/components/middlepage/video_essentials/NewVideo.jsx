import React, { useRef, useState } from "react";
import TopNav from "../../navigation/TopNav";
import SideNav from "../../navigation/SideNav";
import Main from "../Main";
import styles from "./NewVideo.module.css";
import { useAppContext } from "../../../providers/AppProvider";
import { uploadToIPFS } from "../../../Infura";

const NewVideo = () => {
  const [uploadedVideo, setUploadedVideo] = useState(false);
  const { contract, address } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const uploadableVideo = useRef();
  const description = useRef();

  const handleSubmit = () => {
    const _description = description.current.value;
    if (address) {
      const myCall = contract.populate("create_reel", [
        _description,
        uploadedVideo,
      ]);
      setLoading(true);
      contract["create_reel"](myCall.calldata)
        .then((res) => {
          console.info("Successful response", res);
        })
        .catch((err) => {
          console.error("Error: ", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      handleWalletConnection();
    }
  };

  const handleVideoUpload = async () => {
    const video = uploadableVideo.current.files[0];
    if (video) {
      setFileName(video.name);
      setLoading(true);
      const response = await uploadToIPFS(video);
      if (response) {
        console.log(response);
        setLoading(false);
        setUploadedVideo(response);
      }
    }
  };

  return (
    <div className={styles.container}>
      <TopNav />
      <SideNav />
      <Main>
        <div className={styles.panel}>
          <h2 className={styles.title}>Upload New Video</h2>
          <div className={styles.divider}></div>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}> 
              <label className={styles.label}>Description</label>
              <textarea
                ref={description} 
                className={styles.input}
                placeholder="Add a description for your video..."
                rows="4"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Upload Video</label>
              <div className={styles.fileUploadContainer}>
                <input
                  type="file"
                  ref={uploadableVideo}
                  onChange={handleVideoUpload}
                  className={styles.fileInput}
                  accept="video/*"
                  id="videoUpload"
                />
                <label htmlFor="videoUpload" className={styles.fileUploadLabel}>
                  <div className={styles.uploadIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11L12 8 15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 16.7428C21.2215 15.734 22 14.2079 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 6.886 15.9661 6.69774C14.6621 4.48484 12.2544 3 9.5 3C5.35786 3 2 6.35786 2 10.5C2 12.5661 2.83545 14.4371 4.18695 15.7935" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {fileName ? fileName : "Choose a video file"}
                </label>
              </div>
              {uploadedVideo && <div className={styles.uploadSuccess}>Video uploaded successfully!</div>}
            </div>
          </div>
          
          <div className={styles.buttonContainer}>
            <button
              onClick={handleSubmit}
              className={styles.submitButton}
              disabled={loading || !uploadedVideo}
            >
              {loading ? (
                <span className={styles.loadingSpinner}></span>
              ) : (
                "Create Reel"
              )}
            </button>
          </div>
        </div>
      </Main>
    </div>
  );
};

export default NewVideo;