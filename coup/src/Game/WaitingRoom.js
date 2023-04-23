import React from "react";
import Axios from 'axios';
import Settings from '../Settings';
import { useHistory, Link } from 'react-router-dom';

import './WaitingRoom.css';

export default function WaitingRoom({ }) {
    // to pass data from child to child have to use parent as intermediary

    return (
        <div className="waiting-wrapper">
            <div>

            </div>
            <Link reloadDocument to='/game'> Start </Link>
            <Link reloadDocument to='/Settings'> Back </Link>
        </div>
    )
}

// display players list
// everytime someone joins (joingame) add to player list
    // pull from players list
// option to edit settings?
// start game