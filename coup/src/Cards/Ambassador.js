import React from "react";
import Axios from 'axios';


export default function Ambassador({ data, setData }) {
    // const [num, setNum] = React.useState(2);
    const onDecrement = (e) => {
        if (data.num > 2) {
            const num2 = data.num - 1;
            const data2 = {
                num: num2,
                r1: data.r1,
                r2: data.r2,
                r3: data.r3,
            };
            setData(data2);
            updateData(data2);

        }
    }

    const onIncrement = (e) => {
        const num2 = data.num + 1;
        const data2 = {
            num: num2,
            r1: data.r1,
            r2: data.r2,
            r3: data.r3,
        };
        setData(data2);

        updateData(data2);
    }

    // const onSubmitHandler = (e) => {
    //     e.preventDefault();
    // }

    const baseURL = "http://localhost:8000/"
    // https://axios-http.com/docs/post_example
    // move this to clientGame? cus should send once that component is rendered?
    const updateData = (card) => { // has to be capital for some reason? 2.24.23
        Axios.post(`${baseURL}api/post`, {
            "id": "amb",
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
            <div>Ambassadors</div>
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
        </div>
    )
}