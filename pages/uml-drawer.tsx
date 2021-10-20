import { FC, useEffect, useState, MouseEvent, TouchEvent } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import ClearIcon from '@material-ui/icons/Clear';
import UndoIcon from '@material-ui/icons/Undo';
import CreateIcon from '@material-ui/icons/Create';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import * as tfjs from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';
import pptxgen from 'pptxgenjs';


//** 座標 */
interface Pos{
    x:number;
    y:number;
}
/** 検出オブジェクト */
class Detection{
    constructor(
        /** クラス分類 */
        public cls:number,
        /** スコア */
        public score:string,
        /** X座標 */
        public x:number,
        /** Y座標 */
        public y:number,
        /** 幅 */
        public width:number,
        /** 高さ */
        public height:number,
    ){}
}

const UmlDrawerComponent: FC=()=>{
    const [initialized, setInitialized] = useState(false);
    const [supply, setSupply] = useState('brush');
    const [doExec, setDoExec] = useState(true);
    const [selectedDiagram, setSelectedDiagram] = useState('architecture');

    /** 描画中フラグ */
    const [dragging, setDragging] = useState(false);
    /** 合成表示用のキャンバス */
    const [canvasView, setCanvasView] = useState<HTMLCanvasElement>();
    /** 描画用のキャンバス（非表示） */
    const [canvasDraw, setCanvasDraw] = useState<HTMLCanvasElement>();
    /** SVG貼り付け用のキャンバス */
    const [canvasSvg, setCanvasSvg] = useState<HTMLCanvasElement>();
    /** 2Dコンテキスト */
    const [ctxView, setCtxView] = useState<CanvasRenderingContext2D>();
    /** 2Dコンテキスト */
    const [ctxDraw, setCtxDraw] = useState<CanvasRenderingContext2D>();
    /** 2Dコンテキスト */
    const [ctxSvg, setCtxSvg] = useState<CanvasRenderingContext2D>();
    /** 描画の履歴 */
    const [history, setHistory] = useState<ImageData[]>([]);
    /** オブジェクト検出モデル */
    const [model, setModel] = useState<tfjs.GraphModel>();
    /** 描画開始座標 */
    const [startPos, setStartPos] = useState<Pos>({x:0,y:0})
    /** 描画中の直前の座標 */
    const [prevPos, setPrevPos] = useState<Pos>({x:0,y:0});
    /** 推論の採用閾値（暫定） */
    const thresold = 0.50;
    /** 最後の検出結果 */
    const [lastDetects, setLastDetects] = useState<Detection[]>([]);
    /** クラスラベル */ // ※ labelmap.pbtxt と一致
    const archiClasses:{[name:string]:any} = {
        '1': {name: 'user', width:100, height:100, path:'images/user.svg'},
        '2': {name: 'server', width:100, height:100, path:'images/server.svg'},
        '3': {name: 'database', width:100, height:100, path:'images/database.svg'},
        '4': {name: 'laptop', width:100, height:100, path:'images/laptop.svg'},
        '5': {name: 'mobile', width:100, height:100, path:'images/mobile.svg'},
        '6': {name: 'text'},

        '7': {name: 'arrow_right', width:100, height:100, path:'images/arrow_right.svg'},
        '8': {name: 'arrow_left', width:100, height:100, path:'images/arrow_left.svg'},
        '9': {name: 'arrow_up', width:100, height:100, path:'images/arrow_up.svg'},
        '10': {name: 'arrow_down', width:100, height:100, path:'images/arrow_down.svg'},
        '11': {name: 'arrow_right_up', width:100, height:100, path:'images/arrow_right_up.svg'},
        '12': {name: 'arrow_right_down', width:100, height:100, path:'images/arrow_right_down.svg'},
        '13': {name: 'arrow_left_up', width:100, height:100, path:'images/arrow_left_up.svg'},
        '14': {name: 'arrow_left_down', width:100, height:100, path:'images/arrow_left_down.svg'},

        '15': {name: 'arrow_both_horizon', width:100, height:100, path:'images/arrow_both_horizon.svg'},
        '16': {name: 'arrow_both_vertical', width:100, height:100, path:'images/arrow_both_vertical.svg'},
        '17': {name: 'arrow_both_right_up', width:100, height:100, path:'images/arrow_both_right_up.svg'},
        '18': {name: 'arrow_both_right_down', width:100, height:100, path:'images/arrow_both_right_down.svg'},

        '19': {name: 'line_horizon', width:100, height:100, path:'images/line_horizon.svg'},
        '20': {name: 'line_vertical', width:100, height:100, path:'images/line_vertical.svg'},
        '21': {name: 'line_right_up', width:100, height:100, path:'images/line_right_up.svg'},
        '22': {name: 'line_right_down', width:100, height:100, path:'images/line_right_down.svg'},

        '23': {name: 'number_1', width:100, height:100, path:'images/number_1'},
        '24': {name: 'number_2', width:100, height:100, path:'images/number_2'},
        '25': {name: 'number_3', width:100, height:100, path:'images/number_3'},
        '26': {name: 'number_4', width:100, height:100, path:'images/number_4'},
        '27': {name: 'number_5', width:100, height:100, path:'images/number_5'},
        '28': {name: 'number_6', width:100, height:100, path:'images/number_6'},
        '29': {name: 'number_7', width:100, height:100, path:'images/number_7'},
        '30': {name: 'number_8', width:100, height:100, path:'images/number_8'},
        '31': {name: 'number_9', width:100, height:100, path:'images/number_9'},
        '32':{name: 'number_10', width:100, height:100, path:'images/number_10'},
    }
    useEffect(()=>{
        // console.log('use effect');
        // 初期化処理（canvas要素の参照取得と、モデルの読み込み）
        if(!initialized){
            console.log('constructor');
            try{
                let view = document.getElementById('canvas') as HTMLCanvasElement;
                let draw = document.createElement('canvas');
                let svgs = document.getElementById('canvas2') as HTMLCanvasElement;
                [draw.width, draw.height] = [view.width, view.height];
                setCanvasView(view);
                setCanvasDraw(draw);
                setCanvasSvg(svgs);
                const cv = view.getContext('2d');
                if(cv){ setCtxView(cv); }
                const cd = draw.getContext('2d');
                if(cd){ setCtxDraw(cd); }
                const cs = svgs.getContext('2d');
                if(cs){ setCtxSvg(cs); }

                clear(view, draw, cv, cd);

                // モデルの読み込み
                tfjs.setBackend('webgl');
                let model = getModelPath(selectedDiagram);
                loadGraphModel(model).then( m=> setModel(m) );
                setInitialized(true);
            }catch(e){
                console.log(e);
            }
        }
    });

    /** モデルのパスを取得する */
    const getModelPath = (diagram:string)=>{
        let model = 'tfjs_models/arc_model/model.json';
        return model;
    }

    /** アーキテクチャ図アイコンのパスを取得する
     * @returns 存在しない場合、空文字
    */
    const getIconPath = (cls:number, classes:{[name:string]:any}):string=>{
        const c = (classes[cls])? classes[cls]: null;
        if(c && c.path){
            return c.path;
        }
        return '';
    };

    /** 描画開始 */
    const start = (pageX:number, pageY:number)=>{
        if(!ctxView || !ctxDraw || !canvasDraw){ return; }

        setDragging(true);
        if(supply === 'brush'){
            ctxDraw.strokeStyle = 'black';
            ctxDraw.lineWidth = 1;
        } else if(supply === 'eraser'){
            ctxDraw.strokeStyle = 'white';
            ctxDraw.lineWidth = 20;
        }
        const pos = getPos(pageX, pageY);
        setStartPos(pos);
        setPrevPos(pos);
        history.push(ctxDraw.getImageData(0,0, canvasDraw.width, canvasDraw.height));
    }
    const mouseDown = (e: MouseEvent<HTMLCanvasElement>)=>{
        start(e.pageX, e.pageY);
    };
    const touchStart = (e: TouchEvent<HTMLCanvasElement>)=>{
        if(e.changedTouches.length > 0){
            start(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        }
    };
    /** 描画中 */
    const move = (pageX:number, pageY:number)=>{
        if(dragging){
            if(!ctxDraw || !ctxView || !canvasView){ return; }

            let pos = getPos(pageX, pageY);
            ctxDraw.beginPath();
            ctxDraw.moveTo(prevPos.x, prevPos.y);
            ctxDraw.lineTo(pos.x, pos.y);
            ctxDraw.stroke();
            ctxView.putImageData(ctxDraw.getImageData(0,0, canvasView.width, canvasView.height), 0, 0);
            setPrevPos(pos);
        }
    }
    const mouseMove = (e: MouseEvent<HTMLCanvasElement>)=>{
        move(e.pageX, e.pageY);
    };
    const touchMove = (e: TouchEvent<HTMLCanvasElement>)=>{
        if(e.changedTouches.length > 0){
            move(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        }
    }
    /** 描画終了 */
    const end = ()=>{
        setDragging(false);
        execute();
    }
    const mouseUp = (e: MouseEvent<HTMLCanvasElement>)=>{
        end();
    };
    const touchEnd = (e: TouchEvent<HTMLCanvasElement>)=>{
        end();
    }
    const touchCancel = (e: TouchEvent<HTMLCanvasElement>)=>{
        end();
    }
    const getPos=(x:number,y:number):Pos=>{
        let pos:Pos = {x:0,y:0};
        if(canvasView){
            pos = {
                    x: x - canvasView.getBoundingClientRect().left,
                    y: y - canvasView.getBoundingClientRect().top
                };
        }
        return pos;
    }
    /** 描画結果の処理 */
    const execute = async()=>{
        if(!doExec){ return }

        // 検出結果クリア
        setLastDetects([]);

        // アーキテクチャ図の処理
        if(selectedDiagram == 'architecture'){
            const arcs = await getDetections(1,0,4);
            drawPredictions(arcs, archiClasses);
            drawArchitecture(arcs, archiClasses);
            setLastDetects(arcs);
        }
    }
    /** 物体検出の結果を取得 */
    const getDetections = async(boxIndex:number, scoreIndex:number, classIndex:number)=>{
        if(!canvasView || !model){ return []; }

        // 画像取得
        const image = tfjs.browser.fromPixels(canvasView);
        const expandedimg = image.toInt().transpose([0,1,2]).expandDims();
        let predictions = await model.executeAsync(expandedimg);
        if(!Array.isArray(predictions)){ predictions = [predictions]; }

        // prediction確認用
        // console.log(`box: ${boxIndex}, score: ${scoreIndex}, class: ${classIndex}`);
        // predictions.forEach( (p,i)=>{
        //     console.log('prediction: ', i, p.arraySync());
        // });
        const boxes = predictions[boxIndex].arraySync() as Number[][][];
        const scores = predictions[scoreIndex].arraySync() as Number[][];
        const classes = predictions[classIndex].dataSync();

        const detections:Detection[]=[];
        scores[0].forEach((score,i)=>{
            if(score>thresold){
                const minY = boxes[0][i][0] as number * canvasView.height;
                const minX = boxes[0][i][1] as number * canvasView.width;
                const maxY = boxes[0][i][2] as number * canvasView.height;
                const maxX = boxes[0][i][3] as number * canvasView.width;
                detections.push(new Detection(
                    classes[i],
                    score.toFixed(4),
                    minX,
                    minY,
                    maxX - minX,
                    maxY - minY
                ));
            }
        });
        return detections;
    };
    /** 推論結果を描画する */
    const drawPredictions = (detections:Detection[], classes:{[name:string]:any})=>{
        if(!ctxView){ return; }

        ctxView.strokeStyle = '#00FF00';
        ctxView.font = '21px serif';
        ctxView.fillStyle = '#00FF00';
        for(const detection of detections){
            ctxView.strokeRect(detection.x, detection.y, detection.width, detection.height);
            const className = (classes[detection.cls])? classes[detection.cls].name:'unknown';
            const score = (Number(detection.score) * 100).toFixed(2);
            ctxView.fillText(`${detection.cls}: ${className}, ${score} %`, detection.x,detection.y);
        }
    };
    /** アーキテクチャ図を描画する */
    const drawArchitecture = (detections:Detection[], classes:{[name:string]:any})=>{
        if(!ctxSvg || !canvasSvg || !ctxDraw){ return; }
        ctxSvg.clearRect(0,0, canvasSvg.width, canvasSvg.height);
        for(const detection of detections){
            const className = (classes[detection.cls])? classes[detection.cls].name: 'unknown';
            // 'text' の場合、切り出し。他は画像に置き換え。
            if(className == 'text'){
                let text = ctxDraw.getImageData(detection.x, detection.y, detection.width, detection.height);
                ctxSvg.putImageData(text, detection.x, detection.y);
            }else{
                const path = getIconPath(detection.cls, classes);
                if(path!=''){
                    const img = new Image();
                    img.src = path;
                    img.onload = ()=>{
                        // 座標を補正して配置する
                        let x = detection.x + (detection.width/2) - (img.width/2);
                        let y = detection.y + (detection.height/2) - (img.height/2);
                        ctxSvg.drawImage(img, x, y);
                    }
                }
            }
        }
    }
    const clear = (
        view:HTMLCanvasElement|null=null,
        draw:HTMLCanvasElement|null=null,
        cv:CanvasRenderingContext2D|null=null,
        cd:CanvasRenderingContext2D|null=null)=>{
        
        // パラメータなし
        if(canvasView && ctxView && canvasDraw && ctxDraw){
            view = canvasView;
            draw = canvasDraw;
            cv = ctxView;
            cd = ctxDraw;
        }

        if(view && draw && cv && cd){
            cv.fillStyle = 'white';
            cv.fillRect(0,0, view.width, view.height);
            cd.fillStyle = 'white';
            cd.fillRect(0,0, draw.width, draw.height);
        }
        setHistory([]);
    };
    /** 前回の描画状態をセットする */
    const setPrev = ()=>{
        if(history.length > 0){
            let last = history.pop();
            if(last && ctxDraw && ctxView){
                ctxDraw.putImageData(last, 0, 0)
                ctxView.putImageData(last, 0, 0);
            }
        }
    }
    /** png ファイルの生成 */
    const genPng = ()=>{
        if(!canvasSvg){ return; }
        canvasSvg.toBlob((b)=>{
            const url = URL.createObjectURL(b);
            const a = document.createElement('a');
            a.download = 'diagram.png';
            a.href = url;
            a.click();
            a.remove();
        }, 'image/png');
    };
    /** .pptx ファイルの作成
     */
    const genPptx = ()=>{
        let pres = new pptxgen();
        let slide = pres.addSlide();
        // pptxでの座標1が、画像の100px分程度。
        // サイズは横1000程度、縦560程度
        // canvas が 500x500 なので、1/100 でよさそう。

        for(const detect of lastDetects){
            // 'text' の場合、切り出し。他は画像に置き換え。
            const className = (archiClasses[detect.cls])? archiClasses[detect.cls].name: 'unknown';
            if(className == 'text'){
                // base64imageを作成するため、canvas生成する。
                if(ctxDraw){
                    const c = document.createElement('canvas');
                    c.width = detect.width;
                    c.height = detect.height;
                    const cc = c.getContext('2d');
                    let text = ctxDraw.getImageData(detect.x, detect.y, detect.width, detect.height);
                    cc?.putImageData(text, 0, 0);
                    let dataUrl = c.toDataURL();
                    let x = detect.x / 100;
                    let y = detect.y / 100;
                    let w = detect.width / 100;
                    let h = detect.height / 100;
                    slide.addImage({data: dataUrl, x:x, y:y, w:w, h:h});
                    c.remove();
                }
            }else{
                const icon = getIconPath(detect.cls, archiClasses);
                // TODO 画像サイズを定義
                const size = 100;
                if(icon!=''){
                    let x = (detect.x + (detect.width/2) - (size/2)) / 100;
                    let y = (detect.y + (detect.height/2) - (size/2)) / 100;
                    slide.addImage({path:icon, x:x, y:y});
                }
            }
        }

        pres.writeFile();
    };

    return (<>
        <Grid container>
            <Grid item xs={6}>
                <p>canvas</p>
                <div>
                    <Button onClick={()=>{clear();}} variant="outlined" startIcon={<ClearIcon/>}>Clear</Button>
                    <Button onClick={()=>{setPrev();}} variant="outlined"><UndoIcon/></Button>
                    <FormControlLabel
                        control={<Checkbox checked={doExec} onChange={(e)=>{setDoExec(e.target.checked)}}/>}
                        label="exec()"/>
                    {/* ダイアグラム選択がないため、一時的に無効化
                     <NativeSelect
                        value={selectedDiagram}
                        onChange={(e)=>{
                            setSelectedDiagram(e.target.value);
                            tfjs.setBackend('webgl');
                            let model = getModelPath(e.target.value);
                            loadGraphModel(model).then(m=>setModel(m));
                        }}
                    >
                        <option value={"architecture"}>architecture</option>
                    </NativeSelect> */}
                    <Button onClick={()=>{genPng();}} variant="outlined">png DL</Button>
                    <Button onClick={()=>{genPptx();}} variant="outlined">pptx DL</Button>
                    <FormControl component="fieldset">
                        <RadioGroup row>
                            <FormControlLabel label="brush" control={
                                <Radio
                                    value="brush"
                                    checked={supply === 'brush'}
                                    // onChange={()=>{setSupply('brush')}}
                                    onClick={()=>{setSupply('brush')}}
                                    color="primary"
                                    icon={<CreateIcon color="disabled"/>}
                                    checkedIcon={<CreateIcon/>}
                                />
                            } />
                            <FormControlLabel value="eraser" label="eraser" control={
                                <Radio
                                    value="eraser"
                                    checked={supply === 'eraser'}
                                    // onChange={()=>{setSupply('brush')}}
                                    onClick={()=>{setSupply('eraser')}}
                                    color="secondary"
                                    icon={<ClearAllIcon color="disabled"/>}
                                    checkedIcon={<ClearAllIcon/>}
                                />
                            }/>
                        </RadioGroup>
                    </FormControl>
                </div>
                <canvas id="canvas" width="500" height="500" onMouseDown={mouseDown} onMouseMove={mouseMove} onMouseUp={mouseUp} onTouchStart={touchStart} onTouchMove={touchMove} onTouchEnd={touchEnd} onTouchCancel={touchCancel} style={{border:"1px solid black"}}></canvas>
            </Grid>
            <Grid item xs={6}>
                <p>canvas2</p>
                <canvas id="canvas2" width="500" height="500" style={{border:"1px solid black"}}/>
            </Grid>
        </Grid>
    </>);
}
export default UmlDrawerComponent;