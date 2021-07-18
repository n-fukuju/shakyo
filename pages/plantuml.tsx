import { FC, MouseEvent, useState } from 'react';
import Link from 'next/link';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem'
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HelpOutline from '@material-ui/icons/HelpOutline';
import Popover from '@material-ui/core/Popover';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import plantUmlEncoder from 'plantuml-encoder'

import LayoutComponent from '../components/LayoutComponent';

const urlbase = "http://www.plantuml.com/plantuml/img/";

/** ツリービュー項目 */
interface TextHead {
    /** 見出しID */
    id: string;
    /** 見出しテキスト */
    label: string;
    /** 詳細メニュー */
    children: Text[];
}
/** ツリービュー詳細項目 */
interface Text {
    /** 詳細ID */
    id: string;
    /** 詳細テキスト */
    label: string;
    /** 詳細コンテンツ */
    content: string;
    /** サンプルUMLコード */
    sample: string;
    /** 例題コレクション */
    questions: string[];
}
const texts: TextHead[] = [
    {
        label: "シーケンス図", id: "1", children: [
            {
                id: "1", label: "基本的な例",
                content: `
                シーケンス '->' を、2つの分類子間のメッセージを描画するために使います。分類子を、明示的に宣言する必要はありません。
                点線の矢印を使う場合は、'-->' とします。
                また、 '<-' や、 '<--' を使うこともできます。これらによって図の見た目が変わることはありませんが、可読性を高めることができます。
                ただし、以上の方法はシーケンス図だけに当てはまります。ほかの種類の図には当てはまりません。`,
                sample: `
                @startuml
                Alice -> Bob: Authentication Request
                Bob --> Alice: Authentication Response
                
                Alice -> Bob: Another authentication Request
                Alice <-- Bob: another authentication Response
                @enduml`,
                questions: ['A->B:send()']
            },
            {
                id: "2", label: "分類子の宣言",
                content: `
                キーワードparticipantを使って分類詞を宣言すると、分類子の表示を調整することができます。
                宣言した順序が、デフォルトの表示順になります。
                分類子の宣言に別のキーワードを使用すると、分類子の形を変えることができます。`,
                sample: `
                @startuml
                participant participant as Foo
                actor       actor       as Foo1
                boundary    boundary    as Foo2
                control     control     as Foo3
                entity      entity      as Foo4
                database    database    as Foo5
                collections collections as Foo6
                queue       queue       as Foo7
                Foo -> Foo1 : To actor 
                Foo -> Foo2 : To boundary
                Foo -> Foo3 : To control
                Foo -> Foo4 : To entity
                Foo -> Foo5 : To database
                Foo -> Foo6 : To collections
                Foo -> Foo7: To queue
                @enduml`,
                questions: ['participant p']
            },
            {
                id: "3", label: "別名",
                content: `
                キーワード as を使って、分類子の名前を変更することができます。
                アクターや分類子の背景色を、HTML コードや色名を使って変更することもできます。`,
                sample: `
                @startuml
                actor Bob #red
                ' The only difference between actor
                'and participant is the drawing
                participant Alice
                participant "I have a really long name" as L #99FF99
                /' You can also declare:
                   participant L as "I have a really long name"  #99FF99
                  '/
                
                Alice->Bob: Authentication Request
                Bob->Alice: Authentication Response
                Bob->L: Log transaction
                @enduml`, 
                questions: [] 
            },
            {id:"4", label: "分類子のorder (x)", content: ``, sample: ``, questions: []},
            {id:"5", label: "別名2 (x)", content: ``, sample: ``, questions: []},
            {id:"6", label: "自分自身へのメッセージ (x)", content: ``, sample: ``, questions: []},
            {id:"7", label: "Text alignment (x)", content: ``, sample: ``, questions: []},
            {id:"8", label: "矢印の見た目 (x)", content: ``, sample: ``, questions: []},
            {id:"9", label: "矢印の色 (x)", content: ``, sample: ``, questions: []},
            {id:"10", label: "メッセージシーケンスの番号付け (x)", content: ``, sample: ``, questions: []},
            {id:"11", label: "タイトル (x)", content: ``, sample: ``, questions: []},
        ]
    },
    {
        label: "ユースケース図", id: "2", children: [
            {
                id: "1", label: "基本", 
                content: `
                ユースケースは丸括弧で囲んで使います(丸括弧の対は 楕円に似ているからです)。
                usecase キーワードを使ってユースケースを定義することもできます。 as キーワードを使ってエイリアスを定義することもできます。このエイリアスは あとで、ユースケースの関係を定義するために使います。`,
                sample: `
                @startuml

                (First usecase)
                (Another usecase) as (UC2)
                usecase UC3
                usecase (Last usecase) as UC4
                
                @enduml`,
                questions: [] },
            {id: "2", label: "アクター (x)", content: ``, sample: ``, questions: []},
        ]
    },
    {
        label: "クラス図 (x)", id: "3", children: []
    },
    {
        label: "オブジェクト図 (x)", id: "4", children: []
    },
    {
        label: "アクティビティ図 (x)", id: "5", children: []
    },
    {
        label: "コンポーネント図", id: "6", children: [
            {
                id: "1", label: "基本",
                content: `
                コンポーネントは括弧でくくります。
                また、 component キーワードでもコンポーネントを定義できます。 そして、コンポーネントには as キーワードにより別名をつけることができます。 この別名は、後でリレーションを定義するときに使えます。`,
                sample: `
                @startuml

                [First component]
                [Another component] as Comp2
                component Comp3
                component [Last component] as Comp4
                
                @enduml`,
                questions: []
            },
            {
                id: "2", label: "インタフェース",
                content: `
                インタフェースは丸括弧 () でシンボルを囲うことで定義できます。 (何故なら見た目が丸いからです。)
                もちろん interface キーワードを使って定義することもできます。 as キーワードでエイリアスを定義できます。 このエイリアスは後で、関係を定義する時に使えます。
                後で説明されますが、インタフェースの定義は省略可能です。`,
                sample: `
                @startuml
                
                () "First Interface"
                () "Another interface" as Interf2
                interface Interf3
                interface "Last interface" as Interf4
                
                [component]
                footer //Adding "component" to force diagram to be a **component diagram**//
                @enduml`,
                questions: []
            },
            {
                id: "3", label: "要素感の関係",
                content: `要素間の関係は、破線 (..)、直線 (--), 矢印 (-->) の組合せで構成されます。`,
                sample: `
                @startuml
                
                DataAccess - [First Component]
                [First Component] ..> HTTP : use
                
                @enduml`,
                questions: []
            },
            {
                id: "4", label: "ノート",
                content: `オブジェクトに関連のあるノートを作成するにはnote left of 、note right of 、note top of 、 note bottom of キーワードを使います。 note left of , note right of , note top of , note bottom of
                または note キーワードを使ってノートを作成し、.. 記号を使ってオブジェクトに紐づけること ができます。`,
                sample: `
                @startuml
                
                interface "Data Access" as DA
                
                DA - [First Component]
                [First Component] ..> HTTP : use
                
                note left of HTTP : Web Service only
                
                note right of [First Component]
                  A note can also
                  be on several lines
                end note
                
                @enduml`,
                questions: []
            },
            {
                id: "5", label: "グループ化",
                content: `
                いくつかのキーワードをグループコンポーネントやインタフェースに使用することができます：
                * package
                * node
                * folder
                * frame
                * cloud
                * database`,
                sample: `
                @startuml

                package "Some Group" {
                HTTP - [First Component]
                [Another Component]
                }

                node "Other Groups" {
                FTP - [Second Component]
                [First Component] --> FTP
                }

                cloud {
                [Example 1]
                }


                database "MySql" {
                folder "This is my folder" {
                    [Folder 3]
                }
                frame "Foo" {
                    [Frame 4]
                }
                }


                [Another Component] --> [Example 1]
                [Example 1] --> [Folder 3]
                [Folder 3] --> [Frame 4]

                @enduml`,
                questions: []
            },
            {
                id: "6", label: "矢印の方向 (x)",
                content: ``,
                sample: ``,
                questions: []
            },
        ]
    },
    {
        label: "配置図 (x)", id: "7", children: []
    },
    {
        label: "状態遷移図（ステートマシン図） (x)", id: "8", children: []
    },
    {
        label: "タイミング図 (x)", id: "9", children: []
    },
];
interface Help{
    head:string;
    text:string;
    ref:any;
}
const helps:Help[] = [
    {head: 'メニュー（1/3）', text: 'メニュー項目を選択して説明を表示します。', ref: null},
    {head: '入力エリア（2/3）', text: '入力エリアにコードを入力後、実行ボタンを押下して結果を得ることができます。', ref: null},
    {head: '出題（3/3）', text: '出題に対する回答を入力後、回答ボタンを押下して結果を得ることができます。', ref: null},
];

