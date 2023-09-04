import React, { useEffect, useState } from "react";
import Axios from "axios";

import './Actions.css';

export default function Actions({ code, id, action, setAction, isTurn, selectedArray, setSelectedArray }) {
    const baseURL = "http://localhost:8000/";
    const [cards, setCards] = useState([]);
    let [actionsRules, setActionsRules] = useState([]);

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
    }, [code]);

    const toggleActionRules = (action_name) => {
        console.log(action_name);
        // setSelectedAction(action_name); // do i need this state?

        const newSelectedArray = [false, false, false, false, false, false];

        if (action_name === "coins") {
            newSelectedArray[0] = !selectedArray[0];
        } else if (action_name === "amb") {
            newSelectedArray[1] = !selectedArray[1];
        } else if (action_name === "ass") {
            newSelectedArray[2] = !selectedArray[2];
        } else if (action_name === "cap") {
            newSelectedArray[3] = !selectedArray[3];
            console.log(actionsRules);
        } else if (action_name === "con") {
            newSelectedArray[4] = !selectedArray[4];
        } else if (action_name === "duk") {
            newSelectedArray[5] = !selectedArray[5];
        }
        setSelectedArray(newSelectedArray);
        setAction(null);
    }

    const actionHandler = (card, rule) => { // maybe change this to primary action
        if (card === "def") rule === 1 ? def(-1, 1) : def(-1, 2);
        else if (card === "amb") { }
        else if (card === "ass") { }
        else if (card === "cap") cap(rule);
        else if (card === "con") { }
        else if (card === "duk") duk(rule);
    }

    const def = (defender, transaction) => {
        takeCoins("def", defender, transaction);
    }

    /**
     * params: 
     * 
     */
    const amb = () => { }

    const cap = (rule) => {
        if (rule === 1) {
            takeCoins("cap", null, 2);
            console.log("here");
        }
    }

    const duk = (rule) => {
        if (rule === 1) takeCoins("duk", -1, 3);
        else if (rule === 2) {
            // should only be able to be selected on block
        }
    }

    const takeCoins = (card, defenderId, coin_trans) => {
        // toggling actions on and off
        if (action !== null) {
            setAction(null);
            return;
        }
        console.log("clicked");
        let actionObj = {
            card: card,
            id: id,
            defenderId: defenderId,
            coin_trans: coin_trans,
        }
        setAction(actionObj);
    }

    return (
        <div>
            <div className="actions-wrapper">
                {/* {isTurn &&
                    <div className="take-coins-action" onClick={(_) => takeCoins(-1, 2)}>
                        Coins
                    </div>
                } */}
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
                        <div key={i} className="card-base" onClick={(_) => toggleActionRules(v.id)}>
                            {v.id}
                        </div>
                    )
                })}
                {selectedArray.map((v, i) => {
                    return (
                        // <div key={i} className="card-specific-options">
                        v && <div key={i} className="card-specific-options">
                            <div>{actionsRules[i].type}</div>

                            {actionsRules[i].desc_r1 !== "" && (
                                <div onClick={isTurn ? () => actionHandler(actionsRules[i].type, 1) : undefined}>
                                    {actionsRules[i].desc_r1}
                                </div>
                            )}
                            {actionsRules[i].desc_r2 !== "" && (
                                <div onClick={isTurn ? () => actionHandler(actionsRules[i].type, 2) : undefined}>
                                    {actionsRules[i].desc_r2}
                                </div>
                            )}
                        </div>
                        // </div>
                    )
                })}
            </div>
        </div>
    )
};

// maybe object of arrays 