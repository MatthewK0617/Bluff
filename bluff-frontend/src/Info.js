import React from "react";
import { GiPoisonBottle, GiHealthPotion, GiDualityMask, GiShinyPurse, GiDeathSkull, GiBank } from 'react-icons/gi';
import './Info.css';


export default function Info() {
    const info = {
        p1: "Be the last player with items. ",
        p2: "Deception and truth are important strategies in order to win. ",
        p3: "If you are out of items, you are eliminated. ",
        p4: "WARNING: if you are caught lying about an item, you will automatically forfeit an item. ",
        p5: "If you are out of items, you are eliminated. ",
        p6: "Items: ",
        p7: "target loses an item (costs 3 coins) ",
        p8: "blocks ",
        p9: "steal 2 coins from target ",
        p10: "withdraw 3 coins from bank || prevent 2 coin withdraw ",
        p11: "Other Actions: ",
        p12: "allows you to withdraw 1 or 2 coins from bank. ",
        p13: "target loses an item (costs 7 coins and ",
    }

    return (
        <div className="info-wrapper">
            <div className="info-div-1 central header">{info.p1}</div>
            <div className="info-div-1 central header">{info.p3}</div>
            <div className="info-div-space">ITEMS</div>
            {/* <div className="info-div-2">{info.p6}</div> */}
            <div className="info-div-1"><GiPoisonBottle className="icon-gap" /> {info.p7}</div>
            <div className="info-div-1"><GiHealthPotion className="icon-gap" /> {info.p8}<GiPoisonBottle className="icon-gap" /></div>
            <div className="info-div-1"><GiDualityMask className="icon-gap" /> {info.p9}</div>
            <div className="info-div-1"><GiShinyPurse className="icon-gap" />{info.p10}</div>
            <div className="info-div-space">DEFAULT</div>
            <div className="info-div-1"><GiBank className="icon-gap"/> {info.p12}</div>
            <div className="info-div-1"><GiDeathSkull className="icon-gap" /> {info.p13} <GiHealthPotion className="icon-gap" />fails)</div>

        </div>
    );
}