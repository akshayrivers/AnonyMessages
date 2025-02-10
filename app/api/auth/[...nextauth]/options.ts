import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any): Promise<any> {
        console.log("Authorize called with credentials:", credentials); // Log credentials

        await dbConnect();

        try {
            console.log("Querying user with identifier:", credentials.identifier); // Log identifier value
            const user = await UserModel.findOne({
              $or: [
                { email: credentials.identifier },
                { username: credentials.identifier }
              ]
            });
            

          if (!user) {
            console.error("User not found"); // Log if user is not found
            throw new Error("No user found");
          }

          if (!user.isVerified) {
            console.error("User not verified"); // Log if user is not verified
            throw new Error("User not verified");
          }

          // Compare passwords
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordCorrect) {
            console.error("Password incorrect"); // Log if password is incorrect
            throw new Error("Password incorrect");
          }

          console.log("Authentication successful, returning user:", user); // Log user data on successful authentication
          return user;
        } catch (error: any) {
          console.error("Error during authentication:", error); // Log any errors during authentication
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        //console.log("Session callback called, token data:", token); // Log token data

        session.user = {
          ...session.user,
          _id: token._id,
          isVerified: token.isVerified,
          isAcceptingMessages: token.isAcceptingMessages,
          username: token.username
        };

        //console.log("Session data after modification:", session); // Log modified session data
      }
      return session;
    },
    async jwt({ token, user }) {
      //console.log("JWT callback called, token data:", token); // Log incoming token data
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
        //console.log("JWT token after modification:", token); // Log modified token data
      }
      return token;
    }
  },
  pages: {
    signIn: "/sign-in"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.SECRET
};
