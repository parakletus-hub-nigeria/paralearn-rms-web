import {jwtDecode} from 'jwt-decode';

export function decodeToken(token:string): boolean {
    try {
        const decodedToken = jwtDecode(token)
        const exp = decodedToken.exp as number
        const currentTime = Date.now() / 1000
        return exp > currentTime
    }catch (error) {
        return false
    }
}

export function getDecodedTokenPayload(token: string): any {
    try {
        return jwtDecode(token);
    } catch (error) {
        return null;
    }
}