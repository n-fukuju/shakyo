
import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Pagination from '@material-ui/lab/Pagination';

import Script from 'next/script';
import { useRouter } from 'next/router';

// import marked from 'marked';
import Markdown from 'markdown-to-jsx';

//TypeScript エラー回避用に宣言
/** ace.js */
declare var ace:any;
var editor:any;
var php:any;
declare var PHP:any;

interface Page{
    title:string;
    content:string;
}
interface Props{
    pages:Page[];
}
// ページコンテンツ生成
const generateContent = (content:string)=>{
    return (<Markdown>{content}</Markdown>);
};

const PhpEditorComponent: React.FC<Props> = (props)=>{
    const [beforeLoaded, setBeforeLoaded] = useState(true);
    let initTitle = (props.pages.length > 0)? props.pages[0].title: "title";
    let initContent = (props.pages.length > 0)? props.pages[0].content.replace(/\n/g, '<br/>'): "content";
    const [title, setTitle] = useState(initTitle);
    const [content, setContent] = useState<JSX.Element>( (props.pages.length>0)? generateContent(props.pages[0].content): (<></>) );
    const [buttonText, setButtonText] = useState("loading...");
    const [output, setOutput] = useState("");
    const router = useRouter();

    // ページ切り替え
    const handlePageChange = (page:number)=>{
        if(page > 0 && page <= props.pages.length){
            page--;
            setTitle(props.pages[page].title);
            setContent(generateContent(props.pages[page].content));
        }
    };

    return (
        <Grid container spacing={2} style={{padding:10}}>
            <Grid item xs={6}>
                <Typography variant="h5" component="h1">{title}</Typography>
                {content}
                <Divider/>
                <Pagination count={props.pages.length} variant="outlined" color="primary" onChange={(_e, value)=>{handlePageChange(value); }} />
            </Grid>
            <Grid item xs={6}>
                <Grid container>
                    <Grid item xs={2}>
                        <Button id="button" disabled={beforeLoaded} variant="outlined" color="primary">{buttonText}</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <div id="outer-editor" style={{height:"55vh", flex:"1 1 auto", position:"relative", border:"2px solid #bbb"}}>
                            <div id="editor" style={{position:"absolute" ,top:0,right:0,bottom:0,left:0}}></div>
                        </div>
                        <Script src={router.basePath + "/scripts/ace/ace.js"} onLoad={()=>{
                            editor = ace.edit("editor");
                            editor.setTheme("ace/theme/github");
                            editor.session.setMode("ace/mode/php");
                        }}/>
                        <Script src={router.basePath + "/scripts/pib/php-web.js"} onLoad={async()=>{
                            php = await PHP({postRun:()=>{
                                setBeforeLoaded(false);
                                setButtonText('実行');
                                var button = document.getElementById('button');
                                button?.addEventListener('click', ()=>{
                                    setOutput('');
                                    var code = editor.getValue();
                                    code = code.replace(/^\s*<\?php/, "") // remove <?php
                                    // set code in here document
                                    // PHP はトップレベルのコードの文法エラーはキャッチできないため、evalで実行する。
                                    // ヒアドキュメント内の変数を展開させないようシングルクォートで囲む。
                                    code = `
try{
    $code = <<<'EOT'
    ${code}
EOT;
    eval($code);
}catch(ParseError $e){ echo $e; }`;
                                    code = code + "\necho PHP_EOL;" // flush line buffer
                                    // console.log(code);
                                    try{
                                        let ret = php.ccall('pib_run', 'number', ['string'], [code]);
                                        if(ret != 0){
                                            console.log('error from php.ccall: ', ret);
                                            let message = `error: ${ret}`;
                                            setOutput( prevText => prevText + message + "\n" );
                                        }
                                    }catch(ex){
                                        console.log('error: ', ex);
                                    }
                                });
                            },
                                print: (...chunks:any[])=>{
                                    if(chunks.length == 1 && chunks[0] == ""){ return; }
                                    let message = chunks.join("");
                                    setOutput( prevText => prevText + message + "\n" );
                                },
                                printErr: (...chunks:any[])=>{
                                    if(chunks.length == 1 && chunks[0] == ""){ return; }
                                    let message = chunks.join("");
                                    setOutput( prevText => prevText + message + "\n" );
                                }
                            }).then((p:any)=>{
                                p.ccall('pib_init', 'number', ['string'], []);
                                return p;
                            }).catch((err:any) => console.error(err));
                        }}/>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>出力</Typography>
                        <Divider/>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper>
                            <TextField multiline fullWidth disabled value={output}/>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}
export default PhpEditorComponent;