
import 'normalize.css';
import '@cloudscape-design/global-styles/index.css';
import {SessionProvider} from "next-auth/react"
import Head from 'next/head';

import React from 'react'

// if (typeof window === 'undefined') React.useLayoutEffect = () => {}

export default function App({ Component, pageProps: { session, ...pageProps }}) {
  return (
    <>
      <Head>
          <title>AnyCompany Webshop</title>
      </Head>
      <SessionProvider session={session}>
          <Component {...pageProps} />
      </SessionProvider>
    </>
  )
}
