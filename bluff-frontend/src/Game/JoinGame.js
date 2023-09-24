import React, { useEffect, useState, useRef, useCallback } from "react";
import Axios from 'axios';
import { Link } from 'react-router-dom';

import './JoinGame.css';

export default function JoinGame({ codeFinal, setCodeFinal, id, setId, opps, setOpps, socket }) {
    const formRef = useRef(null);
    const baseURL = process.env.REACT_APP_URL || "http://localhost:8000/";
    let list = [];

    const [ign, setIgn] = useState("");
    const [code, setCode] = useState("");
    const [added, setAdded] = useState(false);

    const onChangeCode = (event) => {
        const code = event.target.value;
        setCode(code);
    };

    const onChangeIgn = (event) => {
        const ign = event.target.value;
        setIgn(ign);
    };

    const onSubmit = async (event) => { // when browser closed, delete player
        event.preventDefault();
        await getPlayers();
        console.log("onSubmit");
        await joinGame();
    };

    useEffect(() => {
        if (added) {
            setTimeout(() => {
                window.location.href = '/waiting';
            }, 1000);
        }
    }, [added]);

    const getPlayers = async () => {
        try {
            const res = await Axios.get(`${baseURL}getPlayers`, {
                params: {
                    code: code,
                }
            }, {
                timeout: 5000,
            });
            const players = res.data.map((player) => ({
                name: player.name,
                id: player.id,
            }));
            list = players;
        } catch (error) {
            console.log(error);
        }
    };

    const addPlayer = async () => {
        try {
            const res = await Axios.post(`${baseURL}addPlayers`, {
                username: ign,
                socket_id: socket.id,
                code: code,
            },
                {
                    timeout: 1000,
                });
            return res.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    const getGames = useCallback(async () => {
        try {
            const res = await Axios.get(`${baseURL}getGames`);
            const gameCodes = res.data.map((game) => game.code);
            return gameCodes;
        } catch (error) {
            console.log(error);
        }
    }, [baseURL]);

    useEffect(() => {
        getGames();
    }, [getGames]);

    const joinGame = async () => {
        try {
            const getGamesRes = await getGames();
            const isValidCode = getGamesRes.includes(code);
            console.log(list);
            const isValidIgn = list.every(player => player.name !== ign);

            if (isValidCode) {
                if (isValidIgn) {
                    setAdded(true);
                    setCodeFinal(code);
                    await addPlayer();

                    const getPlayerDataRes = await Axios.get(`${baseURL}getInitialPlayerData`, {
                        params: {
                            socket_id: socket.id
                        }
                    });
                    let id2 = getPlayerDataRes.data.id;
                    setId(id2);
                    socket.emit("joinGameWaiting", code, id2, (response) => {
                        // const names = response.players.map(player => player.name);
                        setOpps(response.players);
                    });
                } else {
                    console.log("Invalid ign");
                    // make it tell user 
                }
            } else {
                setCode("");
                console.log("Invalid code");
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (codeFinal && id) {
            try {
                window.sessionStorage.setItem('code', JSON.stringify(codeFinal));
                window.sessionStorage.setItem('id', id);
                window.sessionStorage.setItem('opps', JSON.stringify(opps));
            } catch (error) {
                console.error('Error stringifying code:', error);
            }
        }
    }, [codeFinal, id, opps]);

    return (
        <div className="join-wrapper">
            <div>
                <form
                    ref={formRef}
                    onSubmit={onSubmit}
                    className="form"
                >
                    <input className="input" value={ign} onChange={onChangeIgn} placeholder="username" />
                    <input className="input" value={code} onChange={onChangeCode} placeholder="code" />
                    <button type="submit" hidden>Submit</button>
                </form>
            </div>
            <Link className="join-game-links" to='/'> Back </Link>
        </div>
    );
}