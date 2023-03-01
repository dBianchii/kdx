import NextAuth from "next-auth";
import { authOptions } from "server/server/auth";

export default NextAuth(authOptions);
