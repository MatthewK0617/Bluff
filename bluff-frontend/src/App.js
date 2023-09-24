import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import io from "socket.io-client";

/* file imports */
import Settings from './Settings';
import LoadingPage from './LoadingPage';
import ClientGame from './Game/ClientGame';
import WaitingRoom from './Game/WaitingRoom';
import JoinGame from './Game/JoinGame';

function App() {
  const [opps, setOpps] = useState([]);
  const [socket, setSocket] = React.useState(null);
  const [code, setCode] = React.useState("");
  const [id, setId] = React.useState(0);
  const [ign, setIgn] = React.useState("");

  // const [loading, setLoading] = useState(true);

  function handleCode(newCode) {
    setCode(newCode);
  }
  function handleId(newId) {
    setId(newId);
    console.log(newId);
  }



  useEffect(() => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      // .finally(() => {
      //   setLoading(false); // Once data is fetched, setLoading to false
      // });
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

  // if (loading) {
  //   // Render a loading indicator or splash screen while loading
  //   return <div className='app-wrapper' />
  // }

  return (
    // <div className='app-wrapper'>
      <Router>
        <Routes>
          {/* <p>
          <time dateTime={time}>{time}</time>
        </p> */}
          <Route path="/" element={<LoadingPage />} />
          <Route path="/settings" element={<Settings socket={socket} code={code} setCode={handleCode} id={id} setId={handleId} setOpps={setOpps} />} />
          <Route path="/games" element={<ClientGame code={code} setCode={setCode} id={id} setId={setId} opps={opps} setOpps={setOpps} socket={socket} />} />
          <Route path="/waiting" element={<WaitingRoom code={code} setCode={setCode} id={id} setId={setId} opps={opps} setOpps={setOpps} socket={socket} />} />
          <Route path="/joingame" element={<JoinGame codeFinal={code} setCodeFinal={setCode} id={id} setId={setId} opps={opps} setOpps={setOpps} socket={socket} />} />
        </Routes>
      </Router>
    // </div>

  );
}

export default App;