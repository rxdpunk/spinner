import React, { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';
import spinnerSound from './spinner.wav';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [walletAddresses, setWalletAddresses] = useState([
    'YOUR-WALLET-ADDRESS-1',
    'YOUR-WALLET-ADDRESS-2',
    'YOUR-WALLET-ADDRESS-3',
  ]);

  const [segmentColors, setSegmentColors] = useState([]);

  const canvasRef = useRef(null);
  const spinnerWrapperRef = useRef(null);
  const walletAddressesRef = useRef(null);
  const numWinnersRef = useRef(null);
  const winnersListRef = useRef(null);

  const drawWheel = useCallback(() => {
    const segmentAngle = (2 * Math.PI) / walletAddresses.length;
    for (let i = 0; i < walletAddresses.length; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      drawSegment(
        { start: startAngle, end: endAngle },
        segmentColors[i],
        walletAddresses[i]
      );
    }
  }, [walletAddresses, segmentColors]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  useEffect(() => {
    audioRef.current = new Audio(spinnerSound);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isPlaying]);

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function drawSegment(angle, color, text) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle.start, angle.end);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.lineJoin = 'round';
    ctx.fill();
    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate((angle.start + angle.end) / 2);

    ctx.font = '16px Arial'; // Add this line to set the font size and family
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000';
    ctx.fillText(text, radius - 20, 2.5); // Adjust the position of the text
    ctx.restore();
  }

  function updateWalletAddresses() {
    const inputAddresses = walletAddressesRef.current.value
      .split('\n')
      .map((address) => address.trim())
      .filter((address) => address !== '');

    if (inputAddresses.length > 0) {
      setWalletAddresses(inputAddresses);

      const initialColors = inputAddresses.map(() => getRandomColor());
      setSegmentColors(initialColors);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWheel();

    } else {
      alert('Please enter at least one wallet address.');
    }
  }
  async function spinAndWait() {
    const targetSegment = Math.floor(Math.random() * walletAddresses.length);
    const targetAngle = (2 * Math.PI) / walletAddresses.length;
    const spinnerWrapper = spinnerWrapperRef.current;
    setIsPlaying(true);
  
    // Reset the transform and transition properties
    spinnerWrapper.style.transform = '';
    spinnerWrapper.style.transition = '';
  
    // Force a reflow to ensure the transition is properly reset
    void spinnerWrapper.offsetWidth;
  
    // Generate a random number of rotations (between 5 and 10)
    const rotations = 5 + Math.floor(Math.random() * 6);
  
    // Add a small offset to prevent stopping on a segment border
    const offset = Math.random() * 0.05 - 0.025; // Change this value to control the offset range
  
    // Calculate the total angle to spin, including the rotations and the offset
    const totalAngle = rotations * 2 * Math.PI + (targetSegment + 0.5 + offset) * targetAngle;
  
    spinnerWrapper.style.transform = `rotate(${totalAngle}rad)`;
    spinnerWrapper.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)';
  
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsPlaying(false);
        resolve(walletAddresses[targetSegment]);
      }, 5000);
    });
  }
  
    async function spinMultiple() {
    const numWinners = parseInt(numWinnersRef.current.value);
    const winnersList = winnersListRef.current;
    winnersList.innerHTML = '';
  
    let remainingAddresses = [...walletAddresses];
  
    for (let i = 0; i < numWinners; i++) {
      const winner = await spinAndWait();
      const listItem = document.createElement('li');
      listItem.textContent = `${i + 1}. ${winner}`;
      winnersList.appendChild(listItem);
  
      // eslint-disable-next-line no-loop-func
    setTimeout(() => {
      remainingAddresses = remainingAddresses.filter((address) => address !== winner);

      // Update the wheel with the remaining addresses
      setWalletAddresses(remainingAddresses);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWheel();
    }, 1000);
  
      // Wait for 1 second before spinning again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
  
  return (
    <div className="App">
      <div className="spinner-container">
        <div className="arrow"></div>
        <div className="spinner-wrapper" ref={spinnerWrapperRef}>
          <canvas ref={canvasRef} width="800" height="800"></canvas>
        </div>
      </div>
      <div className="controls">
        <div className="wallet-input">
          <button type="button" onClick={updateWalletAddresses}>
            Update Wallet Addresses
          </button>
          <textarea
            ref={walletAddressesRef}
            defaultValue={walletAddresses.join('\n')}
          ></textarea>
        </div>
        <div>
          <label htmlFor="num-winners">Number of winners: </label>
          <input
            type="number"
            min="1"
            id="num-winners"
            defaultValue="1"
            ref={numWinnersRef}
          />
        </div>
        <button type="button" onClick={spinMultiple}>Spin</button>
        <ul ref={winnersListRef}></ul>
      </div>
    </div>
  );
  
  
}

export default App;
  