import React, { useRef, useState, useEffect } from "react";
import { CallData, cairo } from "starknet";
import styles from "../ReelComponent.module.css";
import { CONTRACT_ADDRESS } from "../../../providers/abi";
import { Link } from "react-router-dom";
import { useAppContext } from "../../../providers/AppProvider";
import { bigintToLongAddress, bigintToShortStr } from "../../../utils/AppUtils";
import CommentContainer from "../../comment/CommentContainer";
import {
  Camera,
  RotateCcw,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Music2,
  Heart,
  RefreshCw,
  Coins,
} from "lucide-react";

const Video = ({
  view_reel,
  video,
  description,
  caller,
  comments,
  dislikes,
  likes,
  reel_id,
  shares,
  timestamp,
  zuri_points,
}) => {
  const { contract, address, handleWalletConnection, provider } = useAppContext();
  const [playing, setPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [reelComments, setReelComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const playableVideo = useRef();
  const reel_comment = useRef();

  const closeCommentModal = () => setCommentModalOpen(false);
  const openCommentModal = () => setCommentModalOpen(true);

  const handleVideoClick = () => {
    if (playableVideo.current.paused) {
      playableVideo.current.play();
      setPlaying(true);
    } else {
      playableVideo.current.pause();
      setPlaying(false);
    }
  };

  const commentOnReel = async () => {
    if (!address) {
      handleWalletConnection();
      return;
    }

    try {
      const content = reel_comment.current.value;
      if (!content.trim()) return;

      const myCall = contract.populate("comment_on_reel", [reel_id, content]);
      await provider.execute([
        {
          contractAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: CONTRACT_ADDRESS,
            amount: cairo.uint256(5900000000000),
          }),
        },
        {
          contractAddress: CONTRACT_ADDRESS,
          entrypoint: "comment_on_reel",
          calldata: myCall.calldata,
        },
      ]);
      
      view_reel();
      reel_comment.current.value = '';
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleLike = async () => {
    if (!address) {
      handleWalletConnection();
      return;
    }

    try {
      const myCall = contract.populate("like_reel", [reel_id]);
      setIsLiked(prev => !prev);
      
      await provider.execute([
        {
          contractAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: CONTRACT_ADDRESS,
            amount: cairo.uint256(31000000000000n),
          }),
        },
        {
          contractAddress: CONTRACT_ADDRESS,
          entrypoint: "like_reel",
          calldata: myCall.calldata,
        },
      ]);
    } catch (error) {
      setIsLiked(prev => !prev);
      console.error("Error liking reel:", error);
    }
  };

  const handleDislike = async () => {
    if (!address) {
      handleWalletConnection();
      return;
    }

    try {
      const myCall = contract.populate("dislike_reel", [reel_id]);
      setIsDisliked(prev => !prev);

      await provider.execute([
        {
          contractAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: CONTRACT_ADDRESS,
            amount: cairo.uint256(14000000000000n),
          }),
        },
        {
          contractAddress: CONTRACT_ADDRESS,
          entrypoint: "dislike_reel",
          calldata: myCall.calldata,
        },
      ]);
    } catch (error) {
      setIsDisliked(prev => !prev);
      console.error("Error disliking reel:", error);
    }
  };

  const handleRepost = async () => {
    if (!address) {
      handleWalletConnection();
      return;
    }

    try {
      const myCall = contract.populate("repost_reel", [reel_id]);
      await provider.execute([
        {
          contractAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: CONTRACT_ADDRESS,
            amount: cairo.uint256(31000000000000n),
          }),
        },
        {
          contractAddress: CONTRACT_ADDRESS,
          entrypoint: "repost_reel",
          calldata: myCall.calldata,
        },
      ]);
      view_reel();
    } catch (error) {
      console.error("Error reposting:", error);
    }
  };

  const followUser = async () => {
    if (!address) {
      handleWalletConnection();
      return;
    }

    try {
      const myCall = contract.populate("follow_user", [caller]);
      await contract["follow_user"](myCall.calldata);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  useEffect(() => {
    const scroll = document.getElementById("video-container");
    if (scroll) {
      scroll.addEventListener("scroll", () => {
        playableVideo.current?.pause();
      });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.8 }
    );

    if (playableVideo.current) {
      observer.observe(playableVideo.current);
    }

    return () => {
      if (playableVideo.current) {
        setIsVisible(false);
        observer.unobserve(playableVideo.current);
      }
    };
  }, [playableVideo]);

  useEffect(() => {
    if (isVisible && playableVideo.current) {
      playableVideo.current.play();
      setPlaying(true);
    } else if (playableVideo.current) {
      playableVideo.current.pause();
      setPlaying(false);
    }
  }, [isVisible]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!contract) return;

      try {
        const myCall = contract.populate("view_user", [caller]);
        const response = await contract["view_user"](myCall.calldata, {
          parseResponse: false,
          parseRequest: false,
        });
        const val = contract.callData.parse("view_user", response?.result ?? response);
        setUser(val);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData();
  }, [contract, caller]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!contract) return;

      try {
        const myCall = contract.populate("view_reel_comments", [reel_id]);
        const response = await contract["view_reel_comments"](myCall.calldata, {
          parseResponse: false,
          parseRequest: false,
        });
        const val = contract.callData.parse("view_reel_comments", response?.result ?? response);
        setReelComments(val);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [contract, reel_id]);

  return (
    <>
      {commentModalOpen && (
        <div className="w3-modal w3-show">
          <div className={`w3-modal-content w3-card-4 w3-padding ${styles.reel__modal__content}`}>
            <div className="w3-bar w3-padding">
              <span className="w3-large">Comments</span>
              <button className="w3-button w3-right" onClick={closeCommentModal}>
                &times;
              </button>
            </div>
            
            <div className={styles.comment_input}>
              <textarea
                ref={reel_comment}
                className="w3-input"
                placeholder="Write your comment..."
              />
              <button 
                onClick={commentOnReel}
                className="px-4 py-2 ml-2"
              >
                Post
              </button>
            </div>

            <div className={`${styles.comment_body} mt-8`}>
              {reelComments?.length > 0 ? (
                reelComments.map((comment, id) => (
                  <CommentContainer
                    key={id}
                    userAddress={bigintToLongAddress(comment.caller)}
                    profilePic={user.profile_pic}
                    content={comment.content}
                  />
                ))
              ) : (
                <p className="text-center text-gray-400">No comments yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.video}>
        <div className={styles.videoHeader}>
          <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
            <RotateCcw className="w-6 h-6 text-white" />
          </button>
          <h3 className="text-lg font-semibold text-white">Reels</h3>
          <Link 
            to="/reels/new-reel"
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <Camera className="w-6 h-6 text-white" />
          </Link>
        </div>

        <video
          src={video}
          preload="auto"
          onClick={handleVideoClick}
          ref={playableVideo}
          className={styles.video__player}
          loop
        />

        <div className={styles.videoFooter}>
          <div className={styles.videoFooter__text}>
            <img
              className={styles.user__avatar}
              src={user.profile_pic}
              alt={user.username ? bigintToShortStr(user.username) : "User"}
            />
            <div className="flex items-center gap-2">
              <h3 className="font-medium">
                {user && bigintToShortStr(user.username)}
              </h3>
              <button
                onClick={followUser}
                className="px-4 py-1 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
              >
                Follow
              </button>
            </div>
          </div>

          <div className={styles.videoFooter__ticker}>
            <Music2 className="w-5 h-5 text-white" />
            <marquee className="text-sm text-white">
              {description}
            </marquee>
          </div>

          <div className={styles.videoFooter__actions}>
            <div className={styles.videoFooter__actionsRight}>
              <button
                onClick={handleLike}
                className={`flex flex-col items-center gap-1 transition-transform hover:scale-110 ${
                  isLiked ? 'text-red-500' : 'text-white'
                }`}
              >
                <Heart className="w-6 h-6" />
                <span className="text-sm">{likes}</span>
              </button>

              <button
                onClick={handleDislike}
                className={`flex flex-col items-center gap-1 transition-transform hover:scale-110 ${
                  isDisliked ? 'text-blue-500' : 'text-white'
                }`}
              >
                <ThumbsDown className="w-6 h-6" />
                <span className="text-sm">{dislikes}</span>
              </button>

              <button
                onClick={openCommentModal}
                className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm">{comments}</span>
              </button>

              <button
                onClick={handleRepost}
                className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
              >
                <RefreshCw className="w-6 h-6" />
                <span className="text-sm">{shares}</span>
              </button>

              <div className="flex flex-col items-center gap-1 text-white">
                <Coins className="w-6 h-6" />
                <span className="text-sm">{zuri_points}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Video;