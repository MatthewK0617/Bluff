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
  const [opps, setOpps] = React.useState([]);
  const [socket, setSocket] = React.useState(null);
  const [code, setCode] = React.useState("");
  const [id, setId] = React.useState(0);

  function handleCode (newCode) {
    setCode(newCode);
  }
  function handleId (newId) {
    setId(newId);
    console.log(newId);
  }



  React.useEffect(() => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
  }, []);

  useEffect(() => {
    const socket1 = io.connect("http://localhost:8000");
    setSocket(socket1);

    socket1.on("connect", data => {
      console.log(socket1.id, "connected")
    })
    socket1.on("reconnect_failed", () => {
      console.log(socket1.disconnected)
    });
    return () =>
      socket1.disconnect();
  }, [])


  return (
    <Router>
      <Routes>
        {/* <p>
          <time dateTime={time}>{time}</time>
        </p> */}
        <Route path="/" element={<LoadingPage />} />
        <Route path="/settings" element={<Settings socket={socket} code={code} setCode={handleCode} id={id} setId={handleId} setOpps={setOpps} />} />
        <Route path="/game" element={<ClientGame code={code} />} />
        <Route path="/waiting" element={<WaitingRoom code={code} setCode={setCode} id={id} setId={setId} opps={opps} setOpps={setOpps} socket={socket} />} />
        <Route path="/joingame" element={<JoinGame codeFinal={code} setCodeFinal={setCode} id={id} setId={setId} opps={opps} setOpps={setOpps} socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;
