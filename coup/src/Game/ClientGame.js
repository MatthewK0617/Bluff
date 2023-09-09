import React, { useEffect, useState } from "react";
import Axios from 'axios';

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
    let [action, setAction] = useState(null);
    let [loseCard, setLoseCard] = useState(false);
    let [selectedArray, setSelectedArray] = useState([false, false, false, false, false, false]);

    /**
     * Load from local storage and update from db if necessary.
     */
    useEffect(() => {
        const data1 = window.sessionStorage.getItem('code');
        const data2 = parseInt(window.sessionStorage.getItem('id'));
        const data3 = window.sessionStorage.getItem('lastAction');
        if (data3) setLastAction(JSON.parse(data3));
        if (data1 && data2) {
            const code2 = JSON.parse(data1);
            if (socket) socket.emit("reconnected", code2);
            setCode(code2);
            setId(data2);

            /**
             * Sorts the players for better interfacing.
             * @param {*} res all relevant game data
             */
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
            };

            Axios.get(`${baseURL}getPlayersInGame`, {
                params: { code: code2 }
            })
                .then((res) => { if (res) sortPlayers(res) })
                .catch((err) => { console.log(err) })
        };
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
                        if (v.id === -1) {
                            opponents.push(v);
                        } else if (v.id === id) {
                            opponents.push(v);
                            setCards([v.c1, v.c2]);
                        } else opponents.unshift(v);
                    });
                    setOpps(opponents);
                }).catch((err) => {
                    console.log(err);
                });
            };

            /**
             * Determines if it is the client's turn.
             * @param {boolean} turn_ 
             */
            const handleWhoseTurn = (turn_) => {
                if (turn_ === turn) setIsTurn(true);
                else setIsTurn(false);
            }

            /**
             * Handles the initial attack.
             * @param {*} A attack object
             */
            const handleAttack = (A) => {
                setIsCounter(true);
                setLastAction(A);
                setCounterAction(prevAction => ({
                    ...prevAction,
                    defenderId: A.id,
                    id: A.defender,
                }));
            }

            /**
             * Handles subsequent attacks (i.e. counters). 
             * @param {*} d defender id
             * @param {*} a attacker id
             */
            const handleSubsequentAttacks = (d, a) => {
                if (id === d) {
                    setIsCounter(true);
                    setCounterAction(prevAction => ({
                        ...prevAction,
                        defenderId: d,
                    }));
                } else setIsCounter(false);
            }

            // listens for next turn
            socket.on('next_turn', (turn_) => {
                handleWhoseTurn(turn_);
                FetchUpdates();
            });

            // determine who will lose their card
            socket.on('challenge_results', (loserId) => {
                if (id === loserId) {
                    setLoseCard(true);
                }
            })

            // handling first counter
            socket.on('counters', (_action) => {
                handleAttack(_action);
            });

            // // handling subsequent counters
            socket.on('counters_', (_lastAction) => {
                setLastAction(_lastAction);
                handleSubsequentAttacks(_lastAction.defenderId, _lastAction.id);
            });

            // end counter interactions; begin true next turn
            socket.on('end_counters', () => {
                setSelectedArray([false, false, false, false, false, false]);
                setCounterAction(null);
                setIsCounter(false);
                setLoseCard(false);
                FetchUpdates();
            })

            return () => {
                socket.off('next_turn', (turn_) => {
                    handleWhoseTurn(turn_);
                });
                socket.off('counters', (d) => {
                    handleAttack(d);
                });
                socket.off('counters_', (lastA) => {
                    console.log(lastA);
                    setLastAction(lastA);
                    handleSubsequentAttacks(lastA.defenderId, lastA.id);
                });
                socket.off('end_counters', () => {
                    setSelectedArray([false, false, false, false, false, false]);
                    setCounterAction(null);
                    setIsCounter(false);
                    setLoseCard(false);
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

    const sendCounters = (v) => {
        if (v === "bs") {
            socket.emit("counter", code, lastAction, opps.length - 1, v);
        }
        else if (v === "allow") {
            socket.emit("counter", code, action, opps.length - 1, v);
        }
    }

    const updateAction = (v) => {
        console.log(v);
        setAction(prevAction => ({
            ...prevAction,
            defenderId: v.id
        }));
    };

    /**
     * Notifies server to lock in client's move. 
     */
    const endTurn = () => {
        setLastAction(action);
        setSelectedArray([false, false, false, false, false, false]);
        if (!isCounter) socket.emit('end_turn', code, action, opps.length - 1);
        else socket.emit('end_turn', code, counterAction, opps.length - 1);
        setIsCounter(false);
        setCounterAction(null);
        setAction(null);
    }

    /**
     * Notifies server to delete the selected card.
     * @param {String} card name of card
     */
    const deleteCard = (card) => {
        socket.emit("delete_card", code, id, card, (response) => {
            console.log(response);
            socket.emit("continue", code, opps.length - 1);
        });
    }

    return (
        <div className="client-wrapper">
            <div className="players-wrapper">
                {isCounter && counterAction && counterAction.defenderId !== id &&
                    <div className="counter-actions">
                        <div onClick={(_) => sendCounters("allow")}>Allow</div>
                        <div onClick={(_) => sendCounters("bs")}>BS</div>
                        <div>{isCounter ? 1 : 0} {counterAction.defenderId}</div>

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
                                                        v &&
                                                        <div key={i} className={`${loseCard ? 'card-lose' : 'card'}`}
                                                            onClick={loseCard ? (_) => deleteCard(v) : undefined}
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
                {(isCounter && counterAction && counterAction.card)
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
        </div >
    )
}