import React, { useEffect, useState } from "react";
import Axios from 'axios';
// import { Link } from 'react-router-dom';

import './ClientGame.css';

export default function ClientGame({ code, setCode, id, setId, opps, setOpps, socket }) {
    const baseURL = "http://localhost:8000/";
    // let [coins, setCoins] = useState(2);
    let [cards, setCards] = useState(['a', 'b']);

    // Simulate fetching the player count (you can replace this with your actual data fetching logic)

    // load data from before
    // variables that wont change 
    useEffect(() => {
        const data1 = window.sessionStorage.getItem('code');
        const data2 = parseInt(window.sessionStorage.getItem('id'));

        if (data1 !== null && data2 !== null) {
            try {
                const code2 = JSON.parse(data1) + "";
                if (socket) {
                    socket.emit("reconnected", code2);
                }
                setCode(code2);
                setId(data2);
                // setOpps(opps2);

                Axios.get(`${baseURL}getPlayersInGame`, {
                    params: {
                        code: code2,
                    }
                })
                    .then((res) => {
                        let opponents = [];
                        res.data.forEach((v, i) => {
                            if (v.id === -1 || v.id === id) opponents.push(v);
                            else opponents.unshift(v);
                        });
                        setOpps(opponents);

                        // IDEA
                        // iterate through opps and find this player
                        // update coins with this player
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            } catch (error) {
                console.error('Error parsing data:', error);
            }
        }
    }, [setCode, setId, setOpps, socket, code, id]);

    useEffect(() => { // have to store more information now
        setTimeout(() => {
            try {
                window.sessionStorage.setItem('code', JSON.stringify(code));
                window.sessionStorage.setItem('id', id);
                // window.sessionStorage.setItem('opps', JSON.stringify(opps));
            } catch (error) {
                console.error('Error stringifying code:', error);
            }
        }, 100);

    }, [code, id]);

    useEffect(() => {
        if (socket) {
            const handleGiveCoins = (receiver_coins, receiverId, giver_coins, giverId) => {
                Axios.get(`${baseURL}getPlayersInGame`, {
                    params: {
                        code: code,
                    }
                })
                    .then((res) => {
                        console.log("setting opps");
                        let opponents = [];
                        res.data.forEach((v, i) => {
                            if (v.id === -1 || v.id === id) opponents.push(v);
                            else opponents.unshift(v);
                        });
                        setOpps(opponents);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            };

            socket.on('give_coins', handleGiveCoins);

            return () => {
                socket.off('give_coins', handleGiveCoins);
            };
        }
    }, [socket, code, id, setOpps]);

    const handleLeaveInGame = async () => {
        try {
            await Axios.post(`${baseURL}leaveInGame`, {
                code: code,
                id: id
            });
            window.sessionStorage.clear();
            setTimeout(() => {
                window.location.href = '/';
            }, 1000)
        } catch (error) {
            console.log(error);
        }
    };

    const takeCoins = (giverId) => { // taking from
        let trans_amount = 2;
        socket.emit("take_coins", code, giverId, id, trans_amount);
    }

    return (
        <div className="client-wrapper">
            {/* <div className="inf">
                {id} + {code}
            </div> */}

            <div className="players-wrapper">
                {/* bug: when first player leaves sometimes deletes the entire table
                * below is opps map. should not include player or game.
                * filter those out and create individual divs for them
                */}
                {opps.map((v, i) => {
                    return (
                        <div key={i} className="players">
                            {v.id === -1 ?
                                <div className="game-div" onClick={(_) => takeCoins(v.id)}>{v.coins}</div>
                                :
                                v.id !== id ?
                                    <div className="opponents"
                                        onClick={(_) => takeCoins(v.id)}>
                                        <div className="name">{v.name}</div>
                                        <div className="coins">{v.coins}</div>
                                    </div>
                                    :
                                    <div className="player">
                                        <div className="name">{v.name}</div>
                                        <div className="coin-card-wrapper">
                                            <div className="coins">{v.coins}</div>
                                            <div className="cards">
                                                {cards.map((v, i) => {
                                                    return (
                                                        <div key={i} className="card">{v}</div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                            }
                        </div>
                    )
                })}
            </div>
            {/* <Link reloadDocument to='/waiting'> back </Link> */}
            <div className="leave-button" onClick={(_) => handleLeaveInGame()}> Leave Game </div>
        </div>
    )
}

/**
 * features left to implement:
 * card distribution
 * card tasks (add to same useEffect listener)
 * end game
 * limiting per turn
 * 
 * when leaving game into settings, either add back into current players
 * or remove the option to go to settings after leaving game
 */