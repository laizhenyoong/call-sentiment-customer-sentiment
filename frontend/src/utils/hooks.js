// import { useState, useEffect } from 'react';

// // Custom hook for real-time updates
// export const useRealTimeUpdates = (initialData, interval = 5000) => {
//   const [data, setData] = useState(initialData);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const newDataPoint = {
//         time: new Date().toLocaleTimeString(),
//         score: Math.random(),
//       };
//       setData(prevData => [...prevData.slice(-9), newDataPoint]);
//     }, interval);

//     return () => clearInterval(timer);
//   }, [interval]);

//   return data;
// };

// Function to format time correctly
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};