import React, { useState, useEffect } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { loginUrl, getTokenFromUrl } from './spotifyConfig';

const spotifyApi = new SpotifyWebApi();

function SpotifyIntegration() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const spotifyToken = getTokenFromUrl().access_token;
        window.location.hash = "";

        if (spotifyToken) {
            setLoggedIn(true);
            spotifyApi.setAccessToken(spotifyToken);
            fetchPlaylists();
            getCurrentPlayback();
        }
    }, []);

    const login = () => {
        window.location = loginUrl;
    };

    const fetchPlaylists = async () => {
        try {
            const data = await spotifyApi.getUserPlaylists();
            setPlaylists(data.items);
        } catch (err) {
            setError("Failed to fetch playlists. Please try again.");
            console.error("Error fetching playlists:", err);
        }
    };

    const selectPlaylist = async (playlist) => {
        setSelectedPlaylist(playlist);
        try {
            const data = await spotifyApi.getPlaylistTracks(playlist.id);
            if (data.items.length > 0) {
                playTrack(data.items[0].track);
            }
        } catch (err) {
            setError("Failed to play the selected playlist. Please try again.");
            console.error("Error playing playlist:", err);
        }
    };

    const playTrack = async (track) => {
        try {
            await spotifyApi.play({ uris: [track.uri] });
            setCurrentTrack(track);
            setIsPlaying(true);
        } catch (err) {
            setError("Failed to play the track. Please try again.");
            console.error("Error playing track:", err);
        }
    };

    const togglePlayPause = async () => {
        try {
            if (isPlaying) {
                await spotifyApi.pause();
            } else {
                await spotifyApi.play();
            }
            setIsPlaying(!isPlaying);
        } catch (err) {
            setError("Failed to toggle play/pause. Please try again.");
            console.error("Error toggling play/pause:", err);
        }
    };

    const nextTrack = async () => {
        try {
            await spotifyApi.skipToNext();
            getCurrentPlayback();
        } catch (err) {
            setError("Failed to skip to the next track. Please try again.");
            console.error("Error skipping to next track:", err);
        }
    };

    const previousTrack = async () => {
        try {
            await spotifyApi.skipToPrevious();
            getCurrentPlayback();
        } catch (err) {
            setError("Failed to go to the previous track. Please try again.");
            console.error("Error going to previous track:", err);
        }
    };

    const getCurrentPlayback = async () => {
        try {
            const data = await spotifyApi.getMyCurrentPlaybackState();
            if (data) {
                setCurrentTrack(data.item);
                setIsPlaying(data.is_playing);
            }
        } catch (err) {
            console.error("Error getting current playback:", err);
        }
    };

    return (
        <div className="spotify-integration">
            {error && <div className="error-message">{error}</div>}
            {!loggedIn ? (
                <button onClick={login}>Login to Spotify</button>
            ) : (
                <>
                    <h3>Your Playlists</h3>
                    <ul className="playlist-list">
                        {playlists.map(playlist => (
                            <li key={playlist.id} onClick={() => selectPlaylist(playlist)}>
                                {playlist.name}
                            </li>
                        ))}
                    </ul>
                    {currentTrack && (
                        <div className="media-player">
                            <img
                                src={currentTrack.album.images[0]?.url}
                                alt={`${currentTrack.name} album cover`}
                                className="album-cover"
                            />
                            <p className="track-info">
                                {currentTrack.name} - {currentTrack.artists[0].name}
                            </p>
                            <div className="media-controls">
                                <button onClick={previousTrack}>Previous</button>
                                <button onClick={togglePlayPause}>
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>
                                <button onClick={nextTrack}>Next</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default SpotifyIntegration;