import React from "react";
import Axios from 'axios';

export default function Cards({ card, cards, setCards, code }) {
    let [card2, setCard2] = React.useState(card);
    const baseURL = "http://localhost:8000/";

    const updateData = (card) => {
        Axios.post(`${baseURL}updateCardData`, {
            curr_game: code,
            "id": card2.id,
            num: card2.num,
            r1: card2.r1,
            r2: card2.r2,
            r3: card2.r3,
        })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const func_helper = (card, card2) => {
        setCards(prevCards => {
            const updatedCards = prevCards.map(prevCard => {
                if (prevCard.id === card.id) {
                    return card2;
                }
                return prevCard;
            });
            return updatedCards;
        });

        if (code !== "") {
            updateData(card2);
        }
    };

    const onDecrement = () => {
        if (card2.num > 2) {
            const num2 = card2.num - 1;
            setCard2({
                ...card2,
                num: num2
            });
            func_helper(card, { ...card, num: num2 }); // Pass card and modified card2 to func_helper
        }
    };

    const onIncrement = () => {
        const num2 = card2.num + 1;
        setCard2({
            ...card2,
            num: num2
        });
        func_helper(card, { ...card, num: num2 }); // Pass card and modified card2 to func_helper
    };

    const toggleRule = (rule) => {
        setCard2({
            ...card2,
            [rule]: !card2[rule]
        });
        func_helper(card, { ...card, [rule]: !card[rule] }); // Pass card and modified card2 to func_helper
    };

    return (
        <div>
            <div>{card2.id}</div>
            <div className="inner-counter">
                <div onClick={onDecrement}>-</div>
                <div>{card2.num}</div>
                <div onClick={onIncrement}>+</div>
            </div>
            <div className="card-rules">
                <div onClick={() => toggleRule('r1')}>{card2.r1 ? "true" : "false"}</div>
                <div onClick={() => toggleRule('r2')}>{card2.r2 ? "true" : "false"}</div>
                <div onClick={() => toggleRule('r3')}>{card2.r3 ? "true" : "false"}</div>
            </div>
        </div>
    );
}