import { performTokenRefresh, readToken } from './token'

export async function getValidToken(): Promise<string | null> {
    const tokenData = await readToken()

    if (!tokenData) {
        console.error('No token found. Please authenticate first.')
        return null
    }

    // If the token has expired (or is about to expire in the next minute), refresh it
    if (
        tokenData.expiration_time &&
        tokenData.expiration_time < Date.now() + 60 * 1000
    ) {
        try {
            const refreshedTokenData = await performTokenRefresh(
                tokenData.refresh_token,
            )
            return refreshedTokenData.access_token
        } catch (err) {
            if (err instanceof Error) {
                console.error('Error refreshing token:', err.message)
                return null
            }

            throw new Error('Unknown error')
        }
    }

    return tokenData.access_token
}
