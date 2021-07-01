import React from 'react';

import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  // React.useEffect(()=>{
  //   const jssStyles = document.querySelector('#jss-server-side');
  //   if(jssStyles){
  //     // Server Side Rendering の場合、スタイルを削除する
  //     jssStyles.parentElement?.removeChild(jssStyles);
  //   }
  // }, []);
  return <Component {...pageProps} />
}
export default MyApp
