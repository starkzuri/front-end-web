import React, { useEffect, useState } from "react";
import styles from "./CommentContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots, faSmile } from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../providers/AppProvider";
import { bigintToShortStr } from "../../utils/AppUtils";

const CommentContainer = ({
  containsThread,
  username,
  userAddress,
  time_commented,
  profilePic,
  content,
  likes,
  postId,
  replies = [],
}) => {
  const { contract } = useAppContext();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyList, setReplyList] = useState(replies);
  const [showReplyInput, setShowReplyInput] = useState(false);

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
  }, [contract]);

  const handleReplySubmit = () => {
    if (replyText.trim() !== "") {
      setReplyList([...replyList, { username, content: replyText, time_commented: "Just now" }]);
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  return (
    <div className={styles.comment_container}>
      {user && (
        <div className={styles.comment_header}>
          <div className={styles.commenter_profile_and_name}>
            <div
              className={styles.commenter_profile}
              style={{ backgroundImage: `url(${user.profile_pic})` }}
            ></div>
            <div className={styles.commenter_name}>
              <span>{bigintToShortStr(user.username)}</span>
              <span className={styles.duration}>{time_commented}</span>
            </div>
          </div>
          <FontAwesomeIcon icon={faCommentDots} />
        </div>
      )}

      <div className={styles.comment_body}>
        <p>{content}</p>
      </div>

      <div className={styles.comment_footer}>
        <button className={styles.react_button}>
          {likes && likes.toString()}
          <FontAwesomeIcon icon={faSmile} />
        </button>
        <button className={styles.reply_button} onClick={() => setShowReplyInput(!showReplyInput)}>
          Reply
        </button>
      </div>

      {showReplyInput && (
        <div>
          <input
            type="text"
            className={styles.reply_input}
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button className={styles.reply_button} onClick={handleReplySubmit}>
            Submit
          </button>
        </div>
      )}

      {replyList.length > 0 && (
        <div className={styles.replies_section}>
          {replyList.map((reply, index) => (
            <CommentContainer
              key={index}
              username={reply.username}
              time_commented={reply.time_commented}
              content={reply.content}
              profilePic={profilePic}
              likes={0}
              containsThread={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentContainer;
