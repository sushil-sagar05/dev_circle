"use client";

import React from "react";
import Link from "next/link";
import { Loader2, Clock } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gray-50">
      <Clock className="mb-6 h-16 w-16 text-gray-400 animate-pulse" />
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
         Coming Soon!
      </h1>
      <p className="max-w-lg text-gray-600 mb-8">
        We're working hard to bring you exciting new features. Stay tuned for updates!
      </p>

      <ul className="space-y-4 text-left max-w-md w-full bg-white shadow-md rounded-md p-6">
        <li className="flex items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" />
          <span>Real-time notifications</span>
        </li>
        <li className="flex items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" />
          <span>Dark mode toggle</span>
        </li>
        <li className="flex items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" />
          <span>Enhanced search functionality</span>
        </li>
        <li className="flex items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" />
          <span>Post scheduling</span>
        </li>
      </ul>

      <Link
        href="/"
        className="mt-10 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
