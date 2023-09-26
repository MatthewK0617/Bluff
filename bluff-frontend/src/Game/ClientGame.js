import React, { useCallback, useEffect, useState } from "react";
import Axios from 'axios';

import './ClientGame.css';
import Actions from "./Actions";
import EndPage from "./EndPage";

function ClientGame({ code, setCode, id, setId, opps, setOpps, socket }) {
    const baseURL = process.env.REACT_APP_URL || "http://localhost:8000/";
    let [cards, setCards] = useState([null, null]);
    let [turn, setTurn] = useState(-2);
    let [isTurn, setIsTurn] = useState(false);
    let [isCounter, setIsCounter] = useState(false); // store
    let [counterAction, setCounterAction] = useState(null); // store
    let [lastAction, setLastAction] = useState(null); // store
    let [action, setAction] = useState(null);
    let [loseCard, setLoseCard] = useState(false); // store
    let [selectedArray, setSelectedArray] = useState([false, false, false, false, false, false]);
    let [fetch, setFetch] = useState(false);
    let [winner, setWinner] = useState("");
    let [originalAction, setOriginalAction] = React.useState(null);

    /**
     * Load from local storage and update from db if necessary.
     */
    useEffect(() => {
        const codeData = window.sessionStorage.getItem('code');
        const idData = parseInt(window.sessionStorage.getItem('id'));

        const isCounterData = window.sessionStorage.getItem('isCounter');
        const counterActionData = window.sessionStorage.getItem('counterAction');
        const lastActionData = window.sessionStorage.getItem('lastAction');
        const loseCardData = window.sessionStorage.getItem('loseCard');
        const winnerData = window.sessionStorage.getItem('winner');


        if (isCounterData) setIsCounter(JSON.parse(isCounterData));
        if (counterActionData) setCounterAction(JSON.parse(counterActionData));
        if (lastActionData) setLastAction(JSON.parse(lastActionData));
        if (loseCardData) setLoseCard(JSON.parse(loseCardData));
        if (winnerData) setWinner(JSON.parse(winnerData));

        if (codeData && idData) {
            const code2 = JSON.parse(codeData);
            if (socket) socket.emit("reconnected", code2);
            setCode(code2);
            setId(idData);

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
                    } else if (v.id === id) { // change this
                        if (v.turnOrder !== -2) {
                            let playerturn = v.turnOrder;
                            setTurn(playerturn);
                            setCards([v.c1, v.c2]);
                            if (gameturn === playerturn) setIsTurn(true);
                            else setIsTurn(false);
                            opponents.push(v);
                        }
                    } else {
                        if (v.turnOrder !== -2) opponents.unshift(v);
                    }
                } setOpps(opponents);
            };

            Axios.get(`${baseURL}getPlayersInGame`, {
                params: { code: code2 }
            })
                .then((res) => { if (res) sortPlayers(res) })
                .catch((err) => { console.log(err) })
        };
    }, [setCode, setId, setOpps, socket, code, id, baseURL]);

    useEffect(() => {
        setTimeout(() => {
            try {
                window.sessionStorage.setItem('code', JSON.stringify(code));
                window.sessionStorage.setItem('id', id);
                window.sessionStorage.setItem('isCounter', JSON.stringify(isCounter));
                window.sessionStorage.setItem('counterAction', JSON.stringify(counterAction));
                window.sessionStorage.setItem('lastAction', JSON.stringify(lastAction));
                window.sessionStorage.setItem('loseCard', JSON.stringify(loseCard));
                window.sessionStorage.setItem('winner', JSON.stringify(winner));

            } catch (error) {
                console.error('Error stringifying code:', error);
            }
        }, 100);
    }, [code, id, isCounter, counterAction, lastAction, loseCard, winner]);

    /**
     * Handles functions
     */
    useEffect(() => {
        /**
         * Fetches new game data. 
         */

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
            // if (A.defenderId !== id && A.id !== id) setIsCounter(false);
            setCounterAction(prevAction => ({
                ...prevAction,
                defenderId: A.id,
                id: id,
            }));
        }

        if (socket) {
            // listens for next turn
            socket.on('next_turn', (turn_) => {
                handleWhoseTurn(turn_);
                setFetch(!fetch);
            });

            socket.on('con_bluff_called', (defenderId) => {
                socket.emit("eliminated", code, defenderId, turn, opps.length - 2);
            })

            socket.on('set-countering-players', (p1, p2) => {
                if (id !== p1 || id !== p2) setIsCounter(false);
            })

            // determine who will lose their card
            socket.on('challenge_results', (loserId) => {
                if (id === loserId) {
                    setLoseCard(true);
                }
            })

            // handling counters
            socket.on('counters', (_action) => {
                console.log("handle counter");
                setOriginalAction(_action);
                handleAttack(_action);
            });

            // end counter interactions; begin true next turn
            socket.on('end_counters', () => {
                setSelectedArray([false, false, false, false, false, false]);
                setCounterAction(null);
                setIsCounter(false);
                setLoseCard(false);
                setFetch(!fetch);
            })

            return () => {
                // listens for next turn
                socket.off('next_turn', (turn_) => {
                    handleWhoseTurn(turn_);
                    setFetch(!fetch);
                });

                socket.off('con_bluff_called', (defenderId) => {
                    socket.emit("eliminated", code, defenderId, turn);
                })

                // determine who will lose their card
                socket.off('challenge_results', (loserId) => {
                    if (id === loserId) {
                        setLoseCard(true);
                    }
                })

                // handling first counter --> handling counters
                socket.off('counters', (_action) => {
                    handleAttack(_action);
                });

                // // handling subsequent counters
                // socket.off('counters_', (_lastAction) => {
                //     setLastAction(_lastAction);
                //     handleSubsequentAttacks(_lastAction.defenderId, _lastAction.id);
                // });

                // end counter interactions; begin true next turn
                socket.off('end_counters', () => {
                    setSelectedArray([false, false, false, false, false, false]);
                    setCounterAction(null);
                    setIsCounter(false);
                    setLoseCard(false);
                    setFetch(!fetch);

                })
            };
        }
    });
    // }, [handleEndCounters, socket]);

    const FetchData = useCallback(() => {
        if (code) {
            Axios.get(`${baseURL}getPlayersInGame`, {
                params: {
                    code: code,
                }
            }).then((res) => {
                let opponents = [];
                let gameturn = -1;
                console.log('why');
                res.data.forEach((v) => {
                    if (v.id === -1) {
                        gameturn = v.turnOrder;
                        opponents.push(v);
                    } else if (v.id === id) {
                        if (v.turnOrder !== -2) {
                            opponents.push(v);
                            setCards([v.c1, v.c2]);
                            setTurn((prevTurn) => {
                                // Calculate the new 'turn' based on 'prevTurn' and 'v.turnOrder'
                                return v.turnOrder !== prevTurn ? v.turnOrder : prevTurn;
                            });
                        }
                        if (gameturn === v.turnOrder) setIsTurn(true);
                        else setIsTurn(false);
                    } else if (v.turnOrder !== -2) opponents.unshift(v);
                });
                setOpps(opponents);
            }).catch((err) => {
                console.log(err);
            });
        }
    }, [code, id, setOpps, baseURL]);

    useEffect(() => {
        FetchData();
        console.log("fetched");
    }, [FetchData, fetch])

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

    const updateAction = (v) => {
        // console.log(v);
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
    const deleteCard = async (card) => {
        // Create a promise to handle the asynchronous operation
        const eliminationPromise = new Promise((resolve, reject) => {
            if (!cards[0] || !cards[1]) {
                socket.emit("eliminated", code, id, turn);
                resolve(true);
            } else {
                resolve();
            }
        });
        let eliminated = await eliminationPromise;
        if (!eliminated) {
            socket.emit("delete_card", code, id, card, (response) => {
                console.log(response);
                socket.emit("continue", code, opps.length - 1);
            });
        }
    }

    useEffect(() => {
        if (socket) {
            socket.on("game_over", (winner_) => {
                setWinner(winner_);
                console.log(winner_);
            });
        }
    }, [socket, id])

    useEffect(() => {
        if (winner) {
            console.log(winner);
            window.sessionStorage.setItem('winner', JSON.stringify(winner));
        }
    }, [winner])

    return (
        // (!winner &&
        <div className="client-wrapper">
            {!winner &&
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

                    {/* {lastAction && <div className="turn-display">{lastAction.id} used {lastAction.card} on {lastAction.defenderId}</div>} */}

                    {<div className="usable-cards">
                        <Actions code={code} id={id} action={action} setAction={setAction}
                            counterAction={counterAction} setCounterAction={setCounterAction}
                            isTurn={isTurn} isCounter={isCounter} selectedArray={selectedArray}
                            setSelectedArray={setSelectedArray} lastAction={lastAction}
                            setLastAction={setLastAction} opps={opps} socket={socket}
                            originalAction={originalAction} />
                    </div>}
                    {/* Actions should be more dynamic. pass in array of counters
                    based on what is pulled from db
                    
                    if isCounter check lastAction === counters (pulled from db)
                    if notCounter send the card options (nothing to counter)
                    decide if i want to filter out and not even show card options 
                        if not turn
                    /*/}
                </div>
            }
            {winner && <EndPage winner={winner} code={code} id={id} />}
            <div className="leave-button" onClick={(_) => handleLeaveInGame()}> Leave Game </div>
        </div >
    )
}

export default ClientGame;


// check select player and why it's not updating defenderId in counterAction
// if it's not set for it, make it do it