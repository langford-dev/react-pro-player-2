import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import { SUPPORTED_MIME_TYPES } from '../constants'
import { TReactProPlayer, THTMLVideoElement } from '../types'
import Hls from 'hls.js'
import "../styles.module.css"
import { ERROR_MESSAGES } from '../constants/messages'
import { BiPause, BiPlay } from 'react-icons/bi'
import { MdOutlineForward10, MdReplay10, MdFullscreen, MdFullscreenExit } from 'react-icons/md'

const ReactProPlayer: FC<TReactProPlayer> = ({ src, poster, customStyles }) => {
    const reactProPlayerRef = useRef<THTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [qualities, setQualities] = useState<number[]>([])
    const [selectedQuality, setSelectedQuality] = useState<number>(720)
    const [loading, setLoading] = useState<boolean>(true)
    const [loadingError, setLoadingError] = useState<boolean>(false)
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<string>('0');
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        onLoadReactProPlayer()
    }, [src])

    useEffect(() => {
        trackPlayerPlayState()
    }, [isPlaying])

    function onLoadReactProPlayer() {
        if (!reactProPlayerRef.current) {
            console.log(ERROR_MESSAGES.undefinedPlayerRef)
            setLoadingError(true)
            setLoading(false)
            return
        }

        try {
            if (Hls.isSupported()) {
                setLoading(true)

                const hls = new Hls()
                reactProPlayerRef.current.hls = hls

                hls.loadSource(src)
                hls.attachMedia(reactProPlayerRef.current)
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setQualities(hls.levels.map((level) => level.height))
                    setSelectedQuality(hls.levels.length - 1)
                    getVideoMetaData()
                })
            } else if (reactProPlayerRef.current.canPlayType(SUPPORTED_MIME_TYPES[0])) {
                reactProPlayerRef.current.src = src
                getVideoMetaData()
            }
        } catch (error) {
            setLoadingError(true)
            setLoading(false)
            console.log("hls loading error", error)
        }
    }

    /** Fetches the video's metadata from the provided source */
    function getVideoMetaData() {
        console.log('fetching video metadata...')

        if (!reactProPlayerRef.current) {
            console.log(ERROR_MESSAGES.undefinedPlayerRef)
            setLoadingError(true)
            setLoading(false)
            return
        }

        reactProPlayerRef.current.addEventListener('loadedmetadata', (metaData_: Event) => {
            if (!metaData_) {
                console.log('could fetch video metadata ❌')
                setLoadingError(true)
                setLoading(false)
                return
            }

            console.log('metadata loaded ✅')

            setDuration(reactProPlayerRef.current?.duration || 0)
            setCurrentTime(reactProPlayerRef.current?.currentTime.toString() || '0')
            setIsPlaying(true)
            setLoading(false)
        })
    }

    function trackPlayerPlayState() {
        if (!reactProPlayerRef.current) {
            console.log(ERROR_MESSAGES.undefinedPlayerRef)
            setLoadingError(true)
            setLoading(false)
            return
        }

        if (isPlaying) reactProPlayerRef.current.play()
        else reactProPlayerRef.current.pause()
    }

    const handleQualityChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const newQuality = parseInt(event.target.value)
        const video = reactProPlayerRef.current

        setSelectedQuality(newQuality)
        setLoading(true)

        if (!video) {
            console.log(ERROR_MESSAGES.undefinedPlayerRef)
            return
        }

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const hls = video.hls

            if (hls && hls.levels[newQuality]) {
                hls.currentLevel = newQuality
                setLoading(false)
            }
        }
    }

    const handleFullScreen = () => {
        const video = reactProPlayerRef.current

        if (!video) {
            console.log(ERROR_MESSAGES.undefinedPlayerRef)
            return
        }

        if (isFullScreen) {
            document.exitFullscreen();
            setIsFullScreen(false)
        } else {
            video.requestFullscreen();
            setIsFullScreen(true)
        }
    }

    const handlePlay = () => {
        const video = reactProPlayerRef.current

        if (!video) {
            console.log(ERROR_MESSAGES.undefinedPlayerRef)
            return
        }

        if (isPlaying) {
            video.pause()
            setIsPlaying(false)
        } else {
            video.play();
            setIsPlaying(true)
        }
    }

    const handleProgress = (event: ChangeEvent<HTMLInputElement>) => {
        const seekTime = event.target.value;

        setCurrentTime(seekTime)

        if (!reactProPlayerRef.current) {
            console.log(ERROR_MESSAGES.undefinedPlayerRef)
            setLoading(false)
            return
        }

        reactProPlayerRef.current.currentTime = Number(seekTime)
    }

    const handleForwardAndRewind = (actionType: string) => {
        const video = reactProPlayerRef.current

        if (!video) {
            console.log(ERROR_MESSAGES.undefinedPlayerRef)
            return
        }

        if (actionType === "FORWARD") video.currentTime += 10
        if (actionType === "REWIND") video.currentTime -= 10
    }

    return (
        <div className='react-pro-player-wrapper'>
            <video
                style={{ width: '100%', height: '100%', objectFit: 'contain', ...customStyles }}
                ref={reactProPlayerRef}
                poster={poster}
                autoPlay={true}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {!loading && <p>loading...</p>}
            {loadingError && <p>error playing video</p>}

            {!loading && !loadingError && <div className='react-pro-player-controls'>
                <button className="fullscreen-button" onClick={handleFullScreen}>
                    {isFullScreen ? <MdFullscreen size={25} /> : <MdFullscreenExit size={25} />}
                </button>

                <button className="play-button" onClick={handlePlay}>
                    {isPlaying ? <BiPause size={25} /> : <BiPlay size={25} />}
                </button>

                <button className="play-button" onClick={() => handleForwardAndRewind("REWIND")}>
                    <MdReplay10 size={25} />
                </button>

                <button className="play-button" onClick={() => handleForwardAndRewind("FORWARD")}>
                    <MdOutlineForward10 size={25} />
                </button>

                <input
                    className="progress-bar"
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleProgress}
                />

                {qualities.length > 0 && (
                    <select value={selectedQuality} onChange={handleQualityChange}>
                        {qualities.map((quality, index) => (
                            <option key={index} value={index}>
                                {quality}
                            </option>
                        ))}
                    </select>
                )}
            </div>}
        </div>
    )
}

export default ReactProPlayer