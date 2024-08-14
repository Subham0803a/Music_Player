import React, { useState, useEffect, useRef} from 'react';
import { FaForwardFast } from "react-icons/fa6";
import { FaFastBackward } from "react-icons/fa";

import "./index.css";

const App = () => {
  const [file, setFile] = useState(null);  // here musics stores then uplaod to flask server
  const [audioFile, setAudioFile] = useState(null);  // music files covert then using them to play media
  const [songs, setSongs] = useState([]); /// storing song file names in an empty arrray
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // song scurrrent index
  const [isPlaying, setIsPlaying] = useState(false); // controls checks if that the songs is currents on or off
  const audioRef = useRef(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmission = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    fetch('http://127.0.0.1:5000/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
         
        getFiles();
      })
      .catch((error) => console.error(error));
  };

  const getFiles = async () => {
    const res = await fetch("http://127.0.0.1:5000/get-music-list");
    let jsonData = await res.json();
    const data = jsonData.map((item) => item.filename);
    setSongs(data);
    if (data.length > 0) {
      fetchMusic(data[0]);
    }
  };

  useEffect(() => {
    getFiles();
  }, []);


  const fetchMusic = async (filename) => {
    await fetch(`http://127.0.0.1:5000/api/music/${filename}`)
      .then((response) => response.blob())
      .then((blob) => {
        const sfile = new File([blob], filename, { type: "audio/mpeg" });
        if (!sfile) return;
        setAudioFile(sfile);
      });
  };

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    fetchMusic(songs[nextIndex]);
  };

  const handlePrevious = () => {
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIndex);
    fetchMusic(songs[prevIndex]);
  };

  useEffect(() => {
    if (audioFile && audioRef.current) {
      audioRef.current.src = URL.createObjectURL(audioFile);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [audioFile]);

  return (
    <div className="background-container">
      <div className="music-player-app">

        {/* audio palyer */}
        {audioFile && (
          <audio ref={audioRef} controls />
        )}


        {/* button controls */}
        <div className="audio-controls">
          <button onClick={handlePrevious}><FaFastBackward /></button>
          <button className='playpause-btn' onClick={handlePlay}>{isPlaying ? '❚❚' : '▶'}</button>
          <button onClick={handleNext}><FaForwardFast /></button>
        </div>

        {/* file submit */}
        <form className='form' onSubmit={handleSubmission}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit">Upload File</button>
        </form>

        {/* playlist */}
        <div className="playlist">
          <h2>Songs List</h2>
          {songs.map((song, index) => (
            <div
              key={index}
              className={`song-item ${index === currentSongIndex ? 'active' : ''}`}

              onClick={() => {
                setCurrentSongIndex(index);
                fetchMusic(song);
              }}
            >
              {song}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;

