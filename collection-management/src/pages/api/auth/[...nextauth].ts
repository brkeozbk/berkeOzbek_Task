import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import * as https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

let refreshPromise: Promise<any> | null = null;

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/Auth/Login`,
            {
              username: credentials.username,
              password: credentials.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              baseURL: process.env.NEXT_PUBLIC_API_URL,
              httpsAgent,
            }
          );

          const userData = response.data.data;

          if (userData?.accessToken) {
            return {
              username: credentials.username,      // Kullanıcı adını da döndür
              accessToken: userData.accessToken,
              refreshToken: userData.refreshToken,
              expiresIn: userData.expiresIn,
              refreshExpiresIn: userData.refreshExpiresIn,
            };
          } else {
            throw new Error("Token bulunamadı");
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            console.error("Login error response data:", error.response.data);
          } else {
            console.error("Login error:", error);
          }
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          username: user.username,             // username token içine ekle
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + (user.expiresIn || 0) * 1000,
        };
      }

      // Token geçerliyse return et
      if (Date.now() < (token.accessTokenExpires || 0)) {
        return token;
      }

      // Token süresi dolmuş, refresh et
      if (refreshPromise) {
        return await refreshPromise;
      }

      refreshPromise = (async () => {
        try {
          const response = await axios.post(
            "/Auth/RefreshTokenLogin",
            {},
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.refreshToken}`,
              },
              baseURL: process.env.NEXT_PUBLIC_API_URL,
              httpsAgent,
            }
          );

          const refreshed = response.data.data;

          refreshPromise = null;

          return {
            ...token,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken || token.refreshToken,
            accessTokenExpires: Date.now() + (refreshed.expiresIn || 0) * 1000,
          };
        } catch (error) {
          console.error("Error refreshing token", error);
          refreshPromise = null;

          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      })();

      return await refreshPromise;
    },

    async session({ session, token }) {
      session.user = session.user || {};
      session.user.username = token.username;  // session user içine username ekle
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
  },
};

export default NextAuth(authOptions);
