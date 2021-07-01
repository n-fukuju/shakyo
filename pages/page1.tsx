import Script from 'next/script';
import { useRouter } from 'next/router';
import LayoutComponent from '../components/LayoutComponent';

/** TypeScript エラー回避用 */
declare var ace:any;

export default function Page1(){
    const router = useRouter();
    return (
    <LayoutComponent title="page1" page="page1" content={<>
        <p>page1 content</p>
        <div id="outer-editor" style={{height:"70vh", flex:"1 1 auto", position:"relative", border:"2px solid #bbb"}}>
            <div id="editor" style={{position:"absolute" ,top:0,right:0,bottom:0,left:0}}></div>
        </div>
        <Script src={router.basePath + "/scripts/ace/ace.js"} onLoad={()=>{
            var editor = ace.edit("editor");
            editor.setTheme("ace/theme/github");
            editor.session.setMode("ace/mode/php");

            editor.setShowPrintMargin(false);
            editor.setValue("<?php\nphpinfo();\n");
        }}/>
    </>}/>
    )
}