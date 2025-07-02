"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: "",
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        },
        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white",
          },
        },
        error: {
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "white",
          },
        },
      }}
    />
  );
}
