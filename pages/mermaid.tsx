import { FC, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField';
import { Mermaid } from 'mermaid';

import LayoutComponent from '../components/LayoutComponent';


declare var mermaid:Mermaid;

const MermaidComponent: FC = () => {
    const router = useRouter();
    const [mermaidInput, setMermaidInput] = useState(`graph TD
      A --> B`);
    return (
        <LayoutComponent title="Mermaid" page="mermaid" content={
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    Mermaid.js
                </Grid>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={6}>
                            <TextField
                                id="mermaid-text"
                                label="Input Area"
                                fullWidth
                                multiline
                                variant="outlined"
                                value={mermaidInput}
                                onChange={(e) => {setMermaidInput(e.target.value); }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Button color="primary" variant="outlined" onClick={()=>{
                        // 再描画
                        let v = document.getElementById("mermaidOutput");
                        v?.removeAttribute('data-processed');
                        if(v){
                            v.innerHTML = mermaidInput;
                        }
                        // mermaid は初期化時に、class="mermaid" を処理してくれる。
                        // ボタン押下時にしたいので、クラスは外しておく。
                        // mermaid.init(".mermaid"); 
                        mermaid.init("#mermaidOutput");
                    }} >Run</Button>
                </Grid>
                <Grid item xs={12}>
                    <div id="mermaidOutput">
                    </div>
                </Grid>
                <Script src={router.basePath + "/scripts/mermaid/mermaid.min.js"} />
            </Grid>
        }/>
    );
}
export default MermaidComponent;