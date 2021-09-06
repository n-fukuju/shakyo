import { FC, useEffect, useState, MouseEvent, TouchEvent } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ClearIcon from '@material-ui/icons/Clear';
import UndoIcon from '@material-ui/icons/Undo';
import CreateIcon from '@material-ui/icons/Create';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import * as tfjs from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';
import Tesseract from 'tesseract.js';
import plantUmlEncoder from 'plantuml-encoder';
const plantuml = 'http://www.plantuml.com/plantuml/img/';


//** 座標 */
interface Pos{
    x:number;
    y:number;
}
interface Rect{
    x:number;
    y:number;
    width:number;
    height:number;
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
        /** 参照 */
        public ref:string='',
    ){}
    /** 当たり判定 */
    collision(target:Rect){
        return this.x < target.x + target.width &&
                this.x + this.width > target.width &&
                this.y < target.y + target.height &&
                this.y + this.height > target.y;
    }
    /** 上辺 */
    top(){ return { x: this.x, y: this.y, width: this.width, height: 0 }; }
    /** 上方にずらした矩形 */
    top2(){ return { x: this.x, y: this.y-this.height, width: this.width, height: this.height}; }
    bottom(){ return { x: this.x, y: this.y + this.height, width: this.width, height: 0 }; }
    bottom2(){ return { x: this.x, y: this.y+this.height+this.height, width: this.width, height: this.height }; }
    right(){ return { x: this.x+this.width, y: this.y, width: 0, height: this.height }; }
    right2(){ return { x: this.x+this.width, y: this.y, width: this.width, height: this.height }; }
    left(){ return { x: this.x, y:this.y, width: 0, height: this.height}; }
    left2(){ return { x: this.x-this.width, y: this.y, width: this.width, height: this.height }; }
    /** 右上の矩形 */
    rightTop(){ return { x: this.x+this.width/2, y:this.y, width: this.width/2, height: this.height/2}; }
    rightTop2(){ return { x: this.x+this.width/2, y:this.y-this.y/2, width:this.width, height: this.height }; }
    rightBottom(){ return { x: this.x+this.width/2, y:this.y+this.y/2, width: this.width/2, height: this.height/2 }; }
    rightBottom2(){ return { x: this.x+this.width/2, y:this.y+this.y/2, width: this.width, height: this.height }; }
    leftTop(){ return { x: this.x, y: this.y, width: this.width/2, height: this.height/2 }; }
    leftTop2(){ return { x: this.x-this.width/2, y: this.y-this.height/2, width: this.width, height: this.height }; }
    leftBottom(){ return { x: this.x, y: this.y+this.height/2, width: this.width/2, height: this.height/2 }; }
    leftBottom2(){ return { x: this.x-this.width/2, y:this.y+this.height/2, width: this.width, height: this.height }; }
}

