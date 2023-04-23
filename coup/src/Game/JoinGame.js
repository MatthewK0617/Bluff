import React from "react";
import Axios from 'axios';
import Settings from '../Settings';
import { useHistory, Link } from 'react-router-dom';

import './JoinGame.css';

export default function JoinGame({ }) {
    // to pass data from child to child have to use parent as intermediary

    let [ign, setIgn] = React.useState("");
    let [code, setCode] = React.useState("");
    let [list, setList] = React.useState([]); // {name, id}
    let [codes, setCodes] = React.useState([]);
    let [isGame, setIsGame] = React.useState(false);

    const baseURL = "http://localhost:8000/"

    let onChangeCode = (event) => {
        code = event.target.value;
        setCode(code);
    };

    let onChangeIgn = (event) => {
        ign = event.target.value;
        setIgn(ign);
    };

    let onSubmit = (event) => {
        joinGame();
        event.preventDefault();
    }

    // should be every time the db updates. currently everytime you want to add player
    let getPlayers = () => {
        Axios.get(`${baseURL}getPlayers`, {
            params: {
                code: code
            }
        })
            .then(res => {
                let list2 = [];
                for (let i = 0; i < res.data.length; i++) {
                    list2.push({
                        name: res.data[i].name,
                        id: res.data[i].id,
                    })
                }
                list = [...list2];
                setList(list);
                // console.log(list);
            })
            .catch(e => {
                console.log(e);
            })
    }

    let addPlayer = (len) => {
        getPlayers();
        if (ign !== "") {
            for (let i = 0; i < len; i++) {
                if (ign === list[i]) {
                    console.log("username is already taken")
                    return;
                }
            }
            list = [...list, ign];
            setList(list);

            Axios.post(`${baseURL}addPlayers`, {
                username: ign,
                code: code
            })
                .then(res => {
                })
                .catch(e => {
                })

            setIgn("");
            setCode("");
        }
    } // when a new game is created, create a new table named the code, and then add the players to that table

    let getGames = () => {
        Axios.get(`${baseURL}getGames`) // should also use useeffect to get it initially
            .then(res => {
                let list2 = [];
                for (let i = 0; i < res.data.length; i++) {
                    list2.push(res.data[i].Tables_in_card_game)
                }
                setCodes(list2);
                console.log(codes);
            })
    }
    let joinGame = () => {
        getGames();

        let len = list.length;
        for (let i = 0; i < codes.length; i++) {
            if (codes[i] === code) { // add player to the specific game instance
                setIsGame(true);
                break;
            }
        }
        if (isGame) addPlayer(len);
        else {
            setCode("");
            console.log("invalid code");
        }
    }

    React.useEffect(() => {
        getGames();
    }, [])

    return (
        <div className="join-wrapper">
            <div>
                <form
                    onSubmit={(event) => onSubmit(event)}
                    className="form border border-primary"
                >
                    <input value={ign} onChange={onChangeIgn} placeholder="username" />
                    <input value={code} onChange={onChangeCode} placeholder="code" />


                    <button type="submit">Submit</button>
                </form>

                {list.map((v, i) => (
                    <div className="todo-element" key={i}>
                        {v.name}
                        {/* <div className="delete-button" onClick={() => onRemove(i)}>
                            <RemoveCircleOutline color={"#00000"} height="20px" width="20px" />
                        </div> */}
                    </div>
                ))}
            </div>
            <Link reloadDocument to='/Settings'> Back </Link>
        </div>
    )
}


// enter code to join
// pick username
// add to player list