import React from "react";

export default function Assassin({ num, setNum }) {
    // const [num, setNum] = React.useState(2);
    let onDecrement = (e) => {
        if (num > 2) {
            let num2 = num - 1;
            setNum(num2);
        }
    }

    let onIncrement = (e) => {
        let num2 = num + 1;
        setNum(num2);
    }

    return (
        <div>
            <div>Assassins</div>
            <div className="inner-counter">
                <div onClick={(_) => onDecrement()}>
                    -
                </div>
                <div>
                    {num}
                </div>
                <div onClick={(_) => onIncrement()}>
                    +
                </div>
            </div>
        </div>
    )
}