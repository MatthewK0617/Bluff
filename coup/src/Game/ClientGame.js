import React, { useEffect, useState } from "react";
import Axios from 'axios';
// import { Link } from 'react-router-dom';

import './ClientGame.css';

import Actions from "./Actions";

export default function ClientGame({ code, setCode, id, setId, opps, setOpps, socket }) {
    const baseURL = "http://localhost:8000/";
    // let [coins, setCoins] = useState(2);
    let [cards, setCards] = useState(['a', 'b']);
    let [turn, setTurn] = useState(-2);
    let [isTurn, setIsTurn] = useState(false);
    let [action, setAction] = useState(null); // card, id, giverId, coin_transaction, 

    // Simulate fetching the player count (you can replace this with your actual data fetching logic)

    // load data from before; variables that wont change 
    useEffect(() => {
        const data1 = window.sessionStorage.getItem('code');
        const data2 = parseInt(window.sessionStorage.getItem('id'));

        if (data1 && data2) {
            const code2 = JSON.parse(data1);
            if (socket) {
                socket.emit("reconnected", code2);
            }
            setCode(code2);
            setId(data2);
            // setOpps(opps2);

            function sortPlayers(res) {
                let opponents = [];
                let gameturn = -1;
                // let playerturn = -2;

                for (const v of res.data) {
                    if (v.id === -1) {
                        gameturn = v.turnOrder;
                        opponents.push(v);
                    } else if (v.id === id) {
                        let playerturn = v.turnOrder;
                        setTurn(playerturn);
                        if (gameturn === playerturn) setIsTurn(true);
                        else setIsTurn(false);
                        opponents.push(v);
                    } else {
                        opponents.unshift(v);
                    }
                }
                setOpps(opponents);
            }

            Axios.get(`${baseURL}getPlayersInGame`, {
                params: {
                    code: code2,
                }
            })
                .then((res) => {
                    if (res) {
                        sortPlayers(res);
                    }
                    // IDEA
                    // iterate through opps and find this player
                    // update coins with this player
                })
                .catch((err) => {
                    console.log(err);
                })
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

    /**
     * Handles functions
     */
    useEffect(() => {
        if (socket) {
            const handleWhoseTurn = (code, turn_) => {
                if (turn_ === turn) {
                    setIsTurn(true);
                }
                else { // will be repetitive. turn will be false before emitting end_turn
                    setIsTurn(false);
                }
            }
            // fetching data again (updated server-side)
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

            // define other functions
            socket.on('next_turn', (code, turn_) => {
                console.log('turn_: ' + turn_);
                handleWhoseTurn(code, turn_);
            });
            socket.on('give_coins', handleGiveCoins);
            // socket.on('ambassador_')

            return () => {
                socket.off('give_coins', handleGiveCoins);
                socket.off('next_turn', (code, turn) => {
                    handleWhoseTurn(code, turn);
                });
            };
        }
    }, [socket, code, id, setOpps, opps, turn]);

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

    const endTurn = () => { // master function
        console.log(action);
        if (action.card === 'Coins') {
            console.log(action);
            socket.emit("take_coins", code, action.giverId, id, action.coin_trans);
        }
        if (turn === opps.length) {
            console.log(turn);
            turn = -1;
        }
        setIsTurn(false);
        setAction(null);
        console.log(turn);
        socket.emit('end_turn', code, turn, opps.length - 1);
    }

    return (
        <div className="client-wrapper">
            <div className="players-wrapper">
                {opps.map((v, i) => {
                    return (
                        <div key={i} className="players">
                            {v.id === -1 ?
                                isTurn ?
                                    (<div className="game-div">{v.coins}</div>) // should be when card is selected
                                    :
                                    (<div className="nt-game-div">{v.coins}</div>)
                                :
                                v.id !== id ?
                                    isTurn ?
                                        (<div className="opponents">
                                            <div className="name">{v.name}</div>
                                            <div className="coins">{v.coins}</div>
                                        </div>)
                                        :
                                        (<div className="nt-opponents">
                                            <div className="name">{v.name}</div>
                                            <div className="coins">{v.coins}</div>
                                        </div>)
                                    :
                                    isTurn ?
                                        (<div className="player">
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
                                        </div>)
                                        :
                                        (<div className="player">
                                            <div className="name">{v.name}</div>
                                            <div className="coin-card-wrapper">
                                                <div className="coins">{v.coins}</div>
                                                <div className="nt-cards">
                                                    {cards.map((v, i) => {
                                                        return (
                                                            <div key={i} className="nt-card">{v}</div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>)
                            }
                        </div>
                    )
                })}
                {/* if player selected and action is complete */}
                {action && <div className="end-turn" onClick={(_) => endTurn()}>End Turn</div>}
                <div className="usable-cards">
                    <Actions code={code} id={id} action={action} setAction={setAction} isTurn={isTurn}/>
                </div>
            </div>
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