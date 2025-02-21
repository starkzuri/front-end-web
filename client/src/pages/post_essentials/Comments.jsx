import React, { useState, useEffect } from "react";
import TopNav from "../../components/navigation/TopNav";
import SideNav from "../../components/navigation/SideNav";
import Main from "../../components/middlepage/Main";
import Post from "../../components/middlepage/Post";
import MobileSidenav from "../../components/navigation/MobileSidenav";
import FollowersCard from "../../components/rightside/FollowersCard";
import CommentContainer from "../../components/comment/CommentContainer";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../providers/AppProvider";
import {
  bigintToLongAddress,
  bigintToShortStr,
  timeAgo,
} from "../../utils/AppUtils";
import styles from "./Comments.module.css";

const Comments = () => {
  const [navOpen, setNavOpen] = useState(false);
  const { id } = useParams();
  const { contract } = useAppContext();
  const [posts, setPosts] = useState({});
  const [loading, setLoading] = useState(false);
  const [commentList, setCommentList] = useState([]);
  const [commentText, setCommentText] = useState("");

  const handleMobileMenuClick = () => {
    setNavOpen(!navOpen);
  };

  const view_post = () => {
    if (!contract || !id) return;
    
    const myCall = contract.populate("view_post", [id]);
    setLoading(true);
    contract["view_post"](myCall.calldata, {
      parseResponse: false,
      parseRequest: false,
    })
      .then((res) => {
        let val = contract.callData.parse("view_post", res?.result ?? res);
        setPosts(val);
      })
      .catch((err) => {
        console.error("Error fetching post: ", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const view_comments = () => {
    if (!contract || !id) return;
    
    const myCall = contract.populate("view_comments", [id]);
    setLoading(true);
    contract["view_comments"](myCall.calldata, {
      parseResponse: false,
      parseRequest: false,
    })
      .then((res) => {
        let val = contract.callData.parse("view_comments", res?.result ?? res);
        setCommentList(val.reverse());
      })
      .catch((err) => {
        console.error("Error fetching comments: ", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !contract || !id) return;
    
    const myCall = contract.populate("add_comment", [id, commentText]);
    setLoading(true);
    
    contract["add_comment"](myCall.calldata)
      .then((res) => {
        setCommentText("");
        // Refresh comments
        view_comments();
      })
      .catch((err) => {
        console.error("Error adding comment: ", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (contract) {
      view_post();
      view_comments();
    }
  }, [contract, id]);

  return (
    <div className={styles.commentsPageContainer}>
      <TopNav onMobileMenuClick={handleMobileMenuClick} />
      <SideNav />
      {navOpen && <MobileSidenav />}

      <Main>
        <div className={styles.pageLayout}>
          <div className={styles.mainContent}>
            <div className={styles.sectionHeader}>
              <h2>Discussion</h2>
              {posts.postId && (
                <span className={styles.postStats}>
                  {posts.comments?.toString() || 0} comments • {posts.likes?.toString() || 0} likes
                </span>
              )}
            </div>

            {loading && !posts.postId ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingPulse}></div>
                <p>Loading post...</p>
              </div>
            ) : posts.postId ? (
              <div className={styles.originalPostWrapper}>
                <Post
                  postId={posts.postId ? posts.postId.toString() : ""}
                  content={posts.content}
                  comments={posts.comments?.toString()}
                  likes={posts.likes?.toString()}
                  images={posts.images?.split(" ")}
                  shares={posts.shares?.toString()}
                  zuri_points={posts.zuri_points?.toString()}
                  userAddress={
                    posts.caller ? bigintToLongAddress(posts.caller) : ""
                  }
                  time_posted={
                    posts.date_posted
                      ? timeAgo(posts.date_posted.toString() * 1000)
                      : ""
                  }
                  className={styles.enhancedPost}
                />
              </div>
            ) : (
              <div className={styles.noPostContainer}>
                <p>This post doesn't exist or has been removed.</p>
              </div>
            )}

            <div className={styles.commentSection}>
              <div className={styles.addCommentContainer}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add to the discussion..."
                  className={styles.commentInput}
                  disabled={loading}
                />
                <button 
                  className={styles.commentButton}
                  onClick={handleAddComment}
                  disabled={loading || !commentText.trim()}
                >
                  {loading ? "Posting..." : "Post Comment"}
                </button>
              </div>

              <div className={styles.commentsContainer}>
                <div className={styles.commentsHeader}>
                  <h3>Comments ({commentList?.length || 0})</h3>
                  {commentList?.length > 0 && (
                    <div className={styles.sortOptions}>
                      <span className={`${styles.sortOption} ${styles.active}`}>Newest</span>
                      <span className={styles.sortOption}>Oldest</span>
                    </div>
                  )}
                </div>

                {loading && commentList?.length === 0 ? (
                  <div className={styles.commentsLoading}>
                    <div className={styles.loadingPulse}></div>
                    <p>Loading comments...</p>
                  </div>
                ) : commentList?.length > 0 ? (
                  <div className={styles.commentsList}>
                    {commentList.map((comment, id) => (
                      <CommentContainer
                        content={comment.content}
                        key={id}
                        userAddress={bigintToLongAddress(comment.caller)}
                        time_commented={timeAgo(
                          comment.time_commented.toString() * 1000
                        )}
                        className={styles.enhancedComment}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noCommentsMessage}>
                    <p>Be the first to comment on this post!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.sideContent}>
            <div className={styles.stickyContainer}>
              <div className={styles.sidePanel}>
                <h3>About This Discussion</h3>
                <div className={styles.panelContent}>
                  <p>This thread was started {posts.date_posted ? timeAgo(posts.date_posted.toString() * 1000) : "recently"}.</p>
                  <div className={styles.discussionStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{posts.comments?.toString() || 0}</span>
                      <span className={styles.statLabel}>Comments</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{posts.likes?.toString() || 0}</span>
                      <span className={styles.statLabel}>Likes</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{posts.shares?.toString() || 0}</span>
                      <span className={styles.statLabel}>Shares</span>
                    </div>
                  </div>
                </div>
              </div>
              <FollowersCard className={styles.enhancedFollowersCard} />
            </div>
          </div>
        </div>
      </Main>
    </div>
  );
};

export default Comments;