import React from "react";

export default function Loading() {
  return (
    <div className="p-6 flex flex-col space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-36 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="w-full h-[600px] bg-gray-100 animate-pulse rounded border border-gray-200"></div>
    </div>
  );
}
