import React from "react";
import Axios from 'axios';
import { GiHealthPotion, GiDualityMask, GiShinyPurse, GiDeathSkull, GiCardExchange } from 'react-icons/gi';
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import './Cards.css';

export default function Cards({ card, cards, setCards, code }) {
    let [card2, setCard2] = React.useState(card);
    const baseURL = process.env.REACT_APP_URL || "http://localhost:8000/";

    const updateData = () => {
        Axios.post(`${baseURL}updateCardData`, {
            curr_game: code,
            "id": card2.id,
            num: card2.num,
            r1: card2.r1,
            r2: card2.r2,
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
            updateData();
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

    // const toggleRule = (rule) => {
    //     setCard2({
    //         ...card2,
    //         [rule]: !card2[rule]
    //     });
    //     func_helper(card, { ...card, [rule]: !card[rule] }); // Pass card and modified card2 to func_helper
    // };

    return (
        <div>
            <div className="icon-wrapper">
                <div>{card2.id === "cha" && <GiCardExchange className="icon-div" />}</div>
                <div>{card2.id === "poi" && <GiDeathSkull className="icon-div" />}</div>
                <div>{card2.id === "mas" && <GiDualityMask className="icon-div" />}</div>
                <div>{card2.id === "ant" && <GiHealthPotion className="icon-div" />}</div>
                <div>{card2.id === "pur" && <GiShinyPurse className="icon-div" />}</div>
            </div>

            <div className="inner-counter">
                <div onClick={onDecrement} className="value-changer"><AiOutlineMinusCircle /></div>
                <div className="value">{card2.num}</div>
                <div onClick={onIncrement} className="value-changer"><AiOutlinePlusCircle /></div>
            </div>
            <div className="card-rules">
                {/* <div onClick={() => toggleRule('r1')}>{card2.r1 ? "true" : "false"}</div> */}
                {/* <div onClick={() => toggleRule('r2')}>{card2.r2 ? "true" : "false"}</div> */}
            </div>
        </div>
    );
}