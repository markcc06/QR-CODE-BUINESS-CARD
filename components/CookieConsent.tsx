"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleConsent = (choice: "accepted" | "rejected") => {
    localStorage.setItem("cookieConsent", choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-100 text-gray-900 px-6 py-4 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between transition-opacity duration-300 ease-in-out animate-fadeIn z-50"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <p className="text-sm mb-3 sm:mb-0">
        We use cookies to improve your experience, analyze traffic, and personalize content. 
        By continuing, you agree to our cookie policy.
      </p>
      <div className="flex space-x-3">
        <button
          onClick={() => handleConsent("accepted")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Accept
        </button>
        <button
          onClick={() => handleConsent("rejected")}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 text-sm"
        >
          Reject
        </button>
      </div>
    </div>
  );
}