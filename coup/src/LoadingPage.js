import React from 'react';
import { Link } from 'react-router-dom';

export default function LoadingPage() {
    React.useEffect(() => {
        window.sessionStorage.clear();
    }, [])

    return (
        <div>
            <div>
                <Link reloadDocument to='/settings'>
                    Create Game
                </Link>
            </div>

            <div>
                <Link to='/joingame'>
                    Join Game
                </Link>
            </div>
        </div>
    )
}