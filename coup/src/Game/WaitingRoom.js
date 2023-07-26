import React, { useEffect } from "react";
import Axios from 'axios';
import { Link } from 'react-router-dom';

import './WaitingRoom.css';

export default function WaitingRoom({ code, setCode, id, setId, opps, setOpps, socket }) {

    // when someone new joins namespace, call getPlayers again
    useEffect(() => {
        const interval = setInterval(() => {
            Axios.get(`${baseURL}getPlayers`, {
                params: {
                    code: code
                }
            })
                .then((response) => {
                    const opps = response.data.map((opp) => opp.name);
                    setOpps(opps);
                    window.sessionStorage.setItem('opps', JSON.stringify(opps));
                })
                .catch((error) => {
                    // Handle error if needed
                });
        }, 2500);

        return () => {
            clearInterval(interval);
        };
    }, [code, setOpps]);

    useEffect(() => {
        const data1 = window.sessionStorage.getItem('code');
        const data2 = window.sessionStorage.getItem('id');
        const data3 = window.sessionStorage.getItem('opps');
        // const data4 = window.sessionStorage.getItem('socketRoomPath');

        if (data1 !== null && data2 !== null && data3 !== null) {
            try {
                const code2 = JSON.parse(data1) + "";
                console.log(data3);
                const opps2 = JSON.parse(data3);
                // load all the data correlated with saved id
                setCode(code2);
                setId(data2);
                setOpps(opps2);

                if (socket)
                    socket.emit("reconnected", code2);

            } catch (error) {
                console.error('Error parsing data:', error);
            }
        }
    }, [socket, setCode, setId, setOpps]);

    useEffect(() => {
        setTimeout(() => {
            try {
                window.sessionStorage.setItem('code', JSON.stringify(code));
                window.sessionStorage.setItem('id', id);
                window.sessionStorage.setItem('opps', JSON.stringify(opps));
            } catch (error) {
                console.error('Error stringifying code:', error);
            }
        }, 100);

    }, [code, id, opps]);

    useEffect(() => {
        if (socket) {
            console.log("hi");
            socket.on('gamestarting', (arg1) => {
                console.log("1: " + arg1);
                setTimeout(() => {
                    window.location.href = '/games';
                }, 1000)
            })
        }
    }, [socket]);

    const baseURL = "http://localhost:8000/";
    const handleLeaveGame = async () => {
        try {
            await Axios.post(`${baseURL}leaveGame`, {
                code: code,
                id: id
            });
            window.sessionStorage.clear();
        } catch (error) {
            console.log(error);
        }
    };

    const handleStart = async () => {
        await socket.emit("startgame", code, id, (response) => { // pass in ign
            console.log("response: " + response);
        })
    }

    return (
        <div className="waiting-wrapper">
            <div>
                {code} + {id}
            </div>
            <div>
                {opps.map((v, i) => {
                    return (
                        <div key={i}>
                            {v}
                        </div>
                    )
                })}
            </div>
            {/* <Link to='/games'> */}
            <div onClick={(_) => handleStart()}> Start </div>
            {/* </Link> */}
            <Link to='/'>
                <div onClick={(_) => handleLeaveGame()}> Leave Game </div>
            </Link>
        </div>
    )
}