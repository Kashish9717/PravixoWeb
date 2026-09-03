// src/lib/format.js

// Format follower/reach/view numbers
export const formatFollowers = (value) => {
  const number = Number(value) || 0;

  if (number >= 1000000000) {
    return `${(number / 1000000000).toFixed(1).replace(/\.0$/, "")}B`;
  }

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return String(number);
};


// Format Indian Rupees
export const formatINR = (value) => {
  const number = Number(value) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};