import React from "react";
import Axios from 'axios';

export default function Assassin({ data, setData, code }) {
    // const [num, setNum] = React.useState([]);

    const onDecrement = (e) => {
        if (data.num > 2) {
            const num2 = data.num - 1;
            const data2 = {
                id: "ass",
                num: num2,
                r1: data.r1,
                r2: data.r2,
                r3: data.r3,
            };
            setData(data2);
            if (code !== "")
                updateData(data2);

        }
    }

    const onIncrement = (e) => {
        const num2 = data.num + 1;
        const data2 = {
            id: "ass",
            num: num2,
            r1: data.r1,
            r2: data.r2,
            r3: data.r3,
        };
        setData(data2);
        if (code !== "")
            updateData(data2);
    }

    const changeR1 = (e) => {
        const newr1 = !data.r1;
        const data2 = {
            id: "ass",
            num: data.num,
            r1: newr1,
            r2: data.r2,
            r3: data.r3,
        };
        setData(data2);
        if (code !== "")
            updateData(data2);
    }

    const changeR2 = (e) => {
        const newr2 = !data.r2;
        const data2 = {
            id: "ass",
            num: data.num,
            r1: data.r1,
            r2: newr2,
            r3: data.r3,
        };
        setData(data2);
        if (code !== "")
            updateData(data2);
    }

    const changeR3 = (e) => {
        const newr3 = !data.r3;
        const data2 = {
            id: "ass",
            num: data.num,
            r1: data.r1,
            r2: data.r2,
            r3: newr3,
        };
        setData(data2);
        if (code !== "")
            updateData(data2);
    }

    const baseURL = "http://localhost:8000/"
    const updateData = (card) => {
        Axios.post(`${baseURL}updateCardData`, {
            curr_game: code,
            "id": "ass",
            num: card.num,
            r1: card.r1,
            r2: card.r2,
            r3: card.r3,
        })
            .then((res) => {
                console.log(res);
            }).catch((err) => {
                console.log(err);
            })
        console.log("updated")
    }

    return (
        <div>
            <div>Assassin</div>
            <div className="inner-counter">
                <div onClick={(_) => onDecrement()}>
                    -
                </div>
                <div>
                    {data.num}
                </div>
                <div onClick={(_) => onIncrement()}>
                    +
                </div>
            </div>
            <div className="card-rules">
                {/* replace true and false with the statements */}
                <div onClick={changeR1}>{data.r1 ? "true" : "false"}</div>
                <div onClick={changeR2}>{data.r2 ? "true" : "false"}</div>
                <div onClick={changeR3}>{data.r3 ? "true" : "false"}</div>
            </div>
        </div>
    )
}