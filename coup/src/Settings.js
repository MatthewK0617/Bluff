import React from "react";
import Axios from 'axios';

import './Settings.css'

import Cards from "./Cards/Cards";
import { Link } from "react-router-dom";

export default function Settings({ data, time, socket, code, setCode }) {
    const [cards, setCards] = React.useState([
        {
            id: 'amb',
            num: 4,
            r1: true,
            r2: true,
            r3: true
        },
        {
            id: 'ass',
            num: 4,
            r1: true,
            r2: true,
            r3: true
        },
        {
            id: 'cap',
            num: 4,
            r1: true,
            r2: true,
            r3: true
        },
        {
            id: 'con',
            num: 4,
            r1: true,
            r2: true,
            r3: true
        },
        {
            id: 'duk',
            num: 4,
            r1: true,
            r2: true,
            r3: true
        }
    ]);

    const baseURL = "http://localhost:8000/"

    const onCreateGame = () => {
        Axios.post(`${baseURL}createGame`, {
            id: socket.id, // **** fix variable names ****
            username: "user_input", // make user input for game creator
            amb: cards[0],
            ass: cards[1],
            cap: cards[2],
            con: cards[3],
            duk: cards[4],
        })
            .then((res) => {
                console.log(res);
            }).catch((err) => {
                console.log(err);
            })

        Axios.post(`${baseURL}getPlayerGame`, {
            socket_id: socket.id,
        })
            .then((res) => {
                setCode(res.data[0].game_code);

            }).catch((err) => {
                console.log(err);
            })
    }

    return (
        <div className="settings-wrapper">
            <div className="settings-wrapper-2">
                {Array.from(cards).map((v, i) => {
                    return (
                        <div className="counter" key={i}>
                            <Cards card={v} cards={cards} setCards={setCards} code={code} />
                        </div>
                    );
                })}
            </div>

            <Link to='/waiting' onClick={(_) => onCreateGame()}>Create</Link>
            <Link reloadDocument to='/'> Back </Link>

        </div>
    )
}