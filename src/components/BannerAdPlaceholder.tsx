import React from 'react';

export const BannerAdPlaceholder = () => (
  <div className="my-4 flex justify-center">
    <div className="w-full max-w-4xl bg-white/10 border border-white/20 rounded-lg p-3 flex flex-col items-center shadow-md">
      <span className="text-xs uppercase tracking-widest text-[#E50914] font-bold mb-1">Ad</span>
      <div className="text-center text-white/80 text-base">
        {/* Replace this with your banner ad code */}
        <span>Banner Ad - Your ad could be here!</span>
      </div>
    </div>
  </div>
); 