const PlantumlComponent: FC = () => {
    const [umltext, setUmltext] = useState('A -> B: Hello');
    const [umlImage, setUmlImage] = useState<string>('');
    const [disableTest, setDisableTest] = useState(false);
    const [takeTest, setTakeTest] = useState(false);
    const [text, setText] = useState<JSX.Element>();
    const [uml, setUml] = useState<JSX.Element>();
    const [diagram, setDiagram] = useState<JSX.Element>();
    const [test, setTest] = useState<JSX.Element>();
    const [question, setQuestion] = useState('');
    const [helpOpen, setHelpOpen] = useState(false);
    const [helpIndex, setHelpIndex] = useState(0);
    const [helpAnchor, setHelpAnchor] = useState(null);
    const [helpHead, setHelpHead] = useState('');
    const [helpText, setHelpText] = useState('');
    const [resultOpen, setResultOpen] = useState(false);
    const [resultTitle, setResultTitle] = useState('Title');
    const [resultContent, setResultContent] = useState('Content');
    // let helpIndex:number=0;
    /** UML生成の実行*/
    const handleExecute = async () => {
        let url = urlbase + plantUmlEncoder.encode(umltext);
        setUmlImage(url);
    };
    /** ツリーアイテムの選択 */
    const handleTreeItemClick = (nodeId: string) => {
        // console.log('nodeId: ', nodeId);
        const nodes = nodeId.split('_');
        if (nodes.length < 2) { return; }

        for (let head of texts) {
            for (let item of head.children) {
                if (head.id == nodes[0] && item.id == nodes[1]) {
                    setText(
                    <>
                        {item.content.split('\n').map( (line, index) => { return (<Typography variant="body2" key={index}>{line}</Typography>) })}
                    </>);
                    setUml(
                    <>
                        {item.sample.split('\n').map( (line, index) => { return (<Typography variant="body2" key={index}>{line}</Typography>) })}
                    </>);
                    if (item.sample !== "") {
                        setDiagram((<img src={urlbase + plantUmlEncoder.encode(item.sample)} />));
                    }else{
                        setDiagram(<></>);
                    }
                    if (item.questions.length > 0) {
                        setQuestion(item.questions[0]);
                        setTest(
                        <>
                            <Typography>出題</Typography>
                            <img src={urlbase + plantUmlEncoder.encode(item.questions[0])}/>
                        </>);
                    }else{
                        setQuestion('');
                        setTest(<></>);
                    }
                    // setDisableTest(prev=>!(takeTest && question !== ''));
                    return;
                }
            }
        }
    }
    /** ヘルプクリック */
    const handleHelp = ()=>{
        // helpIndex=0;
        setHelpIndex(prev=>{
            let value = 0;
            setHelpHead(helps[value].head);
            setHelpText(helps[value].text);
            setHelpAnchor(helps[value].ref);
            setHelpOpen(true);
            return value;
        });
    }
    /** ヘルプを閉じる処理 */
    const handleHelpClose = ()=>{
        setHelpAnchor(null);
        setHelpOpen(false);
    }
    /** 前のヘルプを表示する */
    const handleBackHelp = ()=>{
        setHelpIndex(prev=>{
            let value = (prev > 0) ? prev -1 : helps.length -1;
            setHelpHead(helps[value].head);
            setHelpText(helps[value].text);
            setHelpAnchor(helps[value].ref);
            return value;
        });
    }
    /** 次のヘルプを表示する */
    const handleForwardHelp = ()=>{
        setHelpIndex(prev=>{
            let value = (prev < helps.length -1) ? prev +1 : 0;
            setHelpHead(helps[value].head);
            setHelpText(helps[value].text);
            setHelpAnchor(helps[value].ref);
            return value;
        });
    }
    /** 出題 */
    const handleTakeTest = ()=>{
        setTakeTest(prev=>{
            // setDisableTest(prev=>!(!prev && question !== ''));
            return !prev;
        });
    }
    /** 回答 */
    const handleSubmit = ()=>{
        if(question === ''){return;}
        let code = umltext;
        code = code.replace(/^@startuml/, '');
        code = code.replace(/@enduml$/, '');
        code = code.replace(/ /g, '');
        let q = question.replace(/ /g, '');
        if(code === q){
            setResultTitle('正解');
            setResultContent('正解です！');
        }else{
            setResultTitle('不正解');
            setResultContent('不正解です！');
        }
        setResultOpen(true);
    }
    const handleResultClose = ()=>{
        setResultOpen(false);
    }
    return (
        <LayoutComponent title="PlantUML" page="plantuml" content={<>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    PlantUML (<Link href="https://plantuml.com/ja/">LINK</Link>)
                    {/* ヘルプ */}
                    <IconButton area-label="help" onClick={handleHelp}><HelpOutline/></IconButton>
                    <Popover
                        open={helpOpen}
                        anchorEl={helpAnchor}
                        onClose={handleHelpClose}
                        anchorOrigin={{vertical: 'center', horizontal: 'right'}}
                        transformOrigin={{vertical: 'center', horizontal: 'left'}}
                    >
                        <Card>
                            <CardContent>
                                <Typography variant="h5">{helpHead}</Typography>
                                <Typography variant="body1">{helpText}</Typography>
                                <IconButton id="backHelp" area-label="back" onClick={handleBackHelp}><ArrowBackIosIcon fontSize="small"/></IconButton>
                                <IconButton id="forwardHelp" area-label="forward" onClick={handleForwardHelp}><ArrowForwardIosIcon fontSize="small"/></IconButton>
                            </CardContent>
                        </Card>
                    </Popover>
                    <Dialog
                        open={resultOpen}
                        onClose={handleResultClose}
                    >
                        <DialogTitle>{resultTitle}</DialogTitle>
                        <Typography id="resultDescription" variant="body1">{resultContent}</Typography>
                    </Dialog>
                </Grid>
                <Grid item xs={12}>
                    <Paper>
                        <Grid container spacing={2}>
                            {/* メニュー */}
                            <Grid item xs={3}>
                                <TreeView ref={tree=> helps[0].ref=tree} defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
                                    {texts.map(item => (
                                        <TreeItem nodeId={item.id} label={item.label} key={item.id}>
                                            {item.children.map(child => (
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
                                    <Grid item xs={6}><Paper elevation={3}>{diagram}</Paper></Grid>
                                    <Grid item xs={6}><Box display={(takeTest)?'inline':'none'}><Paper>{test}</Paper></Box></Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="plantuml-text"
                        label="Input Area"
                        multiline
                        variant="outlined"
                        value={umltext}
                        onChange={(e) => { setUmltext(e.target.value); }}
                        ref={input=> helps[1].ref=input}
                    />
                </Grid>
                <Grid item xs={1}>
                    <Button
                        id="button"
                        variant="outlined"
                        color="primary"
                        onClick={handleExecute}
                    >
                        Run
                    </Button>
                </Grid>
                <Grid item xs={2}>
                    <Box display={(takeTest)?'inline':'none'}>
                    <Button
                        id="submit"
                        variant="outlined"
                        color="secondary"
                        onClick={handleSubmit}
                        disabled={disableTest}
                    >
                        Submit
                    </Button>
                    </Box>
                </Grid>
                <Grid item xs={2}>
                    <FormControlLabel
                            control={<Switch checked={takeTest}
                                            onChange={handleTakeTest}
                                            name="challenge"
                                            color="primary"
                                            ref={test=> helps[2].ref=test} />
                            }
                            label="出題"
                        />
                </Grid>
                <Grid item xs={12}>
                    <Paper>
                        <img src={umlImage} />
                    </Paper>
                </Grid>
            </Grid>
        </>} />
    );
}
export default PlantumlComponent;