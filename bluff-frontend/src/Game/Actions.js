import React, { useEffect, useState } from "react";
import Axios from "axios";

import './Actions.css';

export default function Actions({ code, id, action, setAction,
    counterAction, setCounterAction, isTurn, isCounter,
    selectedArray, setSelectedArray, lastAction, setLastAction,
    opps, socket, originalAction }) {
    const baseURL = process.env.REACT_APP_URL || "http://localhost:8000/";
    const [cards, setCards] = useState([]);
    let [actionsRules, setActionsRules] = useState([]);

    const counters = {
        "ass": ["con"],
        "cap": ["cap"],
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
                        // console.log(tempCards);
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

    const toggleActionRules = (action_name) => {
        const newSelectedArray = [false, false, false, false, false, false];
        if (action_name === "coins") {
            newSelectedArray[0] = !selectedArray[0];
        } else if (action_name === "amb") {
            newSelectedArray[1] = !selectedArray[1];
        } else if (action_name === "ass") {
            newSelectedArray[2] = !selectedArray[2];
        } else if (action_name === "cap") {
            newSelectedArray[3] = !selectedArray[3];
        } else if (action_name === "con") {
            newSelectedArray[4] = !selectedArray[4];
        } else if (action_name === "duk") {
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
        if (card === "def") actionCreator("def", rule, -1);
        else if (card === "amb") { }
        else if (card === "ass") actionCreator("ass", rule, null);
        else if (card === "cap") actionCreator("cap", rule, null); // null will change in selectplayer
        else if (card === "con") { actionCreator("con", rule, null); }
        else if (card === "duk") rule === 1 ? actionCreator("duk", rule, -1) : actionCreator("duk", rule, null);
    }

    const actionCreator = (card, rule, defenderId) => {
        // toggling actions on and off
        if (action !== null) {
            setAction(null);
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
            console.log(counterAction);
            actionObj.defenderId = counterAction.defenderId;
            setCounterAction(actionObj);
        }
        console.log(actionObj);
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
            })); // defender is the one that allowed
            // lastAction passed in does not have card set to allow. in fact, prob shouldnt
            socket.emit("counter", code, lastAction, opps.length - 1, v, originalAction);
        }
    }

    return (
        <div>
            {!isCounter &&
                <div className="actions-wrapper">
                    {isTurn &&
                        <div className="take-coins-action" onClick={(_) => toggleActionRules('coins')}>
                            Coins
                        </div>
                    }
                    {!isTurn &&
                        <div className="take-coins-action">
                            Coins
                        </div>
                    }
                    {cards.map((v, i) => {
                        return (
                            // implement amb later 
                            i !== 0 && <div key={i} className={`card-base${isTurn ? '-turn' : ''}`} onClick={(_) => toggleActionRules(v.id)}>
                                {v.id}
                            </div>
                        )
                    })}
                    {selectedArray.map((v, i) => {
                        return (
                            // flip the card over to see the actions you can take
                            v && <div key={i} className="card-specific-options">
                                <div>{actionsRules[i].type} {v}</div>

                                {lastAction && lastAction.card === "ass" && <div>asdasd</div>}

                                {!isCounter && actionsRules[i].desc_r1 !== "" && (
                                    <div onClick={isTurn ? () => actionHandler(actionsRules[i].type, 1) : console.log("1")}>
                                        {actionsRules[i].desc_r1}
                                    </div>
                                )}
                                {actionsRules[i].type === "def" ?
                                    (actionsRules[i].desc_r2 !== "" && (
                                        <div onClick={isTurn ? () => actionHandler(actionsRules[i].type, 2) : console.log("1a")}>
                                            {actionsRules[i].desc_r2}
                                        </div>
                                    )
                                    ) :
                                    (lastAction && lastAction.rule !== 2 && isCounter && actionsRules[i].desc_r2 !== "" && (
                                        <div onClick={lastAction && lastAction.defenderId === id ? () => actionHandler(actionsRules[i].type, 2) : console.log(lastAction)}>
                                            {actionsRules[i].desc_r2} {id}
                                        </div>
                                    )
                                    )
                                }
                            </div>
                            // </div>
                        )
                    })}
                </div>}
            {isCounter && counterAction && counterAction.defenderId !== id &&
                <div className="counter-actions">
                    {lastAction.defenderId === id && <div onClick={(_) => sendCounters("allow")}>Allow</div>}
                    <div onClick={(_) => sendCounters("bs")}>BS</div>
                    {/* map the new options here */}
                    {lastAction && lastAction.defenderId === id && lastAction.rule === 1 && counters[lastAction.card] &&
                        counters[lastAction.card].map((v, i) => (
                            <div key={i} onClick={() => actionHandler(v, 2)}>{v}</div>
                        ))}
                </div>}
        </div>
    )
};

// maybe object of arrays 