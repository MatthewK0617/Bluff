import React, { useEffect, useState } from "react";
import Axios from 'axios';
// import { Link } from 'react-router-dom';

import './ClientGame.css';

import Actions from "./Actions";

export default function ClientGame({ code, setCode, id, setId, opps, setOpps, socket }) {
    const baseURL = "http://localhost:8000/";
    let [cards, setCards] = useState(['a', 'b']);
    let [turn, setTurn] = useState(-2);
    let [isTurn, setIsTurn] = useState(false);
    let [isCounter, setIsCounter] = useState(false);
    let [action, setAction] = useState(null); // card, id, target, coin_transaction, 
    let [selectedArray, setSelectedArray] = useState([false, false, false, false, false, false]);

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

            function sortPlayers(res) {
                let opponents = [];
                let gameturn = -1;
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
                    } else opponents.unshift(v);
                } setOpps(opponents);
            }

            Axios.get(`${baseURL}getPlayersInGame`, {
                params: {
                    code: code2,
                }
            }).then((res) => {
                if (res) sortPlayers(res);
            }).catch((err) => {
                console.log(err);
            })
        }
    }, [setCode, setId, setOpps, socket, code, id]);

    useEffect(() => {
        setTimeout(() => {
            try {
                window.sessionStorage.setItem('code', JSON.stringify(code));
                window.sessionStorage.setItem('id', id);
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
            /**
             * Determines if it is the client's turn.
             * @param {boolean} turn_ 
             */
            const handleWhoseTurn = (turn_) => {
                if (turn_ === turn) {
                    setIsTurn(true);
                } else {
                    setIsTurn(false);
                }
            }

            /**
             * Handles losing coins to another client. 
             * rename this and make it the reload for every action.
             * i.e. ambassador action will call this
             */
            const handleAction = () => {
                Axios.get(`${baseURL}getPlayersInGame`, {
                    params: {
                        code: code,
                    }
                }).then((res) => {
                    let opponents = [];
                    res.data.forEach((v) => {
                        if (v.id === -1 || v.id === id) opponents.push(v);
                        else opponents.unshift(v);
                    });
                    setOpps(opponents);
                }).catch((err) => {
                    console.log(err);
                });
            };

            // finds next turn
            socket.on('next_turn', (code, turn_) => {
                handleWhoseTurn(turn_);
            });
            socket.on('give_coins', handleAction);

            return () => {
                socket.off('give_coins', handleAction);
                socket.off('next_turn', (code, turn) => {
                    handleWhoseTurn(turn);
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

    const endTurn = () => {
        console.log(action);
        if (action.card === "bs") { }
        if (action.card === "def") {
            console.log(action);
            socket.emit("take_coins", code, action.defenderId, id, action.coin_trans);
        }
        else if (action.card === "duk") {
            socket.emit("take_coins", code, action.defenderId, id, action.coin_trans);
        }
        else if (action.card === "cap") { // && rule === 1 (create rule parameter for object)
            socket.emit("take_coins", code, action.defenderId, id, action.coin_trans);
        }

        if (turn === opps.length) {
            console.log(turn);
            turn = -1;
        }
        // setIsTurn(false);
        setAction(null);
        setSelectedArray([false, false, false, false, false, false]);
        // console.log(turn);

        // wait for the emit function callback to finish (have to implement that)
        socket.emit('end_turn', code, action.defenderId, id, turn, opps.length - 1);
    }

    const updateAction = (v) => {
        console.log(v);
        setAction(prevAction => ({
            ...prevAction,
            defenderId: v.id
        }));
    };

    return (
        <div className="client-wrapper">
            <div className="players-wrapper">
                {!isCounter &&
                    <div className="counter-actions">
                        <div>Allow</div>
                        <div>BS</div>
                    </div>}
                {/* {!isCounter && <div className="counter-actions">false</div>} */}

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
                                    action ?
                                        action.defenderId ?
                                            (<div className="nt-opponents">
                                                <div className="name">{v.name} {action.defenderId}</div>
                                                <div className="coins">{v.coins}</div>
                                            </div>)
                                            :
                                            (<div className="opponents" onClick={(_) => updateAction(v)}>
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
                {action && action.defenderId && <div className="end-turn" onClick={(_) => endTurn()}>End Turn</div>}
                <div className="usable-cards">
                    <Actions code={code} id={id} action={action} setAction={setAction} isTurn={isTurn} selectedArray={selectedArray} setSelectedArray={setSelectedArray} />
                </div>
            </div>
            <div className="leave-button" onClick={(_) => handleLeaveInGame()}> Leave Game </div>
        </div>
    )
}