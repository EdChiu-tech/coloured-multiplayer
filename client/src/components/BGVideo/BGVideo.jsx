import React from 'react'
import BGV from "../../assets/videos/retro_game_screen.mp4"
import "./BGVideo.scss"

const BGVideo = () => {
    return (
        <div className="background-video__container">
            <video className="background-video" autoPlay="autoplay" loop="loop" muted>
                <source src={BGV} type="video/mp4"/>
            </video>
        </div>
    )
}

export default BGVideo
