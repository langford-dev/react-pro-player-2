import React, { FC, useEffect, useRef, useState } from 'react'
import { SUPPORTED_MIME_TYPES } from '../constants'
import { TReactProPlayer, THTMLVideoElement } from '../types'
import Hls from 'hls.js'

const ReactProPlayer: FC<TReactProPlayer> = ({ src, poster }) => {
    const reactProPlayerRef = useRef<THTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [qualities, setQualities] = useState<number[]>([])
    const [selectedQuality, setSelectedQuality] = useState<number>(720)

    useEffect(() => {
        onLoadReactProPlayer()
    }, [src])

    useEffect(() => {
        trackPlayerPlayState()
    }, [isPlaying])

    function onLoadReactProPlayer() {
        if (!reactProPlayerRef.current) {
            console.error('Error setting up video. Could not fetch video ref. Refresh page')
            return
        }

        if (Hls.isSupported()) {
            const hls = new Hls()

            reactProPlayerRef.current.hls = hls

            hls.loadSource(src)
            hls.attachMedia(reactProPlayerRef.current)
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setQualities(hls.levels.map((level) => level.height))
                setSelectedQuality(hls.levels.length - 1)
                setIsPlaying(true)
            })
        } else if (reactProPlayerRef.current.canPlayType(SUPPORTED_MIME_TYPES[0])) {
            reactProPlayerRef.current.src = src
            setIsPlaying(true)
        }
    }

    function trackPlayerPlayState() {
        if (!reactProPlayerRef.current) {
            console.error('Error setting up video. Could not fetch video ref. Refresh page')
            return
        }

        if (isPlaying) reactProPlayerRef.current.play()
        else reactProPlayerRef.current.pause()
    }

    const handleQualityChange = (event: any) => {
        const newQuality = parseInt(event.target.value)
        setSelectedQuality(newQuality)
        const video = reactProPlayerRef.current

        if (!video) {
            console.error('Error setting up video. Could not fetch video ref. Refresh page')
            return
        }

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const hls = video.hls

            if (hls && hls.levels[newQuality]) {
                hls.currentLevel = newQuality
            }
        }
    }

    return (
        <div>
            <video
                width='600'
                height='600'
                ref={reactProPlayerRef}
                poster={poster}
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            {qualities.length > 0 && (
                <select value={selectedQuality} onChange={handleQualityChange}>
                    {qualities.map((quality, index) => (
                        <option key={index} value={index}>
                            {quality}p
                        </option>
                    ))}
                </select>
            )}
        </div>
    )
}

export default ReactProPlayer