import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");
      const isApiRoute = nextUrl.pathname.startsWith("/api");
      const isStaticRoute =
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname.startsWith("/favicon.ico") ||
        nextUrl.pathname.includes(".");

      // Never block static assets
      if (isStaticRoute) {
        return true;
      }

      // Public API routes
      if (
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname.startsWith("/api/health")
      ) {
        return true;
      }

      // If user is logged in and trying to visit login/register, redirect to dashboard
      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // For protected pages, redirect unauthenticated users to /login
      if (!isLoggedIn) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
          callbackUrl += nextUrl.search;
        }
        return Response.redirect(
          new URL(
            `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
            nextUrl
          )
        );
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
        if (typeof token.image === "string") {
          session.user.image = token.image;
        }
      }
      return session;
    },
  },
  providers: [],
};
