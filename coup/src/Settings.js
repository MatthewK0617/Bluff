import React, { useEffect } from "react";

import './Settings.css'

import Ambassador from "./Cards/Ambassador";
import Assassin from "./Cards/Assassin";
import Captain from "./Cards/Captain";
import Contessa from "./Cards/Contessa";
import Duke from "./Cards/Duke";
import { Link } from "react-router-dom";

import Axios from 'axios';


export default function Settings({ data, time }) {
    const [num, setNum] = React.useState(2);

    const [amb, setAmb] = React.useState({
        num: 4, // maybe grab from game_data to start with
        r1: true, // 6:30 - change the name for r1 r2 and r3
        r2: true, // 6:35 - keep the names for r1 r2 r3 for ease of access in tables
        r3: true
    }); // eventually turn into object
    const [ass, setAss] = React.useState({
        num: 4,
        r1: true, // change the name for r1 r2 and r3
        r2: true,
        r3: true
    });
    const [cap, setCap] = React.useState({
        num: 4,
        r1: true, // change the name for r1 r2 and r3
        r2: true,
        r3: true
    });
    const [con, setCon] = React.useState({
        num: 4,
        r1: true, // change the name for r1 r2 and r3
        r2: true,
        r3: true
    });
    const [duk, setDuk] = React.useState({
        num: 4,
        r1: true, // change the name for r1 r2 and r3
        r2: true,
        r3: true // if it doesn't have three rules, should be able to remove it from obj and it'll just stay as null
    });

    const onDecrement = (e) => { // send to server which will update backend
        if (num > 2) {
            let num2 = num - 1;
            setNum(num2);
        }
    }

    const onIncrement = (e) => {
        let num2 = num + 1;
        setNum(num2);
    }

    const onSubmitHandler = (e) => {
        e.preventDefault();
        updateData(duk);
    }

    const baseURL = "http://localhost:8000/"
    // https://axios-http.com/docs/post_example
    // move this to clientGame? cus should send once that component is rendered?
    const updateData = (card) => { // has to be capital for some reason? 2.24.23
        Axios.post(`${baseURL}api/post`, card).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        })
        console.log("updated")
    }
    // turn this into array so that I can read in all the cards on 1 submit

    return (
        <div className="settings-wrapper">
            <div>
                <div>Players</div>
                <div>
                    {data} {time}
                </div>
                <div>
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
            <div className="settings-wrapper-2">
                <div className="counter">
                    <Ambassador data={amb} setData={setAmb} />
                </div>
                <div className="counter">
                    <Assassin data={ass} setData={setAss} />
                </div>
                <div className="counter">
                    <Captain data={cap} setData={setCap} />
                </div>
                <div className="counter">
                    <Contessa data={con} setData={setCon} />
                </div>
                <div className="counter">
                    <Duke data={duk} setData={setDuk} />
                </div>

            </div>
            <div className="button-1">
                {/* <form onSubmit={(e) => onSubmitHandler(e)}>
                    <input type="Submit" value="update" />
                </form> */}

            </div>
            <Link reloadDocument to='/game'> Create </Link>

        </div>
    )
}

// link doesnt have event -> no prevent default? can wrap link in form if doesnt work

// https://www.freecodecamp.org/news/axios-react-how-to-make-get-post-and-delete-api-requests/
// https://stackoverflow.com/questions/74263218/api-is-working-fine-with-postman-but-not-working-in-react