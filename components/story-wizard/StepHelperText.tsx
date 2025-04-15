import React from 'react';

interface StepHelperTextProps {
  message: string;
}

export default function StepHelperText({ message }: StepHelperTextProps) {
  return (
    <div className="flex items-start mb-6">
      {/* Cartoon speech bubble */}
      <div className="relative bg-yellow-100 border-2 border-yellow-300 rounded-2xl px-6 py-4 shadow-lg font-bold text-lg text-yellow-900 font-comic">
        <span>{message}</span>
        {/* Speech bubble tail */}
        <svg
          className="absolute left-6 -bottom-4"
          width="32"
          height="20"
          viewBox="0 0 32 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0 C 8 20, 24 20, 32 0"
            fill="#FEF3C7"
            stroke="#FDE68A"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
