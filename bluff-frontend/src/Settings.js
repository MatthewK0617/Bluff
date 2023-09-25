import React, { useEffect } from "react";
import Axios from 'axios';

import './Settings.css'

import Cards from "./Cards/Cards";
import { Link } from "react-router-dom";

export default function Settings({ socket, code, setCode, id, setId, setOpps }) {
    // change this to pull from template
    const baseURL = process.env.REACT_APP_URL || "http://localhost:8000/";
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

    const onCreateGame = async () => {
        await Axios.post(`${baseURL}createGame`, {
            socket_id: socket.id, // **** fix variable names ****
            username: "user_input", // make user input for game creator
            amb: cards[0],
            ass: cards[1],
            cap: cards[2],
            con: cards[3],
            duk: cards[4],
        }).catch((err) => {
            console.log(err);
        })

        const game_creator = await Axios.get(`${baseURL}getInitialPlayerData`, {
            params: {
                socket_id: socket.id,
            }
        })
        const retrieved_code = game_creator.data.game_code;
        const game_creator_id = parseInt(game_creator.data.id);

        socket.emit("joinGameWaiting", retrieved_code, game_creator_id, (response) => {
            // const names = response.players.map(player => player.name);
            setOpps(response.players);
        });

        setCode(retrieved_code);
        setId(game_creator_id);
    }

    useEffect(() => {
        setTimeout(() => {
            try {
                window.sessionStorage.setItem('code', JSON.stringify(code));
                window.sessionStorage.setItem('id', id);
            } catch (error) {
                console.error('Error stringifying code:', error);
            }
        }, 100);

    }, [code, id]);

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

            <Link className="settings-links" to='/waiting' onClick={(_) => onCreateGame()}>Create</Link>
            <Link className="settings-links" to='/'> Back </Link>

        </div>
    )
}