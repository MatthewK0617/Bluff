import React from "react";
import Axios from 'axios';

export default function Duke({ data, setData, code }) {
    const baseURL = "http://localhost:8000/";

    const updateData = (card) => {
        Axios.post(`${baseURL}updateCardData`, {
            curr_game: code,
            "id": "duk",
            num: card.num,
            r1: card.r1,
            r2: card.r2,
            r3: card.r3,
        })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });

        console.log("updated");
    };

    const onDecrement = () => {
        if (data.num > 2) {
            const num2 = data.num - 1;
            setData({
                ...data,
                num: num2
            });
            if (code !== "") {
                updateData(data);
            }
        }

    };

    const onIncrement = () => {
        const num2 = data.num + 1;
        setData({
            ...data,
            num: num2
        });
        if (code !== "") {
            updateData(data);
        }
    };

    const toggleRule = (rule) => {
        setData(prevData => ({
            ...prevData,
            [rule]: !prevData[rule]
        }));
        if (code !== "") {
            updateData(data);
        }
    };

    return (
        <div>
            <div>Duke</div>
            <div className="inner-counter">
                <div onClick={onDecrement}>-</div>
                <div>{data.num}</div>
                <div onClick={onIncrement}>+</div>
            </div>
            <div className="card-rules">
                <div onClick={() => toggleRule('r1')}>{data.r1 ? "true" : "false"}</div>
                <div onClick={() => toggleRule('r2')}>{data.r2 ? "true" : "false"}</div>
                <div onClick={() => toggleRule('r3')}>{data.r3 ? "true" : "false"}</div>
            </div>
        </div>
    );
}