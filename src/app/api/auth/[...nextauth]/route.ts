
import NextAuth, { NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const backend = process.env.BACKEND_URL ?? "http://localhost:3001";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          const resp = await axios.post(`${backend}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          if (resp.data) {
            const { token, user } = resp.data;
            if (token && user) {
              return {
                id: user.id,
                name: user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email,
                email: user.email,
                role: user.roles && user.roles.length > 0 ? user.roles[0].name : null,
                accessToken: token,
              };
            }
          }
          return null;
        } catch (err) {
          console.error("Credentials authorize error:", err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/signin" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
