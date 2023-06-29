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

function App() {

  const [data, setData] = React.useState(null);
  const [time, setTime] = React.useState('fetching');
  const [socket, setSocket] = React.useState(null);
  const [code, setCode] = React.useState(""); 


  React.useEffect(() => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  useEffect(() => {
    const socket1 = io.connect("http://localhost:8000");
    setSocket(socket1);

    socket1.on("FromAPI", data => {
      setTime(data);
    });
    socket1.on("connect", data => {
      setTime(data);
      console.log('socket connected');
      console.log(socket1.id)
    })
    socket1.on("reconnect_failed", () => {
      console.log(socket1.disconnected)
    });
    return () =>
      socket1.disconnect();
  }, [])

  React.useEffect(() => {
    console.log(code);
  }, [code])


  return (
    <Router>
      <Routes>
        {/* <p>
          <time dateTime={time}>{time}</time>
        </p> */}
        <Route path="/" element={<LoadingPage />} />
        <Route path="/settings" element={<Settings data={data} time={time} socket={socket} code={code} setCode={setCode} />} />
        <Route path="/game" element={<ClientGame code={code} />} />
        <Route path="/waiting" element={<WaitingRoom code={code} />} />
        <Route path="/joingame" element={<JoinGame socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;
