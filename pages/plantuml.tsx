import { FC, MouseEvent, useState } from 'react';
import Link from 'next/link';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Collapse from '@material-ui/core/Collapse';
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
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

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
// String.raw() を使用することで、改行文字（\n）をそのまま出力する。
const texts: TextHead[] = [
    {
        label: "シーケンス図", id: "1", children: [
            {
                id: "1", label: "基本的な例",
                content: String.raw`
                シーケンス '->' を、2つの分類子間のメッセージを描画するために使います。分類子を、明示的に宣言する必要はありません。
                点線の矢印を使う場合は、'-->' とします。
                また、 '<-' や、 '<--' を使うこともできます。これらによって図の見た目が変わることはありませんが、可読性を高めることができます。
                ただし、以上の方法はシーケンス図だけに当てはまります。ほかの種類の図には当てはまりません。`,
                sample: String.raw`
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
                content: String.raw`
                キーワードparticipantを使って分類詞を宣言すると、分類子の表示を調整することができます。
                宣言した順序が、デフォルトの表示順になります。
                分類子の宣言に別のキーワードを使用すると、分類子の形を変えることができます。`,
                sample: String.raw`
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
                content: String.raw`
                キーワード as を使って、分類子の名前を変更することができます。
                アクターや分類子の背景色を、HTML コードや色名を使って変更することもできます。`,
                sample: String.raw`
                @startuml
                actor Bob #red
                ' The only difference between actor
                'and participant is the drawing
                participant Alice
                participant "I have a really\nlong name" as L #99FF99
                /' You can also declare:
                participant L as "I have a really\nlong name"  #99FF99
                '/

                Alice->Bob: Authentication Request
                Bob->Alice: Authentication Response
                Bob->L: Log transaction
                @enduml`, 
                questions: [] 
            },
            {
                id:"4", label: "分類子のorder",
                content: String.raw`order キーワードを使って、分類子が表示される順序を変更することもできます。`,
                sample: String.raw`
                @startuml
                participant Last order 30
                participant Middle order 20
                participant First order 10
                @enduml`,
                questions: []
            },
            {
                id:"5", label: "別名2",
                content: String.raw`分類子を定義するときに引用符を使用することができます。そして、分類子にエイリアスを与えるためにキーワード as を使用することができます。`,
                sample: String.raw`
                @startuml
                Alice -> "Bob()" : Hello
                "Bob()" -> "This is very\nlong" as Long
                ' You can also declare:
                ' "Bob()" -> Long as "This is very\nlong"
                Long --> "Bob()" : ok
                @enduml`,
                questions: []
            },
            {
                id:"6", label: "自分自身へのメッセージ",
                content: String.raw`
                分類子は自分自身へメッセージを送信できます。
                \n を使用して、複数行のテキストを扱えます。`,
                sample: String.raw`
                @startuml
                Alice->Alice: This is a signal to self.\nIt also demonstrates\nmultiline \ntext
                @enduml`,
                questions: []
            },
            {
                id:"7", label: "Text alignment",
                content: String.raw`
                skinparam responseMessageBelowArrow trueコマンドを使うことで、応答メッセージの矢印の下に文字を配置することができます。`,
                sample: String.raw`
                @startuml
                skinparam responseMessageBelowArrow true
                Bob -> Alice : hello
                Alice -> Bob : ok
                @enduml`,
                questions: []
            },
            {id:"8", label: "矢印の見た目 (x)", content: String.raw``, sample: String.raw``, questions: []},
            {id:"9", label: "矢印の色 (x)", content: String.raw``, sample: String.raw``, questions: []},
            {id:"10", label: "メッセージシーケンスの番号付け (x)", content: String.raw``, sample: String.raw``, questions: []},
            {id:"11", label: "タイトル (x)", content: String.raw``, sample: String.raw``, questions: []},
        ]
    },
    {
        label: "ユースケース図", id: "2", children: [
            {
                id: "1", label: "基本", 
                content: String.raw`
                ユースケースは丸括弧で囲んで使います(丸括弧の対は 楕円に似ているからです)。
                usecase キーワードを使ってユースケースを定義することもできます。 as キーワードを使ってエイリアスを定義することもできます。このエイリアスは あとで、ユースケースの関係を定義するために使います。`,
                sample: String.raw`
                @startuml

                (First usecase)
                (Another usecase) as (UC2)
                usecase UC3
                usecase (Last\nusecase) as UC4

                @enduml`,
                questions: [] },
            {id: "2", label: "アクター (x)", content: String.raw``, sample: String.raw``, questions: []},
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
                content: String.raw`
                コンポーネントは括弧でくくります。
                また、 component キーワードでもコンポーネントを定義できます。 そして、コンポーネントには as キーワードにより別名をつけることができます。 この別名は、後でリレーションを定義するときに使えます。`,
                sample: String.raw`
                @startuml

                [First component]
                [Another component] as Comp2
                component Comp3
                component [Last\ncomponent] as Comp4

                @enduml`,
                questions: []
            },
            {
                id: "2", label: "インタフェース",
                content: String.raw`
                インタフェースは丸括弧 () でシンボルを囲うことで定義できます。 (何故なら見た目が丸いからです。)
                もちろん interface キーワードを使って定義することもできます。 as キーワードでエイリアスを定義できます。 このエイリアスは後で、関係を定義する時に使えます。
                後で説明されますが、インタフェースの定義は省略可能です。`,
                sample: String.raw`
                @startuml

                () "First Interface"
                () "Another interface" as Interf2
                interface Interf3
                interface "Last\ninterface" as Interf4

                [component]
                footer //Adding "component" to force diagram to be a **component diagram**//
                @enduml`,
                questions: []
            },
            {
                id: "3", label: "要素感の関係",
                content: String.raw`要素間の関係は、破線 (..)、直線 (--), 矢印 (-->) の組合せで構成されます。`,
                sample: String.raw`
                @startuml
                
                DataAccess - [First Component]
                [First Component] ..> HTTP : use
                
                @enduml`,
                questions: []
            },
            {
                id: "4", label: "ノート",
                content: String.raw`オブジェクトに関連のあるノートを作成するにはnote left of 、note right of 、note top of 、 note bottom of キーワードを使います。 note left of , note right of , note top of , note bottom of
                または note キーワードを使ってノートを作成し、.. 記号を使ってオブジェクトに紐づけること ができます。`,
                sample: String.raw`
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
                content: String.raw`
                いくつかのキーワードをグループコンポーネントやインタフェースに使用することができます：
                * package
                * node
                * folder
                * frame
                * cloud
                * database`,
                sample: String.raw`
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
                content: String.raw``,
                sample: String.raw``,
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
    const [expanded, setExpanded] = useState(false);
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
                    <Box display={(!expanded)?'inline':'none'}><IconButton onClick={()=>{setExpanded(true);}}><ExpandMore/></IconButton></Box>
                    <Box display={(expanded)?'inline':'none'}><IconButton onClick={()=>{setExpanded(false);}}><ExpandLess/></IconButton></Box>
                    {/* ヘルプ */}
                    <Box display={(expanded)?'inline':'none'}><IconButton area-label="help" onClick={handleHelp}><HelpOutline /></IconButton></Box>
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
                    {/* <Box display={(expanded)?'inline':'none'}> */}
                    <Collapse in={expanded}>
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
                                    <Grid item xs={12}>
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
                                    <Grid item xs={6}><Box display={(takeTest)?'inline':'none'}><Paper>{test}</Paper></Box></Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                    </Collapse>
                </Grid>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={6}>
                            <TextField
                                id="plantuml-text"
                                label="Input Area"
                                fullWidth
                                multiline
                                variant="outlined"
                                value={umltext}
                                onChange={(e) => { setUmltext(e.target.value); }}
                                ref={input=> helps[1].ref=input}
                            />
                        </Grid>
                    </Grid>
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
                    
                </Grid>
                <Grid item xs={12}>
                    <img src={umlImage} />
                </Grid>
            </Grid>
        </>} />
    );
}
export default PlantumlComponent;