const UmlDrawerComponent: FC=()=>{
    const [initialized, setInitialized] = useState(false);
    const [supply, setSupply] = useState('brush');
    const [text, setText] = useState('');
    const [imgSrc, setImgSrc] = useState('');

    /** 描画中フラグ */
    // let dragging=false;
    const [dragging, setDragging] = useState(false);
    /** 合成表示用のキャンバス */
    // let canvasView:HTMLCanvasElement;
    const [canvasView, setCanvasView] = useState<HTMLCanvasElement>();
    /** 描画用のキャンバス（非表示） */
    // let canvasDraw:HTMLCanvasElement;
    const [canvasDraw, setCanvasDraw] = useState<HTMLCanvasElement>();
    /** 2Dコンテキスト */
    // let ctxView:CanvasRenderingContext2D;
    const [ctxView, setCtxView] = useState<CanvasRenderingContext2D>();
    /** 2Dコンテキスト */
    // let ctxDraw:CanvasRenderingContext2D;
    const [ctxDraw, setCtxDraw] = useState<CanvasRenderingContext2D>();
    /** 描画の履歴 */
    // let history:ImageData[]=[];
    const [history, setHistory] = useState<ImageData[]>([]);
    /** オブジェクト検出モデル */
    // let model:tfjs.GraphModel;
    const [model, setModel] = useState<tfjs.GraphModel>();
    /** 描画開始座標 */
    // let startPos:Pos={x:0,y:0};
    const [startPos, setStartPos] = useState<Pos>({x:0,y:0})
    /** 描画中の直前の座標 */
    // let prevPos:Pos={x:0,y:0};
    const [prevPos, setPrevPos] = useState<Pos>({x:0,y:0});
    /** 推論の採用閾値（暫定） */
    const thresold = 0.50;
    /** クラスラベル */
    const usecaseClasses:{[name:string]:any} = {
        '1': {name: 'usecase'},
        '2': {name: 'actor'},
        '3': {name: 'actor_with_label'},
        '4': {name: 'rectangle'},
        '5': {name: 'rectangle_with_label'},
        '6': {name: 'note'},
        '7': {name: 'arrow_right'},
        '8': {name: 'arrow_left'},
        '9': {name: 'arrow_up'},
        '10':{name: 'arrow_down'},
        '11':{name: 'arrow_right_up'},
        '12':{name: 'arrow_right_down'},
        '13':{name: 'arrow_left_up'},
        '14':{name: 'arrow_left_down'},
    };
    /** 矢印 */
    const usecaseArrows = [7,8,9,10,11,12,13,14];
    useEffect(()=>{
        // console.log('use effect');
        if(!initialized){
            console.log('constructor');
            try{
                // canvasView = document.getElementById('canvas') as HTMLCanvasElement;
                // canvasDraw = document.createElement('canvas');
                // [canvasDraw.width, canvasDraw.height] = [canvasView.width, canvasView.height];
                // const cv = canvasView.getContext('2d');
                // if(cv){ ctxView = cv; }
                // const cd = canvasDraw.getContext('2d');
                // if(cd){ ctxDraw = cd; }
                let view = document.getElementById('canvas') as HTMLCanvasElement;
                let draw = document.createElement('canvas');
                [draw.width, draw.height] = [view.width, view.height];
                setCanvasView(view);
                setCanvasDraw(draw);
                const cv = view.getContext('2d');
                if(cv){ setCtxView(cv); }
                const cd = draw.getContext('2d');
                if(cd){ setCtxDraw(cd); }

                clear(view, draw, cv, cd);

                // モデルの読み込み
                tfjs.setBackend('webgl');
                loadGraphModel('tfjs_models/web_model/model.json').then( m=> setModel(m) );
                setInitialized(true);
            }catch(e){
                console.log(e);
            }
        }
    });

    /** 描画開始 */
    const start = (pageX:number, pageY:number)=>{
        if(!ctxView || !ctxDraw || !canvasDraw){ return; }

        // dragging=true;
        setDragging(true);
        // ctxView.strokeStyle = 'black';
        // ctxView.lineWidth = 1;
        if(supply === 'brush'){
            ctxDraw.strokeStyle = 'black';
            ctxDraw.lineWidth = 1;
        } else if(supply === 'eraser'){
            ctxDraw.strokeStyle = 'white';
            ctxDraw.lineWidth = 20;
        }
        // startPos = getPos(pageX, pageY);
        // prevPos = startPos;
        const pos = getPos(pageX, pageY);
        setStartPos(pos);
        setPrevPos(pos);
        // history.push(ctxView.getImageData(0,0, canvasView.width, canvasView.height));
        // history.push(ctxDraw.getImageData(0, 0, canvasDraw.width, canvasDraw.height));
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
            // ctxView.beginPath();
            // ctxView.moveTo(prevPos.x, prevPos.y);
            // ctxView.lineTo(pos.x, pos.y);
            // ctxView.stroke();
            ctxDraw.beginPath();
            ctxDraw.moveTo(prevPos.x, prevPos.y);
            ctxDraw.lineTo(pos.x, pos.y);
            ctxDraw.stroke();
            ctxView.putImageData(ctxDraw.getImageData(0,0, canvasView.width, canvasView.height), 0, 0);
            // prevPos = pos;
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
        // dragging=false;
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
        // return {
        //     x: x - canvasView.getBoundingClientRect().left,
        //     y: y - canvasView.getBoundingClientRect().top
        // };
        let pos:Pos = {x:0,y:0};
        if(canvasView){
            pos = {
                    x: x - canvasView.getBoundingClientRect().left,
                    y: y - canvasView.getBoundingClientRect().top
                };
        }
        return pos;
    }
    /** 処理 */
    const execute = async()=>{
        if(!canvasView || !ctxView || !model){ return; }

        // 画像取得
        const image = tfjs.browser.fromPixels(canvasView);
        const expandedimg = image.toInt().transpose([0,1,2]).expandDims();
        let predictions = await model.executeAsync(expandedimg);
        if(!Array.isArray(predictions)){ predictions = [predictions]; }

        // prediction確認用（毎回インデックスが異なる）
        // console.log('predictions: ', predictions);
        // predictions.forEach( (p,i)=>{
        //     console.log('prediction: ', i, p.arraySync());
        // });

        const boxes = predictions[1].arraySync() as Number[][][];
        const scores = predictions[2].arraySync() as Number[][];
        const classes = predictions[5].dataSync();
        // console.log('boxes: ', boxes);
        // console.log('scores: ', scores);
        // console.log('classes: ', classes);



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
        // console.log('detections: ', detections);
        // 推論による検出結果をキャンバスに描画する
        for(const detection of detections){
            ctxView.strokeStyle = '#00FF00';
            ctxView.strokeRect(detection.x, detection.y, detection.width, detection.height);
            ctxView.font = '21px serif';
            ctxView.fillStyle = '#00FF00';
            const className = usecaseClasses[detection.cls].name;
            const score = (Number(detection.score) * 100).toFixed(2);
            ctxView.fillText(`${detection.cls}: ${className}, ${score} %`, detection.x,detection.y);
        }

        convert(detections);
    };
    /** 検出結果をテキストに変換する */
    const convert = async(detections:Detection[])=>{
        let text = '';
        for(const detection of detections){
            // actor, usecase は単純に出力
            if(detection.cls == 1){
                // text += `(usecase)\n`;
                // 切り取って渡す
                const imageData = ctxDraw?.getImageData(
                    detection.x,
                    detection.y,
                    detection.width,
                    detection.height
                );
                const r = await recognize(imageData);
                detection.ref = `(${r})`;
                text += `${detection.ref}\n`;
                continue;
            }
            if(detection.cls == 2){
                detection.ref = `:actor:`;
                text += `${detection.ref}\n`;
                continue;
            }

            // arrow は当たり判定
            if(usecaseArrows.indexOf(detection.cls)){
                // console.log('arrow');
                // 矩形で重なっているか、ずらして当たっているオブジェクトを探す
                let from:Detection|null=null;
                let to:Detection|null=null;
                if(detection.cls = 7){
                    for(const d2 of detections){
                        if(d2.collision(detection.right())){ to=d2; }
                        else if(d2.collision(detection.right2())){ to=d2; }
                        if(d2.collision(detection.left())){ from=d2; }
                        else if(d2.collision(detection.left2())){ from=d2; }
                    }
                    if(from && from.ref !== '' && to && to.ref !== ''){
                        text += `${from.ref} --> ${to.ref}\n`;
                        break;
                    }
                }
                if(detection.cls = 9){
                    for(const d2 of detections){
                        if(d2.collision(detection.top())){ to=d2; }
                        else if(d2.collision(detection.top2())){ to = d2; }
                        if(d2.collision(detection.bottom())){ from = d2; }
                        else if(d2.collision(detection.bottom2())){ from = d2; }
                    }
                    if(from && from.ref !== '' && to && to.ref !== ''){
                        text += `${from.ref} --> ${to.ref}\n`;
                        break;
                    }
                }
            }
        }
        setText(text);
        if(text!=''){
            setImgSrc(plantuml + plantUmlEncoder.encode(text));
        }
    };
    /** テキスト検出 */
    const recognize = async(imageData?:ImageData)=>{
        if(!canvasDraw || !imageData){ return; }

        // Tesseract に、 ImageData を直接渡すとエラーになる
        // 暫定的にCanvas 生成して渡す。
        const c = document.createElement('canvas');
        c.width = imageData.width;
        c.height = imageData.height;
        const cc = c.getContext('2d');
        cc?.putImageData(imageData, 0, 0);
        // console.log(c.toDataURL('image/jpeg'));

        const  {data:{text}} = await Tesseract.recognize(
            c,
            'eng',
            // {logger: m=>console.log(m)}
        );
        // console.log('recognized: ', text);
        return text.replace(/[\n\(\)]/sg, '');
    };
    const btn = ()=>{
        // // 動作確認ボタン
        // const img = new Image();
        // img.src = 'temp/usecase_h06.png';
        // img.onload = ()=>{
        //     if(!ctxView){return;}
        //     canvasView.width = img.width;
        //     canvasView.height = img.height;
        //     ctxView.drawImage(img, 0, 0);
        //     execute();
        // };

        // console.log(canvasView.toDataURL('image/svg+xml'));
    };
    const clear = (
        view:HTMLCanvasElement|null=null,
        draw:HTMLCanvasElement|null=null,
        cv:CanvasRenderingContext2D|null=null,
        cd:CanvasRenderingContext2D|null=null)=>{

        // let view:HTMLCanvasElement|undefined=undefined;
        // let draw:HTMLCanvasElement|undefined=undefined;
        // let cv:CanvasRenderingContext2D|undefined=undefined;
        // let cd:CanvasRenderingContext2D|undefined=undefined;

        // // 初回起動
        // if(_view && _draw && _cv && _cd){
        //     view = _view;
        //     draw = _draw;
        //     cv = _cv;
        //     cd = _cd;
        // }
        
        // パラメータなし
        if(canvasView && ctxView && canvasDraw && ctxDraw){
            // ctxView.fillStyle = 'white';
            // ctxView.fillRect(0, 0, canvasView.width, canvasView.height);
            // ctxDraw.fillStyle = 'white';
            // ctxDraw.fillRect(0, 0, canvasDraw.width, canvasDraw.height);
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
    const setPrev = ()=>{
        if(history.length > 0){
            let last = history.pop();
            if(last && ctxDraw && ctxView){
                ctxDraw.putImageData(last, 0, 0)
                ctxView.putImageData(last, 0, 0);
            }
        }
    }
    const download = (e: MouseEvent<HTMLAnchorElement>)=>{
        if(!canvasView){ return; }

        console.log('download');
        (e.target as HTMLAnchorElement).href = canvasView.toDataURL('image/jpeg'/*, 1.0*/);
    };
    return (<>
        <Grid container>
            <Grid item xs={6}>
                <p>canvas</p>
                <div>
                    {/* <button onClick={btn}>button</button> */}
                    {/* <Button onClick={btn} variant="outlined">Test</Button> */}
                    {/* <button onClick={()=>{clear();}}>clear</button> */}
                    <Button onClick={()=>{clear();}} variant="outlined" startIcon={<ClearIcon/>}>Clear</Button>
                    {/* <button onClick={()=>{setPrev();}}>←</button> */}
                    <Button onClick={()=>{setPrev();}} variant="outlined"><UndoIcon/></Button>
                    <a id="download" onClick={download}>DL（右クリック）</a>
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
                {/* <script></script> */}
            </Grid>
            <Grid item xs={6}>
                <p>view</p>
                <Grid container>
                    <Grid item xs={12}>
                        <TextField
                            id="text"
                            fullWidth
                            multiline
                            variant="outlined"
                            value={text}
                            // 直接入力用
                            onChange={(e)=>{
                                setText(e.target.value);
                                if(e.target.value!=''){setImgSrc(plantuml + plantUmlEncoder.encode(e.target.value));}
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <img src={imgSrc} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </>);
}
export default UmlDrawerComponent;