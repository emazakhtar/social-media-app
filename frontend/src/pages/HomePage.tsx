import React, { useState, useEffect } from "react";
import Post from "../components/Post";
import { Link } from "react-router-dom";

interface Post {
  _id: string;
  userId: string;
  username: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token") || "";
  console.log("localhost removed from everywhere");
  const fetchPosts = async (query = "") => {
    try {
      const response = await fetch(
        `/api/posts?search=${encodeURIComponent(query)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to fetch posts.");
      } else {
        // Transform the posts data to include required properties
        const transformedPosts = data.posts.map((post: any) => ({
          ...post,
          username: post.username || "Anonymous",
          likes: post.likes || 0,
          comments: post.comments || 0,
          isLiked: post.isLiked || false,
        }));
        setPosts(transformedPosts);
      }
    } catch (err) {
      setError("An error occurred while fetching posts.");
    }
  };

  useEffect(() => {
    fetchPosts(search);
  }, [search]);

  const handleLike = (postId: string) => {
    // Implement like functionality
    console.log("Liked post:", postId);
  };

  const handleComment = (postId: string) => {
    // Implement comment functionality
    console.log("Comment on post:", postId);
  };

  const handleShare = (postId: string) => {
    // Implement share functionality
    console.log("Share post:", postId);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h2>Social Feed</h2>
      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {posts.map((post) => (
        <Post
          key={post._id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      ))}
      <Link to="/create-post" style={{ display: "block", marginTop: "20px" }}>
        Create a new post
      </Link>
    </div>
  );
};

export default HomePage;
