import React, { useEffect, useState } from "react";
import Axios from "axios";

import './Actions.css';

export default function Actions({ code, id, action, setAction, isTurn }) {
    const baseURL = "http://localhost:8000/";
    const [cards, setCards] = useState([]);
    let [selected, setSelected] = useState([false, false, false, false, false, false])

    useEffect(() => {
        // get from session storage
        const data1 = window.sessionStorage.getItem('cards');
        if (data1) {
            const retrievedCards = JSON.parse(data1);
            setCards(retrievedCards);
        }
        // if they don't exist in session storage, pull from db
        // add to storage
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
                        console.log(tempCards);
                        setCards(tempCards);
                        window.sessionStorage.setItem('cards', JSON.stringify(tempCards));
                    })
            }
        }
    }, [code]);

    const actionHandler = (action, actionObj) => {
        if (action !== null) {
            // if the action is the same as before, set it to null
            // if the action is different from before, set it to the new one
            setAction(null);
            return;
        }
    }

    const takeCoins = (giverId, coin_trans) => {
        // toggling what action is selected
        if (action !== null) {
            setAction(null);
            return;
        }
        console.log("clicked");
        let actionObj = {
            card: 'Coins',
            id: id,
            giverId: giverId,
            coin_trans: coin_trans, // make this 1 or 2
            // add more if necessary
        }
        setAction(actionObj);
        // socket.emit("take_coins", code, giverId, id, trans_amount);
    }

    const onCardClickListener = (card) => {
        console.log(card);
        // open a new menu - select rule. return the selected rule
        //  flip the card and partition into how many rules there are
        //  create a state that is updated. if the state is updated, show the menu
        // select player
        // show lock button
        // when lock button is clicked, update action state
    }

    return (
        <div>
            <div className="actions-wrapper">
                {isTurn &&
                    <div className="take-coins-action" onClick={(_) => takeCoins(-1, 2)}>
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
                        <div key={i} className="card-base" onClick={(_) => onCardClickListener(v.id)}>
                            {v.id}
                        </div>
                    )
                })}
            </div>
        </div>
    )
};