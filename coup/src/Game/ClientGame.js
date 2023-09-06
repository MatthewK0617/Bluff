import React, { useEffect, useState } from "react";
import Axios from 'axios';
// import { Link } from 'react-router-dom';

import './ClientGame.css';

import Actions from "./Actions";

export default function ClientGame({ code, setCode, id, setId, opps, setOpps, socket }) {
    const baseURL = "http://localhost:8000/";
    let [cards, setCards] = useState(['_', '_']);
    let [turn, setTurn] = useState(-2);
    let [isTurn, setIsTurn] = useState(false);
    let [isCounter, setIsCounter] = useState(false);
    let [counterAction, setCounterAction] = useState(null);
    let [lastAction, setLastAction] = useState(null);
    let [action, setAction] = useState(null); // card, id, target, coin_transaction, 
    let [loseCard, setLoseCard] = useState(false);
    let [selectedArray, setSelectedArray] = useState([false, false, false, false, false, false]);

    useEffect(() => {
        const data1 = window.sessionStorage.getItem('code');
        const data2 = parseInt(window.sessionStorage.getItem('id'));
        const data3 = window.sessionStorage.getItem('lastAction');

        if (data3) setLastAction(JSON.parse(data3));

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
                        setCards([v.c1, v.c2]);
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
             * Fetches new game data. 
             */
            const FetchUpdates = () => {
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

            /**
             * Handles attack.
             */
            const handleAttack = (A) => {
                setIsCounter(true);
                console.log(counterAction, A);
                setLastAction(A);
                setCounterAction(prevAction => ({
                    ...prevAction,
                    defenderId: A.id,
                    id: A.defender,
                }));
            }
            const handleSubsequentAttacks = (d, a) => {
                if (id === d || id === a) {
                    setIsCounter(true);
                    console.log(counterAction);
                    setCounterAction(prevAction => ({
                        ...prevAction,
                        defenderId: d,
                    }));
                }
                else {
                    setIsCounter(false);
                }
            }
            // listens for next turn
            socket.on('next_turn', (turn_) => {
                handleWhoseTurn(turn_);
            });

            // actions
            socket.on('counters', (A) => {
                handleAttack(A);
            });
            socket.on('counters_', (lastA) => {
                console.log(lastA);
                setLastAction(lastA);
                handleSubsequentAttacks(lastA.defenderId, lastA.id);
            });

            // end counter
            socket.on('end_counters', () => {
                setSelectedArray([false, false, false, false, false, false]);
                setCounterAction(null);
                setIsCounter(false);
                FetchUpdates();
            })

            return () => {
                socket.off('next_turn', (turn_) => {
                    handleWhoseTurn(turn_);
                });
                socket.off('counters', (d) => {
                    handleAttack(d);
                });
                socket.off('counters_', (defender, attacker) => {
                    handleSubsequentAttacks(defender, attacker);
                });
                socket.off('end_counters', () => {
                    setSelectedArray([false, false, false, false, false, false]);
                    setCounterAction(null);
                    setIsCounter(false);
                    FetchUpdates();
                })
            };
        }
    }, [socket, code, id, setOpps, opps, turn, counterAction]);

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
        } catch (err) {
            console.log(err);
        }
    };

    const handleCounters = (v) => {
        if (v === "bs") {
            setCounterAction(lastAction);
            socket.emit("counter", code, lastAction, opps.length - 1, v);
        }
        else socket.emit("counter", code, action, opps.length - 1, v);
    }

    const updateAction = (v) => {
        console.log(v);
        setAction(prevAction => ({
            ...prevAction,
            defenderId: v.id
        }));
    };

    useEffect(() => {
        console.log("updated");
        console.log(lastAction);
    }, [lastAction])

    const endTurn = () => {
        setLastAction(action);
        setSelectedArray([false, false, false, false, false, false]);
        if (!isCounter) socket.emit('end_turn', code, action, opps.length - 1);
        else socket.emit('end_turn', code, counterAction, opps.length - 1);
        setCounterAction(null);
        setAction(null);
    }

    const deleteCard = () => {
        
    }

    return (
        <div className="client-wrapper">
            <div className="players-wrapper">
                {isCounter && counterAction && counterAction.defenderId !== id &&
                    <div className="counter-actions">
                        <div onClick={(_) => handleCounters("allow")}>Allow</div>
                        <div onClick={(_) => handleCounters("bs")}>BS</div>
                    </div>}

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
                                    (action && !isCounter) ?
                                        action.defenderId ?
                                            (<div className="nt-opponents">
                                                <div className="name">{v.name}</div>
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
                                    (<div className="player">
                                        <div className="name">{v.name}</div>
                                        <div className="coin-card-wrapper">
                                            <div className="coins">{v.coins}</div>
                                            <div className="cards">
                                                {cards.map((v, i) => {
                                                    return (
                                                        <div key={i}
                                                            className="card" onClick={(_) => deleteCard(v)}
                                                        >{v}</div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>)
                            }
                        </div>
                    )
                })}
                {/* if counter player selected and counter is complete player selected and action is complete */}
                {(counterAction && counterAction.card)
                    && <div className="end-turn" onClick={(_) => endTurn()}>End Counter</div>}

                {(action && action.defenderId)
                    && <div className="end-turn" onClick={(_) => endTurn()}>End Turn</div>}
                <div className="usable-cards">
                    <Actions code={code} id={id} action={action} setAction={setAction}
                        counterAction={counterAction} setCounterAction={setCounterAction}
                        isTurn={isTurn} isCounter={isCounter} selectedArray={selectedArray}
                        setSelectedArray={setSelectedArray} />
                </div>
            </div>
            <div className="leave-button" onClick={(_) => handleLeaveInGame()}> Leave Game </div>
        </div>
    )
}