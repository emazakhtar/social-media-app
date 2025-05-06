// src/components/Protected.tsx
import React, { useEffect, useState } from "react";
import { Grid } from "react-loader-spinner";
import { Navigate } from "react-router-dom";

interface ProtectedProps {
  children: React.ReactNode;
}

const Protected: React.FC<ProtectedProps> = ({ children }) => {
  // 1. are we still checking localStorage?
  const [checking, setChecking] = useState<boolean>(true);
  // 2. what's the token value?
  const [token, setToken] = useState<string | null>(null);

  // On mount: read token once
  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    setChecking(false);
  }, []);

  // 3. Still verifying? Show loader
  if (checking) {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <Grid
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="grid-loading"
          radius="12.5"
          visible={true}
        />
      </div>
    );
  }

  // 4. No token → redirect
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 5. Got token → render protected children
  return <>{children}</>;
};

export default Protected;
