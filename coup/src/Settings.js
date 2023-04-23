import React, { useEffect } from "react";
import Axios from 'axios';

import './Settings.css'

import Ambassador from "./Cards/Ambassador";
import Assassin from "./Cards/Assassin";
import Captain from "./Cards/Captain";
import Contessa from "./Cards/Contessa";
import Duke from "./Cards/Duke";
import { Link } from "react-router-dom";



export default function Settings({ data, time, socket }) {

    const [amb, setAmb] = React.useState({
        id: 'amb',
        num: 4, // maybe grab from game_data to start with
        r1: true, // 6:30 - change the name for r1 r2 and r3
        r2: true, // 6:35 - keep the names for r1 r2 r3 for ease of access in tables
        r3: true
    }); // eventually turn into object
    const [ass, setAss] = React.useState({
        id: 'ass',
        num: 4,
        r1: true, // change the name for r1 r2 and r3
        r2: true,
        r3: true
    });
    const [cap, setCap] = React.useState({
        id: 'cap',
        num: 4,
        r1: true, // change the name for r1 r2 and r3
        r2: true,
        r3: true
    });
    const [con, setCon] = React.useState({
        id: 'con',
        num: 4,
        r1: true, // change the name for r1 r2 and r3
        r2: true,
        r3: true
    });
    const [duk, setDuk] = React.useState({
        id: 'duk',
        num: 4,
        r1: true, // change the name for r1 r2 and r3
        r2: true,
        r3: true // if it doesn't have three rules, should be able to remove it from obj and it'll just stay as null
    });

    const onSubmitHandler = (e) => {
        e.preventDefault();
        // updateCardData(duk);
    }

    const baseURL = "http://localhost:8000/"

    const onCreateGame = () => {
        // create game
        // generate random code
        Axios.post(`${baseURL}createGame`, {
            username: "user_input", // make user input for game creator
            amb: amb,
            ass: ass,
            cap: cap,
            con: con,
            duk: duk,

        })
            .then((res) => {
                console.log(res);
            }).catch((err) => {
                console.log(err);
            })
    }

    return (
        <div className="settings-wrapper">
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
            <Link to='/waiting' onClick={(_) => onCreateGame()}>Create</Link>

            <Link reloadDocument to='/'> Back </Link>

        </div>
    )
}