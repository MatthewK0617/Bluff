import React, { useEffect } from "react";
import Axios from "axios";
import './EndPage.css';

export default function EndPage({ winner, code, id }) {
    const baseURL = process.env.REACT_APP_URL || "http://localhost:8000/";

    useEffect(() => {
        let isMounted = true;

        const timer = setTimeout(() => {
            Axios.post(`${baseURL}leaveInGame`, {
                code: code,
                id: id
            })
                .then((res) => {
                    if (isMounted) {
                        console.log(res);
                    }
                })
                .catch((err) => {
                    if (isMounted) {
                        console.log(err);
                    }
                })
            window.sessionStorage.clear();
            setTimeout(() => {
                if (isMounted) {
                    window.location.href = '/';
                }
            }, 1000);
        }, 5000);

        // Cleanup function
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [code, id, baseURL]);

    return (
        <div className="end-wrapper">
            <div className="winner">
                {winner.username} won the game.
            </div>
        </div>
    );
}
