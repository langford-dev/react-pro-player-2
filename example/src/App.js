import React from "react";
import './App.css';
import ReactProPlayer from "react-pro-player"

function App() {
  return (
    <div className="App">
      <ReactProPlayer
        poster="https://wallpaperaccess.com/full/2680068.jpg"
        src="https://live-par-1-abr-cdn.livepush.io/live_abr_cdn/emaIqCGoZw-6/index.m3u8"
      />
    </div>
  );
}

export default App;
