import { FC, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Button from '@material-ui/core/Button';
import Grid, { GridSpacing } from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import LayoutComponent from '../components/LayoutComponent';

//TypeScript エラー回避用に宣言
/** ace.js */
declare var ace:any;
var editor:any;
var php:any;
declare var PHP:any;

/** PHPページ */
const PhpComponent: FC=()=>{
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [buttonText, setButtonText] = useState("loading...");
    const [outText, setOutText] = useState("");
    const [hasError, setHasError] = useState(false);
    const router = useRouter();
    return (
        <LayoutComponent title="Php" page="php" content={<>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <p>Php</p>
                    <ul>
                        <li>PHP-7.4.20</li>
                    </ul>
                </Grid>
                <Grid item xs={12}>
                    <div id="outer-editor" style={{height:"55vh", flex:"1 1 auto", position:"relative", border:"2px solid #bbb"}}>``
                        <div id="editor" style={{position:"absolute" ,top:0,right:0,bottom:0,left:0}}></div>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div>
                        <Button id="button" disabled={buttonDisabled} variant="outlined" color="primary">{buttonText}</Button>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <TextField multiline fullWidth disabled error={hasError} label="output" variant="outlined" value={outText} />
                </Grid>

                <Script src={router.basePath + "/scripts/ace/ace.js"} onLoad={()=>{
                    editor = ace.edit("editor");
                    editor.setTheme("ace/theme/github");
                    editor.session.setMode("ace/mode/php");

                    editor.setShowPrintMargin(false);
                    editor.setValue("<?php\necho 'xyz';\n");
                }}/>
            
                <Script src={router.basePath + "/scripts/pib/php-web.js"} onLoad={async()=>{
                    // console.log('php-web.js loaded.');
                    php = await PHP({postRun:()=>{
                        // console.log('php.postRun.');
                        setButtonDisabled(false);
                        setButtonText('Run');
                        var button = document.getElementById('button');
                        button?.addEventListener('click', ()=>{
                            // console.log('button click');
                            // console.log('php: ', php);
                            setOutText('');
                            var code = editor.getValue();
                            code = code.replace(/^\s*<\?php/, "") // remove <?php
                            code = code + "\necho PHP_EOL;" // flush line buffer
                            try{
                                let ret = php.ccall('pib_run', 'number', ['string'], [code]);
                                if(ret != 0){
                                    console.log('error from php.ccall: ', ret);
                                    setOutText( `error: ${ret}` );
                                    setHasError(true);
                                }
                            }catch(ex){
                                console.log('error: ', ex);
                            }
                        });
                    },
                        print: (...chunks:any[])=>{
                            if(chunks.length == 1 && chunks[0] == ""){ return; }
                            let message = chunks.join("");
                            setOutText( prevText => prevText + message + "\n" );
                            setHasError(false);
                            // console.log('chunks: ', chunks);
                        },
                        printErr: (...chunks:any[])=>{
                            if(chunks.length == 1 && chunks[0] == ""){ return; }
                            let message = chunks.join("");
                            setOutText( prevText => prevText + message + "\n" );
                            setHasError(true);
                            // console.error('chunks: ', chunks);
                        }
                    }).then((p:any)=>{
                        // console.log('pib_init');
                        p.ccall('pib_init', 'number', ['string'], []);
                        return p;
                    }).catch((err:any) => console.error(err));
                }}/>
            </Grid>
        </>}/>
    );
}
export default PhpComponent;