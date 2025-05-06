import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ProfilePage.module.css";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  bio?: string;
  profilePicture?: string;
  friendsCount?: number;
  postsCount?: number;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token") || "";
  const userId = localStorage.getItem("userId") || "";
  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `/api/profile/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || "Failed to fetch profile.");
        } else {
          setProfile(data.user);
        }
      } catch (err) {
        setError("An error occurred while fetching the profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>No profile found.</p>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileInfo}>
        <div
          className={styles.profilePicture}
          style={{
            backgroundImage: `url(${
              profile.profilePicture || "https://via.placeholder.com/168"
            })`,
          }}
        />
        <div className={styles.profileContent}>
          <div className={styles.mainContent}>
            <h1 style={{ marginBottom: "20px" }}>{profile.username}</h1>
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <h3>{profile.postsCount || 0}</h3>
                <p>Posts</p>
              </div>
              <div className={styles.statItem}>
                <h3>{profile.friendsCount || 0}</h3>
                <p>Friends</p>
              </div>
            </div>
            <div className={styles.bioSection}>
              <h3>About</h3>
              <p>{profile.bio || "No bio available"}</p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Member Since:</strong>{" "}
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className={styles.sidebar}>
            <h3>Photos</h3>
            <div className={styles.photosGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.photoPlaceholder} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
