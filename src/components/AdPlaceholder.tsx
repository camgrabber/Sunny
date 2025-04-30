import React from 'react';

export const AdPlaceholder = () => (
  <div className="my-8 flex justify-center">
    <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-lg p-4 flex flex-col items-center shadow-md">
      <span className="text-xs uppercase tracking-widest text-[#E50914] font-bold mb-2">Ad</span>
      <div className="text-center text-white/80 text-sm">
        {/* Replace this with your ad code */}
        <span>Your ad could be here!</span>
      </div>
    </div>
  </div>
); 