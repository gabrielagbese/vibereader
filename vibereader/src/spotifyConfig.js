const authEndpoint = "https://accounts.spotify.com/authorize"
const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '189b2712d81a4946bdbed0a037174d57'
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback'
const scopes = [
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-modify-playback-state",
    "playlist-read-private",
]

export const loginUrl = `${authEndpoint}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(" "))}&response_type=token&show_dialog=true`

export const getTokenFromUrl = () => {
    return window.location.hash
        .substring(1)
        .split('&')
        .reduce((initial, item) => {
            let parts = item.split('=')
            initial[parts[0]] = decodeURIComponent(parts[1])
            return initial
        }, {})
}