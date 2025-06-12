import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
	interface Session {
		accessToken: string
		refreshToken: string
		accessTokenExpires: number
        error: string | undefined
	}

	interface User {
		accessToken: string
		refreshToken: string
		accessTokenExpires: number
        expiresIn: number
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken: string
		refreshToken: string
		accessTokenExpires: number
	}
}