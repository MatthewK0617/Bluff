import React from "react";
import '../Settings.css';

export default function Duke({ num, setNum }) {
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
            < div> Dukes</div >
            <div className="inner-counter">
                <div className="count-btn" onClick={(_) => onDecrement()}>
                    -
                </div>
                <div>
                    {num}
                </div>
                <div onClick={(_) => onIncrement()}>
                    +
                </div>
            </div>
        </div >
    )
}