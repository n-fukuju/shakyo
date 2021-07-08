import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Button from '@material-ui/core/Button';
import LayoutComponent from '../components/LayoutComponent';

/** TypeScript エラー回避用 */
declare var ace:any;
var editor:any;
var php:any;
declare var PHP:any;

export default function Page1(){
    const [buttonDisabled, setDisabled] = useState(true);
    const router = useRouter();
    return (
    <LayoutComponent title="page1" page="page1" content={<>
        <p>page1 content</p>
        <div>
            <Button id="button" disabled={buttonDisabled} variant="outlined">button</Button>
        </div>
        <div id="outer-editor" style={{height:"70vh", flex:"1 1 auto", position:"relative", border:"2px solid #bbb"}}>``
            <div id="editor" style={{position:"absolute" ,top:0,right:0,bottom:0,left:0}}></div>
        </div>
        <Script src={router.basePath + "/scripts/ace/ace.js"} onLoad={()=>{
            editor = ace.edit("editor");
            editor.setTheme("ace/theme/github");
            editor.session.setMode("ace/mode/php");

            editor.setShowPrintMargin(false);
            // editor.setValue("<?php\nphpinfo();\n");
            editor.setValue("<?php\necho 'xyz';\n");
        }}/>
        <Script src={router.basePath + "/scripts/pib/php.js"} onLoad={()=>{
            // handleLoad
            console.log('handleLoad: ');
            php = PHP({postRun:()=>{
                console.log('init:');
                setDisabled(false);
                var button = document.getElementById('button');
                button?.addEventListener('click', ()=>{
                    console.log('button click: ');
                    console.log('php: ', php);
                    var code = editor.getValue();
                    code = code.replace(/^\s*<\?php/, "") // remove <?php
                    code = code + "\necho PHP_EOL;" // flush line buffer
                    let ret = php.ccall('pib_eval', 'number', ["string"], [code])
                    if(ret != 0){ console.log('error from php.ccall: ', ret); }
                });
            }});
            console.log('php: ', php);
        }}/>
    </>}/>
    )
}