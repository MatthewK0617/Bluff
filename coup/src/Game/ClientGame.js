import React from "react";
import Axios from 'axios';
import Settings from '../Settings';
import { useHistory, Link } from 'react-router-dom';

import './ClientGame.css';

export default function ClientGame({ }) {
    // to pass data from child to child have to use parent as intermediary

    return (
        <div className="client-wrapper">
            <div>
                
            </div>
            <Link reloadDocument to='/Settings'> back </Link>
        </div>
    )
}

// can you tell the server to create new instances of the game? create rooms for public and private

// 2.24.23 - figure out how to send data to db