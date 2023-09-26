import React from "react";
import './Info.css';

export default function Info() {
    const info = {
        p1: "Be the last player with cards. ",
        p2: "Deception and truth are important strategies in order to win. ",
        p3: "Your cards represent your items, if you are out of items, you are eliminated. ",
        p4: "WARNING: if you are caught lying about an item, you will automatically forfeit an item. ",
        p5: "If you are out of items, you are eliminated. ",
        p6: "Items: ",
        p7: "Poison: use to make target forfeit an item, but costs 3 coins to use. ",
        p8: "Antidote: use to block a poison attempt. ",
        p9: "Mask: allows you to steal 2 coins from another player. ",
        p10: "Purse: allows you to take 3 coins from bank. Can prevent 2 coin withdraw. ",
        p11: "Other Actions: ",
        p12: "Withdraw: allows you to withdraw 1 or 2 coins from bank. ",
        p13: "Lethal Poison: cannot be blocked by an antidote, but costs 7 coins to use. ",
    }

    return (
        <div className="info-wrapper">
            <div className="info-div-1">{info.p1}</div>
            <div className="info-div-1">{info.p3}</div>
            <div className="info-div-1">——</div>
            <div className="info-div-2">{info.p6}</div>
            <div className="info-div-1">{info.p7}</div>
            <div className="info-div-1">{info.p8}</div>
            <div className="info-div-1">{info.p9}</div>
            <div className="info-div-1">{info.p10}</div>

        </div>
    );
}