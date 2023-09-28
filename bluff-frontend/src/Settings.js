import React, { useEffect } from "react";
import Axios from 'axios';

import './Settings.css'

import Cards from "./Cards/Cards";
import { Link } from "react-router-dom";

export default function Settings({ socket, code, setCode, id, setId, setOpps }) {
    const baseURL = process.env.REACT_APP_URL || "http://localhost:8000/";
    const [cards, setCards] = React.useState([
        { id: 'cha', num: 4, r1: false, r2: true, },
        { id: 'poi', num: 4, r1: true, r2: false, },
        { id: 'mas', num: 4, r1: true, r2: true, },
        { id: 'ant', num: 4, r1: false, r2: true, },
        { id: 'pur', num: 4, r1: true, r2: true, }
    ]);

    const onCreateGame = async () => {
        await Axios.post(`${baseURL}createGame`, {
            socket_id: socket.id, // **** fix variable names ****
            username: "user_input", // make user input for game creator
            cha: cards[0],
            poi: cards[1],
            mas: cards[2],
            ant: cards[3],
            pur: cards[4],
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
                        v.id !== "amb" && <div className="counter" key={i}>
                            <Cards card={v} cards={cards} setCards={setCards} code={code} />
                        </div>
                    );
                })}
            </div>
            <div className="settings-links-wrapper">
                <Link className="settings-links" to='/'> Back </Link>
                <Link className="settings-links" to='/waiting' onClick={(_) => onCreateGame()}>Create</Link>
            </div>
        </div>
    )
}