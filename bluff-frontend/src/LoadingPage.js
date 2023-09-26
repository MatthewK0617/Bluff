import React from 'react';
import { Link } from 'react-router-dom';
import './LoadingPage.css'
import Info from './Game/Info';

export default function LoadingPage() {
    const string = 'Bluff.'
    const [letters, setLetters] = React.useState([]);

    React.useEffect(() => {
        setLetters([]);
        window.sessionStorage.clear();
    }, [])

    React.useEffect(() => {
        setTimeout(() => {
            const letterArray = string.split('');
            setLetters(letterArray);
        }, 100);
    }, [string]);



    return (
        <div className="loading-wrapper">
            <div className="title">
                {letters.map((letter, index) => (
                    <span key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                        {letter}
                    </span>
                ))}
            </div>
            <Info />
            <Link className='loading-page-links' to='/settings'>
                <div>
                    Create Game
                </div>
            </Link>

            <Link to='/joingame' className='loading-page-links'>
                <div>
                    Join Game
                </div>
            </Link>
        </div>
    )
}