import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect } from 'react';
import io from "socket.io-client";

/* file imports */
import Settings from './Settings';
import LoadingPage from './LoadingPage';
import ClientGame from './Game/ClientGame';
import WaitingRoom from './Game/WaitingRoom';
import JoinGame from './Game/JoinGame';

const socket = io.connect("http://localhost:8000");

function App() {
  const [data, setData] = React.useState(null);
  const [time, setTime] = React.useState('fetching');


  React.useEffect(() => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  useEffect(() => {
    // const socket = io('http://127.0.0.1:8000'); 
    // socket = io.connect("http://localhost:8000");
    socket.on("FromAPI", data => {
      setTime(data);
    });
    socket.on("connect", data => {
      setTime(data);
      console.log('socket connected')
    })
    socket.on("reconnect_failed", () => {
      console.log(socket.disconnected)
    });
    return () =>
      socket.disconnect();
  }, [])

  console.log(socket)


  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/settings" element={<Settings data={data} time={time} />} />
        <Route path="/game" element={<ClientGame />} /> {/* replace with a specific id */}
        <Route path="/waiting" element={<WaitingRoom />} /> {/* replace with a specific id */}
        <Route path="/joingame" element={<JoinGame socket={socket} />} />


      </Routes>
    </Router>
  );
}

export default App;
