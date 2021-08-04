import { FC, useState } from 'react';
import Link from 'next/link';
import Box from '@material-ui/core/Box';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import { Mermaid } from 'mermaid';

import LayoutComponent from '../components/LayoutComponent';
import { MenuHead } from '../modules/Commentary';
import { StylesContext } from '@material-ui/styles';

const texts: MenuHead[] = [
    {
        id: "1", label: "フロー図", children: [
            {
                id: "1", label: "基本",
                content: String.raw`
                フローチャートは主にノードとラインで構成されます。
                ノードIDを記載すると、ボックス内にノードIDが表示されます。
                ノードIDの代わりにテキストを表示したい場合、ノードIDの後ろに [ ] で指定します。
                （'end'は予約語のため、ノードIDに使用しないでください）`,
                sample: String.raw`
                graph TD
                  Start
                  Stop[end of chart]
                  Start --> Stop`,
                questions:[]
            },
            {
                id: "2", label: "方向",
                content: String.raw`
                フローチャートで指定できる方向は以下の通りです:
                * TB - Top to Bottom
                * TD - Top to Down (same as TB)
                * BT - Bottom to Top
                * RL - Right to Left
                * LR - Left to Right`,
                sample: String.raw`
                graph LR
                  Start --> Stop`,
                questions:[]
            },
            {
                id: "3", label: "図形",
                content: String.raw``,
                sample: String.raw`
                graph TD
                  id1(Round edges)
                  id1---id2([stadium-shaped])
                  id2---id3[[Subroutine]]
                  id3---id4[(Database)]
                  id4---id5((Circle))
                  id5---id6>Asymmetric]
                  id6---id7{Rhombus}
                  id7---id8{{Hexagon}}
                  id8---id9[/Parallelogram/]
                  id9---id10[\Parallelogram alt\]
                  id10---id11[/Trapezoid\]
                  id11---id12[\Trapezoid alt/]`,
                questions:[]
            },
            {
                id: "4", label: "リンク",
                content: String.raw`
                ノードを接続するリンクは、矢印の形状を変更することができます。
                また、リンク上に、テキストを添付できます。`,
                sample: String.raw`
                graph LR
                  id1[Arrow head] --> id1_2[end]
                  id2[Open link] --- id2_2[end]
                  id3[Text on links] -- text --- id3_2[end]
                  id4[Text on links2] ---|text| id4_2[end]
                  id5[Dotted] -.-> id5_2[end]
                  id6[Dotted with text] -. text .-> id6_2[end]
                  id7[Thick link] ==> id7_2[end]
                  id8[one line] --> id8_2 --> id8_3`,
                questions:[]
            },
            {
                id: "5", label: "リンクの連鎖",
                content: String.raw`
                一行で複数のリンクを表現することができます。
                `,
                sample: String.raw`
                graph LR
                A -- text --> B -- text2 --> C
                a --> b & c --> d
                e & f --> g & h`,
                questions:[]
            },
            {
                id: "6", label: "flowchart",
                content: String.raw`
                graph の代わりに flowchart を宣言すると、以下の矢印タイプと、双方向の矢印が使用できます。`,
                sample: String.raw`
                flowchart LR
                A --o B
                B --x C
                a <--> b
                `,
                questions:[]
            },
            {
                id: "7", label: "リンクの最小の長さ",
                content: String.raw`（未）`,
                sample: String.raw`
                graph TD
                A[Start] --> B{Is it?};
                B -->|Yes| C[OK];
                C --> D[Rethink];
                D --> B;
                B ---->|No| E[End];
                `,
                questions:[]
            },
            {
                id: "8", label: "エスケープ",
                content: String.raw`
                構文エラーが出るようなテキストを含む場合は、テキストを引用符で囲みます。`,
                sample: String.raw`
                graph LR
                id1["This is the (text) in the box"]
                A["A double quote:#quot;"] -->B["A dec char:#9829;"]
                `,
                questions:[]
            },
            {
                id: "9", label: "サブグラフ",
                content: String.raw``,
                sample: String.raw`
                graph TB
                c1-->a2
                subgraph one
                a1-->a2
                end
                subgraph two
                b1-->b2
                end
                subgraph three
                c1-->c2
                end
                `,
                questions:[]
            },
            {
                id: "", label: "",
                content: String.raw``,
                sample: String.raw``,
                questions:[]
            },
        ]
    },
    {
        id: "2", label: "シーケンス図", children: []
    },
    {
        id: "3", label: "クラス図", children: []
    },
    {
        id: "4", label: "状態遷移図", children: []
    },
]

declare var mermaid:Mermaid;
const mermaidOutputId = "mermaidOutput";
const mermaidSampleId = "mermaidSample";

