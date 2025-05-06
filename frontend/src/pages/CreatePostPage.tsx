import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaImage,
  FaSmile,
  FaGlobe,
  FaUserFriends,
  FaTimes,
} from "react-icons/fa";
import styles from "./CreatePostPage.module.css";

const CreatePostPage: React.FC = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<"public" | "friends">("public");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePrivacyChange = () => {
    setPrivacy(privacy === "public" ? "friends" : "public");
  };

  const token = localStorage.getItem("token") || "";
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append(
        "userId",
        localStorage.getItem("userId") || "unknownUser"
      );
      formData.append("privacy", privacy);
      if (image) formData.append("image", image);

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to create post.");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("An error occurred while creating the post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.createPostContainer}>
      <div className={styles.createPostHeader}>
        <img
          src={`https://ui-avatars.com/api/?name=${localStorage.getItem(
            "username"
          )}&background=random`}
          alt="User"
          className={styles.userAvatar}
        />
        <div className={styles.privacySelector} onClick={handlePrivacyChange}>
          {privacy === "public" ? <FaGlobe /> : <FaUserFriends />}
          <span>{privacy === "public" ? "Public" : "Friends"}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          className={styles.postInput}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required={!image}
        />

        {imagePreview && (
          <div className={styles.imagePreview}>
            <img
              src={imagePreview}
              alt="Preview"
              className={styles.previewImage}
            />
            <button
              type="button"
              className={styles.removeImage}
              onClick={handleRemoveImage}
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className={styles.postOptions}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className={styles.optionButton}
              onClick={() => fileInputRef.current?.click()}
            >
              <FaImage />
              <span>Photo/Video</span>
            </button>
            <button type="button" className={styles.optionButton}>
              <FaSmile />
              <span>Feeling/Activity</span>
            </button>
          </div>
          <button
            type="submit"
            className={styles.postButton}
            disabled={isSubmitting || (!content.trim() && !image)}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </form>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default CreatePostPage;
