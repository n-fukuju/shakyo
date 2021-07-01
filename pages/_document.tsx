import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheets } from '@material-ui/styles';

class CustomDocument extends Document {
    static async getInitialProps (ctx:any){
        const sheets = new ServerStyleSheets();
        const originalRenderPage = ctx.renderPage;
        ctx.renderPage = () => 
            originalRenderPage({
                enhanceApp: (App:any) => (props:any) => sheets.collect(<App {...props} />),
            });
        const initialProps = await Document.getInitialProps(ctx);
        return {
            ...initialProps,
            // styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
            styles: [
                <React.Fragment key="styles">
                    {initialProps.styles}
                    {sheets.getStyleElement()}
                </React.Fragment>
            ]
        };
    }
    render(){
        return(
            <Html lang="ja">
                <Head>
                    <meta charSet="utf-8" />
                    <style jsx global>
                        {`
                            html, body { height:100%, width:100% }
                            *, *:after, *:before { box-sizing: border-box }
                            body { margin :0 }
                        `}
                    </style>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
export default CustomDocument;