import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CallData, cairo } from "starknet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "react-loading-skeleton/dist/skeleton.css";
import { BeatLoader } from "react-spinners";
import {
  faListDots,
  faMessage,
  faHeart,
  faEye,
  faShare,
  faDiamond,
  faPaperclip,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./Post.module.css";
import profile from "../../assets/ST4.png";
import postimg from "../../assets/post_img.jpg";
import CommentContainer from "../comment/CommentContainer";
import { Link } from "react-router-dom";
import { useAppContext } from "../../providers/AppProvider";
import { CONTRACT_ADDRESS } from "../../providers/abi";
import { useNavigate } from "react-router-dom";
import { bigintToShortStr } from "../../utils/AppUtils";

const Post = ({
  username,
  profile_pic,
  time_posted,
  user_image,
  content,
  images,
  likes,
  shares,
  comments,
  zuri_points,
  userAddress,
  postId,
}) => {
  const { contract, provider, address, handleWalletConnection } =
    useAppContext();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const commentText = useRef();
  const navigate = useNavigate();

  const claimPoints = () => {
    if (address) {
      const myCall = contract.populate("claim_post_points", [postId]);
      setLoading(true);
      contract["claim_post_points"](myCall.calldata)
        .then((res) => {
          console.info("Successful Response:", res);
          toast.info("post claimed successfully", {
            className: styles.toast_message,
          });
        })
        .catch((err) => {
          console.error("Error: ", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const comment_on_post = async () => {
    if (address) {
      const _comment_text = commentText.current.value;
      const myCall = contract.populate("comment_on_post", [
        postId,
        _comment_text,
      ]);
      setLoading(true);

      const result = await provider
        .execute([
          {
            contractAddress:
              "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "approve",
            calldata: CallData.compile({
              spender: CONTRACT_ADDRESS,
              amount: cairo.uint256(5900000000000n),
            }),
          },
          {
            contractAddress: CONTRACT_ADDRESS,
            entrypoint: "comment_on_post",
            calldata: myCall.calldata,
          },
        ])
        .then((res) => {
          console.log(res);
          toast.info("comment written successfully", {
            className: styles.toast_message,
          });
          commentText.current.value = "";
          setLoading(false);
        });
    } else {
      handleWalletConnection();
    }
  };

  const like_post = async (e) => {
    if (address) {
      const myCall = contract.populate("like_post", [postId]);
      setLoading(true);
      // contract["like_post"](myCall.calldata)
      //   .then((res) => {
      //     console.info("Successful Response:", res);
      //   })
      //   .catch((err) => {
      //     console.error("Error: ", err);
      //   })
      //   .finally(() => {
      //     setLoading(false);
      //   });

      const result = await provider
        .execute([
          {
            contractAddress:
              "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "approve",
            calldata: CallData.compile({
              spender: CONTRACT_ADDRESS,
              amount: cairo.uint256(31000000000000n),
            }),
          },
          {
            contractAddress: CONTRACT_ADDRESS,
            entrypoint: "like_post",
            calldata: myCall.calldata,
          },
        ])
        .then((res) => {
          console.log(res);
          toast.info("content liked successfully", {
            className: styles.toast_message,
          });
          setLoading(false);
        });
    } else {
      handleWalletConnection();
    }
    // await provider.waitForTransaction(result.transaction_hash);
  };

  useEffect(() => {
    const view_user = () => {
      const myCall = contract.populate("view_user", [userAddress]);
      setLoading(true);
      contract["view_user"](myCall.calldata, {
        parseResponse: false,
        parseRequest: false,
      })
        .then((res) => {
          let val = contract.callData.parse("view_user", res?.result ?? res);
          // console.log(val);
          setUser(val);
        })
        .catch((err) => {
          console.error("Error: ", err);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    if (contract && userAddress) {
      view_user();
    }
  }, [contract, userAddress]);
  // console.log(user);
  return (
    <div className={`${styles.gradient_border}`}>
      <ToastContainer />
      {user && (
        <div
          className={styles.post_navigation}
          onClick={() => navigate(`/post/${postId}`)}
        >
          <div className={styles.profile}>
            <img src={`${user.profile_pic || profile_pic}`} />
            <div className={styles.profile_details}>
              <span>{bigintToShortStr(user.username)}</span>
              <br />
              <small>{time_posted}</small>
            </div>
          </div>
          <div>
            <Link to={`/post/${postId}`}>
              <FontAwesomeIcon icon={faEye} />
            </Link>
          </div>
        </div>
      )}
      <div className={styles.post_body}>
        {/* <p style={{ whiteSpace: "pre-wrap" }}>{content}</p> */}
        <p dangerouslySetInnerHTML={{ __html: content }} />
        <br />
        <div className={styles.post_media}>
          {images &&
            images.map((image, index) => {
              return <img key={`${postId}_${index}`} src={`${image}`} /> || "";
            })}
        </div>
      </div>
      <br />
      <div className={`w3-bar ${styles.interaction_bar}`}>
        <Link to={`/post/${postId}`} className="w3-bar-item">
          <FontAwesomeIcon icon={faMessage} />
          &nbsp; {comments} comments
        </Link>
        <button
          className="w3-bar-item w3-transparent w3-text-white"
          value={postId}
          onClick={like_post}
        >
          <FontAwesomeIcon className="w3-text-red" icon={faHeart} />
          &nbsp; {likes} likes
        </button>
        <a className="w3-bar-item">
          <FontAwesomeIcon icon={faShare} />
          &nbsp;{shares} shares
        </a>
        <a className="w3-bar-item">
          <FontAwesomeIcon icon={faDiamond} />
          &nbsp;{zuri_points} Zuri Points
        </a>
        {address == userAddress && zuri_points > 0 ? (
          <button className="w3-button w3-blue w3-round" onClick={claimPoints}>
            Claim
          </button>
        ) : (
          ""
        )}
      </div>
      <hr />
      <div className={styles.comment_interaction_section}>
        <img src={`${user.profile_pic}`} />
        <div className={styles.comment_field}>
          <input
            className="w3-input"
            ref={commentText}
            placeholder="write your comment"
          />

          {/* <FontAwesomeIcon
            icon={faPaperclip}
            className={`${styles.comment_button} w3-padding`}
          />
          <FontAwesomeIcon
            icon={faImage}
            className={`${styles.comment_button} w3-padding`}
          /> */}
          {loading ? (
            <button className="w3-btn w3-blue w3-round">
              <BeatLoader loading={loading} color="#fff" size={10} />
            </button>
          ) : (
            <button
              className="w3-btn w3-blue w3-round"
              onClick={comment_on_post}
            >
              comment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
