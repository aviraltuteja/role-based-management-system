import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-0"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-400"></div>
        </div>
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
