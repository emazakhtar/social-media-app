import React, { useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaEllipsisH,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import styles from "./Post.module.css";

interface PostProps {
  post: {
    _id: string;
    userId: string;
    username: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    likes: number;
    comments: number;
    isLiked: boolean;
  };
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

const Post: React.FC<PostProps> = ({ post, onLike, onComment, onShare }) => {
  const [showOptions, setShowOptions] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  return (
    <div className={styles.post}>
      {/* Post Header */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={`https://ui-avatars.com/api/?name=${post.username}&background=random`}
            alt={post.username}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a1a1a",
              }}
            >
              {post.username}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#666",
              }}
            >
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={styles.optionsButton}
          >
            <FaEllipsisH color="#666" />
          </button>
          {showOptions && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                padding: "8px 0",
                minWidth: "150px",
              }}
            >
              <button className={styles.optionItem}>Report</button>
              <button className={styles.optionItem}>Save Post</button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div style={{ padding: "16px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            lineHeight: 1.5,
            color: "#1a1a1a",
            whiteSpace: "pre-wrap",
          }}
        >
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div
          style={{
            width: "100%",
            maxHeight: "500px",
            overflow: "hidden",
          }}
        >
          <img
            src={`${encodeURI(post.imageUrl)}`}
            alt="Post content"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* Post Actions */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => onLike(post._id)}
            className={styles.actionButton}
            style={{ color: post.isLiked ? "#ff4444" : "#666" }}
          >
            {post.isLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{post.likes}</span>
          </button>
          <button
            onClick={() => onComment(post._id)}
            className={styles.actionButton}
          >
            <FaComment />
            <span>{post.comments}</span>
          </button>
        </div>
        <button
          onClick={() => onShare(post._id)}
          className={styles.actionButton}
        >
          <FaShare />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default Post;
