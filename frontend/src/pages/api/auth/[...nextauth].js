import NextAuth from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"

export const authOptions = {
    providers: [
        CognitoProvider({
            clientId: process.env.COGNITO_CLIENT_ID,
            clientSecret: process.env.COGNITO_CLIENT_SECRET,
            issuer: process.env.COGNITO_ISSUER,
            region: process.env.REGION,
            idToken: true,
            scope: 'openid profile email aws.cognito.signin.user.admin',
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (account) {
              if (account['provider'] === 'cognito') {
                token.accessToken = account?.access_token;
                token.id_token = account?.id_token;
              } 
              if (user) {
                token.id = user?.id;
              }
            }
            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.id_token = token.id_token;
            session.refreshToken = token.refreshToken;
            session.accessTokenExpires = token.accessTokenExpires;
            return session
          },
    }
}

export default NextAuth(authOptions)