const MermaidComponent: FC = () => {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [text, setText] = useState<JSX.Element>();
    const [uml, setUml] = useState<JSX.Element>();
    const [diagram, setDiagram] = useState<JSX.Element>();
    const [mermaidInput, setMermaidInput] = useState(`graph TD
    id0((start)) --> id1[branchを作成する]
    id1 --> id2[変更をcommit,push]
    id2 --> id3[Githubで<br/>プルリクエストの作成を開始する]
    id3 --> id4{対象は<br/>デフォルトの<br/>ブランチ}
    id4 --Yes--> id5["タイトルと説明を入力し、<br/>プルリクエストを作成する"]
    id4 --No--> id4_2[ブランチを指定する]
    id4_2 --> id5
    id5 --> id6{レビュー有無}
    id6 --なし--> id7[merge]
    id7 --> id8[branchを削除する]
    id8 --> id9((end))
    id6 --あり--> id6_2[レビュアーを指定する]
    id6_2 --> id6_3{承認待ち}
    id6_3 --承認--> id7
    id6_3 --指摘あり--> id6_3_2[指摘点の対応]
    id6_3_2 --> id6_3`);
    // 実行ボタン
    const handleExecute = ()=>{
        let v = document.getElementById(mermaidOutputId);
        v?.removeAttribute('data-processed');
        if(v){
            v.innerHTML = mermaidInput;
        }
        mermaid.init(`#${mermaidOutputId}`);
        // mermaid は初期化時に、class="mermaid" を処理してくれる。
        // 今回はボタン押下時の実施としたいので、クラスは外しておく。
        // mermaid.init(".mermaid");
    }
    /** ツリーアイテムの選択 */
    const handleTreeItemClick = (nodeId: string)=>{
        const nodes = nodeId.split('_');
        if(nodes.length < 2){ return; }

        for(let head of texts){
            for(let item of head.children){
                if (head.id == nodes[0] && item.id == nodes[1]){
                    setText(<>
                        {item.content.split('\n').map( (line, index) => { return (<Typography variant="body2" key={index}>{line}</Typography>)})}
                    </>);
                    setUml(<>
                        {item.sample.split('\n').map( (line, index) => { return (<Typography variant="body2" key={index}>{line}</Typography>)})}
                    </>)
                    let v = document.getElementById(mermaidSampleId);
                    v?.removeAttribute('data-processed');
                    if(item.sample !== ""){
                        // サンプルをセットし、mermaid更新するJavaScript
                        if(v){ v.innerHTML = item.sample; }
                        mermaid.init(`#${mermaidSampleId}`)
                    }
                    return;
                }
            }
        }
    }
    return (
        <LayoutComponent title="Mermaid" page="mermaid" content={
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    Mermaid.js (<Link href="https://mermaid-js.github.io/mermaid/#/">mermaid-js.github.io</Link>)
                    <Box display={(!expanded)?'inline':'none'}><IconButton onClick={()=>{setExpanded(true);}}><ExpandMoreIcon/></IconButton></Box>
                    <Box display={(expanded)?'inline':'none'}><IconButton onClick={()=>{setExpanded(false);}}><ExpandLessIcon/></IconButton></Box>
                </Grid>
                <Grid item xs={12}>
                    <Collapse in={expanded}>
                        <Paper>
                            <Grid container spacing={2}>
                                {/* メニュー */}
                                <Grid item xs={3}>
                                    <TreeView defaultCollapseIcon={<ExpandMoreIcon/>} defaultExpandIcon={<ChevronRightIcon/>}>
                                        {texts.map(item =>(
                                            <TreeItem nodeId={item.id} label={item.label} key={item.id}>
                                                {item.children.map(child=>(
                                                    <TreeItem nodeId={`${item.id}_${child.id}`} label={child.label} key={`${item.id}_${child.id}`} onLabelClick={() => { handleTreeItemClick(`${item.id}_${child.id}`) }} />
                                                ))}
                                            </TreeItem>
                                        ))}
                                    </TreeView>
                                </Grid>
                                {/* テキスト */}
                                <Grid item xs={9}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>{text}</Grid>
                                        <Grid item xs={6}><Paper elevation={3} style={{padding:7}}>{uml}</Paper></Grid>
                                        <Grid item xs={6}><div id={mermaidSampleId}></div></Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Collapse>
                </Grid>
                <Grid item xs={12}>
                    <Button color="primary" variant="outlined" onClick={handleExecute} >Run</Button>
                </Grid>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={5}>
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
                        <Grid item xs={7}>
                    <div id={mermaidOutputId}></div>
                        </Grid>
                    </Grid>
                </Grid>
                <Script src={router.basePath + "/scripts/mermaid/mermaid.min.js"} />
            </Grid>
        }/>
    );
}
export default MermaidComponent;