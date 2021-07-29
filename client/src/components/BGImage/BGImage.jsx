import React from 'react'
import BGI from "../../assets/images/GB.svg"
import "./BGImage.scss"

function BGImage() {
    return (
        <div className="BG-image__container">
            <img className="BG-image" src={BGI} alt="gameBoy screen"/>
        </div>
    )
}

export default BGImage
