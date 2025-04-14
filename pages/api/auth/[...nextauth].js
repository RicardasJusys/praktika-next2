import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "El. paštas", type: "text" },
        password: { label: "Slaptažodis", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user) {
          throw new Error("Neteisingas el. paštas arba slaptažodis");
        }
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Neteisingas el. paštas arba slaptažodis");
        }
        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      await dbConnect();

      // For Google provider, create user if not exist and block if already registered via credentials
      if (user && account?.provider === 'google') {
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          // Create new Google user in database
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            password: '', // No password for Google users
            role: 'user',
            credits: 0,
          });
        } else if (dbUser.password) {
          console.warn(`Google login blocked: ${user.email} is already registered with a password.`);
          return token;
        }
        token.id = dbUser._id;
        token.role = dbUser.role;
        token.email = dbUser.email;
      }

      // For existing token-based sessions (from credentials)
      if (!token.id && token.email) {
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      await dbConnect();
      const dbUser = await User.findOne({ _id: token.id });
      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.role = dbUser.role;
        session.user.credits = dbUser.credits || 0;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Export the NextAuth handler using the config
export default NextAuth(authOptions);
