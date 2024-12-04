// /app/record/page.tsx
"use client";

import Header from "@/app/_components/Header";

export default function ResourcesPage() {
  return (
    <div className="flex flex-col items-center  min-h-screen p-4">
      <div className="w-full max-w-2xl flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-center">Resources</h2>
        <a
          href="https://torger.se/anders/bikefit/"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200"
        >
          <h3 className="text-xl font-semibold text-white mb-2">Do-It-Yourself Bike Fit Guide</h3>
          <p className="text-gray-300">
            A comprehensive guide to bike fitting, covering everything from basic adjustments to advanced measurements.
            Perfect for cyclists looking to optimize their riding position and comfort.
          </p>
          <div className="mt-4 text-blue-400 hover:text-blue-300">Read more →</div>
        </a>
      </div>
    </div>
  );
}
