import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTokenFromUrl } from './spotifyConfig'

export function SpotifyCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        const spotifyToken = getTokenFromUrl().access_token
        if (spotifyToken) {
            // Store the token securely (e.g., in state management or secure storage)
            console.log('Spotify Token:', spotifyToken)

            // Clear the token from the URL
            window.history.pushState({}, null, '/')

            // Redirect to the main app
            navigate('/')
        }
    }, [navigate])

    return <div>Authenticating with Spotify...</div>
}

// Add this line to provide a default export
export default SpotifyCallback