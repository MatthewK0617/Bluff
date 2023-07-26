import React, { useEffect, useState } from "react";
import Axios from 'axios';
import { Link } from 'react-router-dom';

import './ClientGame.css';

export default function ClientGame({ code, setCode, id, setId, opps, setOpps, socket }) {
    const baseURL = "http://localhost:8000/";
    let [coins, setCoins] = useState(2);
    let [cards, setCards] = useState(2);


    // load data from before
    useEffect(() => {
        const data1 = window.sessionStorage.getItem('code');
        const data2 = window.sessionStorage.getItem('id');
        const data3 = window.sessionStorage.getItem('opps');

        if (data1 !== null && data2 !== null && data3 !== null) {
            try {
                const code2 = JSON.parse(data1) + "";
                console.log(data3);
                const opps2 = JSON.parse(data3);
                // load all the data correlated with saved id
                if (socket) { // if something isnt finished in the useeffect, it will wait until it is finished
                    socket.emit("reconnected", code2);
                }
                setCode(code2);
                setId(data2);
                setOpps(opps2);
            } catch (error) {
                console.error('Error parsing data:', error);
            }
        }
    }, [setCode, setId, setOpps, socket, code]);

    useEffect(() => { // have to store more information now
        setTimeout(() => {
            try {
                window.sessionStorage.setItem('code', JSON.stringify(code));
                window.sessionStorage.setItem('id', id);
                window.sessionStorage.setItem('opps', JSON.stringify(opps));
            } catch (error) {
                console.error('Error stringifying code:', error);
            }
        }, 100);

    }, [code, id, opps]);

    const handleLeaveGame = async () => {
        try {
            await Axios.post(`${baseURL}leaveGame`, {
                code: code,
                id: id
            });
            window.sessionStorage.clear();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="client-wrapper">
            <div>
                {id} + {code} + {coins} + {cards}
            </div>
            <div>
                {opps.map((v, i) => {
                    return (
                        <div key={i}>
                            {v}
                        </div>
                    )
                })}
            </div>
            <Link reloadDocument to='/waiting'> back </Link>
            <Link reloadDocument to='/'>
                <div onClick={(_) => handleLeaveGame()}> Leave Game </div>
            </Link>
        </div>
    )
}