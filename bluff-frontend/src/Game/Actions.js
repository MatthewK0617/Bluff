import React, { useEffect, useState } from "react";
import Axios from "axios";
import { GiPoisonBottle, GiHealthPotion, GiDualityMask, GiShinyPurse, GiDeathSkull, GiBank, GiCardExchange } from 'react-icons/gi';


import './Actions.css';

export default function Actions({ code, id, action, setAction,
    counterAction, setCounterAction, isTurn, isCounter,
    selectedArray, setSelectedArray, lastAction, setLastAction,
    opps, socket, originalAction, coins }) {
    const baseURL = process.env.REACT_APP_URL || "http://localhost:8000/";
    const [cards, setCards] = useState([]);
    let [actionsRules, setActionsRules] = useState([]);

    const counters = {
        "def": ["pur"],
        "poi": ["ant"],
        "mas": ["mas", "cha"],
    };

    useEffect(() => {
        // get from session storage
        const data1 = window.sessionStorage.getItem('cards');
        const data2 = window.sessionStorage.getItem('rules');
        if (data1 && data2) {
            const retrievedCards = JSON.parse(data1);
            setCards(retrievedCards);

            const retrievedRules = JSON.parse(data2);
            setActionsRules(retrievedRules);
        }
        else {
            if (code) {
                let tempCards = [];
                Axios.get(`${baseURL}getCards`, {
                    params: {
                        code: code,
                    }
                })
                    .then((res) => {
                        res.data.forEach((v, i) => {
                            if (v.num > 0)
                                tempCards.push(v);
                        });
                        setCards(tempCards);
                        window.sessionStorage.setItem('cards', JSON.stringify(tempCards));
                    })
                Axios.get(`${baseURL}getCardRules`, {
                    params: {
                        code: code,
                    }
                }).then((res) => {
                    console.log(res.data);
                    setActionsRules(res.data);
                    window.sessionStorage.setItem('rules', JSON.stringify(res.data));
                })
            }
        }
    }, [code, baseURL]);

    /**
     * Currently only toggling withdrawal.
     * @param {String} action_name 
     */
    const toggleActionRules = (action_name) => {
        const newSelectedArray = [false, false, false, false, false, false];
        if (action_name === "coins") {
            newSelectedArray[0] = !selectedArray[0];
        } else if (action_name === "cha") {
            newSelectedArray[1] = !selectedArray[1];
        } else if (action_name === "poi") {
            newSelectedArray[2] = !selectedArray[2];
        } else if (action_name === "mas") {
            newSelectedArray[3] = !selectedArray[3];
        } else if (action_name === "ant") {
            newSelectedArray[4] = !selectedArray[4];
        } else if (action_name === "pur") {
            newSelectedArray[5] = !selectedArray[5];
        }
        setSelectedArray(newSelectedArray);
        if (counterAction) setCounterAction((prev) => ({
            ...prev,
            card: null,
        }));
        setAction(null);
    }

    const actionHandler = (card, rule) => { // maybe change this to primary action
        setSelectedArray([false, false, false, false, false, false]);
        if (card === "def") actionCreator("def", rule, -1);
        else if (card === "cha") { actionCreator("cha", rule, null); }
        else if (card === "poi") {
            if (coins >= 3) actionCreator("poi", rule, null);
        }
        else if (card === "mas") actionCreator("mas", rule, null); // null will change in selectplayer
        else if (card === "ant") { actionCreator("ant", rule, null); }
        else if (card === "pur") rule === 1 ? actionCreator("pur", rule, -1) : actionCreator("pur", rule, null);
    }

    const actionCreator = (card, rule, defenderId) => {
        // toggling actions on and off
        if (action !== null) {
            setAction(null);
            console.log("here");
            return;
        }
        // creating action object
        let actionObj = {
            card: card,
            rule: rule,
            id: id,
            defenderId: defenderId,
        }
        // updating action state
        console.log(actionObj);

        if (rule === 1 || card === "def") {
            setAction(actionObj);
        }
        else {
            // console.log(counterAction);
            actionObj.defenderId = counterAction.defenderId;
            setCounterAction(actionObj);
        }
        // console.log(actionObj);
    }

    const sendCounters = (v) => {
        if (v === "bs") {
            // tracking the person who called bs
            let lastAction2 = { ...lastAction };
            lastAction2.defenderId = id; // gets switched in back-end
            // the one who called is currently "defender"
            setLastAction((prev) => ({
                ...prev,
                card: "bs",
            }));
            socket.emit("counter", code, lastAction2, opps.length - 1, v, null);
        }
        else if (v === "allow") {
            console.log(lastAction);
            setLastAction((prev) => ({
                ...prev,
                card: "allow",
            }));
            console.log(lastAction);
            // lastAction passed in does not have card set to allow. in fact, prob shouldnt
            socket.emit("counter", code, lastAction, opps.length - 1, v, originalAction);
        }
    }

    return (
        <div>
            {!isCounter &&
                <div className="actions-wrapper">
                    {isTurn &&
                        <div className={`card-base${isTurn ? '-turn' : ''}`} onClick={(_) => toggleActionRules('coins')}>
                            <GiBank className="icon-div" />
                        </div>
                    }
                    {!isTurn &&
                        <div className={`card-base${isTurn ? '-turn' : ''}`}>
                            <GiBank className="icon-div" />
                        </div>
                    }
                    {cards.map((v, i) => {
                        let temp = 1;
                        if (isCounter) {
                            if (v.r2 === 0) return null;
                            else temp = 2;
                        }
                        else if (!isCounter) {
                            if (v.r1 === 0) return null;
                            else temp = 1;
                        }

                        return (
                            <div key={i} className={`card-base${isTurn ? '-turn' : ''}`} onClick={isTurn ? () => actionHandler(actionsRules[i + 1].type, temp) : undefined}>
                                <div>
                                    <div>{v.id === "cha" && <GiCardExchange className="icon-div" />}</div>
                                    <div>{v.id === "poi" && <GiPoisonBottle className="icon-div" />}</div>
                                    <div>{v.id === "mas" && <GiDualityMask className="icon-div" />}</div>
                                    <div>{v.id === "ant" && <GiHealthPotion className="icon-div" />}</div>
                                    <div>{v.id === "pur" && <GiShinyPurse className="icon-div" />}</div>
                                </div>
                            </div>
                        )
                    })}
                    {selectedArray.map((v, i) => {
                        return (
                            // flip the card over to see the actions you can take
                            v && <div key={i} className="card-specific-options">

                                {selectedArray[0] && actionsRules[i].type === "def" && !isCounter && (
                                    <div>
                                        <div onClick={isTurn ? () => actionHandler(actionsRules[i].type, 1) : undefined}>
                                            {actionsRules[i].desc_r1}
                                        </div>
                                        <div onClick={isTurn ? () => actionHandler(actionsRules[i].type, 2) : undefined}>
                                            {actionsRules[i].desc_r2}
                                        </div>
                                    </div>
                                )}
                                {/* {actionsRules[i].type !== "def" &&
                                    (lastAction && lastAction.rule !== 2 && isCounter && actionsRules[i].desc_r2 !== "" && (
                                        <div onClick={lastAction && lastAction.defenderId === id ? () => actionHandler(actionsRules[i].type, 2) : undefined}>
                                            {actionsRules[i].desc_r2} {id}
                                        </div>
                                    )
                                    )
                                } */}
                            </div>
                        )
                    })}
                </div>}
            {isCounter && counterAction && counterAction.defenderId !== id &&
                <div className="counter-actions">
                    {(lastAction.defenderId === id || (lastAction.card === "def" && lastAction.rule === 2)) &&
                        <div className="counter-actions-specific" onClick={(_) => sendCounters("allow")}>Allow</div>}
                    <div className="counter-actions-specific" onClick={(_) => sendCounters("bs")}>Show</div>
                    {/* map the new options here */}
                    {lastAction && (lastAction.defenderId === id || (lastAction.rule === 2 && lastAction.card === "def")) &&
                        (lastAction.rule === 1 || (lastAction.rule === 2 && lastAction.card === "def"))
                        && counters[lastAction.card] && counters[lastAction.card].map((v, i) => (
                            <div key={i} className="counter-actions-specific" onClick={() => actionHandler(v, 2)}>
                                <div>{v === "cha" && <GiCardExchange className="icon-div" />}</div>
                                <div>{v === "poi" && <GiDeathSkull className="icon-div" />}</div>
                                <div>{v === "mas" && <GiDualityMask className="icon-div" />}</div>
                                <div>{v === "ant" && <GiHealthPotion className="icon-div" />}</div>
                                <div>{v === "pur" && <GiShinyPurse className="icon-div" />}</div>
                            </div>
                        ))}
                </div>}
        </div>
    )
};

// maybe object of arrays 