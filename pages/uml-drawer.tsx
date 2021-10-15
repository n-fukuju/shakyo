import { FC, useEffect, useState, MouseEvent, TouchEvent } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import ClearIcon from '@material-ui/icons/Clear';
import UndoIcon from '@material-ui/icons/Undo';
import CreateIcon from '@material-ui/icons/Create';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import NativeSelect from '@material-ui/core/NativeSelect';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import * as tfjs from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';
import pptxgen from 'pptxgenjs';
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
    const [doExec, setDoExec] = useState(true);
    const [selectedDiagram, setSelectedDiagram] = useState('architecture');

    /** 描画中フラグ */
    // let dragging=false;
    const [dragging, setDragging] = useState(false);
    /** 合成表示用のキャンバス */
    // let canvasView:HTMLCanvasElement;
    const [canvasView, setCanvasView] = useState<HTMLCanvasElement>();
    /** 描画用のキャンバス（非表示） */
    // let canvasDraw:HTMLCanvasElement;
    const [canvasDraw, setCanvasDraw] = useState<HTMLCanvasElement>();
    /** SVG貼り付け用のキャンバス */
    const [canvasSvg, setCanvasSvg] = useState<HTMLCanvasElement>();
    /** 2Dコンテキスト */
    // let ctxView:CanvasRenderingContext2D;
    const [ctxView, setCtxView] = useState<CanvasRenderingContext2D>();
    /** 2Dコンテキスト */
    // let ctxDraw:CanvasRenderingContext2D;
    const [ctxDraw, setCtxDraw] = useState<CanvasRenderingContext2D>();
    /** 2Dコンテキスト */
    const [ctxSvg, setCtxSvg] = useState<CanvasRenderingContext2D>();
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
    /** 最後の検出結果 */
    const [lastDetects, setLastDetects] = useState<Detection[]>([]);
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
    const sequenceClasses:{[name:string]:any} = {
        '1': {name: 'participant'},
        '2': {name: 'actor'},
        '3': {name: 'actor_with_label'},
        '4': {name: 'database'},
        '5': {name: 'database_with_label'},
        '6': {name: 'lifeline'},
        '7': {name: 'arow_right'},
        '8': {name: 'arrow_right_with_label'},
        '9': {name: 'arrow_left'},
        '10':{name: 'arrow_left_with_label'},
        '11':{name: 'arrow_self'},
        '12':{name: 'arrow_self_with_label'},
    };
    const archiClasses:{[name:string]:any} = {
        '1': {name: 'arrow_right', width:100, height:100, path:'images/arrow_right.svg'},
        '2': {name: 'arrow_left', width:100, height:100, path:'images/arrow_left.svg'},
        '3': {name: 'arrow_up', width:100, height:100, path:'images/arrow_up.svg'},
        '4': {name: 'arrow_down', width:100, height:100, path:'images/arrow_down.svg'},
        '5': {name: 'arrow_right_up', width:100, height:100, path:'images/arrow_right_up.svg'},
        '6': {name: 'arrow_right_down', width:100, height:100, path:'images/arrow_right_down.svg'},
        '7': {name: 'arrow_left_up', width:100, height:100, path:'images/arrow_left_up.svg'},
        '8': {name: 'arrow_left_down', width:100, height:100, path:'images/arrow_left_down.svg'},

        '9': {name: 'user', width:100, height:100, path:'images/user.svg'},
        '10': {name: 'server', width:100, height:100, path:'images/server.svg'},
        '11': {name: 'database', width:100, height:100, path:'images/database.svg'},

        '21': {name: 'number_1', width:100, height:100, path:'images/'},
        '22': {name: 'number_2', width:100, height:100, path:'images/'},
        '23': {name: 'number_3', width:100, height:100, path:'images/'},
        '24': {name: 'number_4', width:100, height:100, path:'images/'},
        '25': {name: 'number_5', width:100, height:100, path:'images/'},
        '26': {name: 'number_6', width:100, height:100, path:'images/'},
        '27': {name: 'number_7', width:100, height:100, path:'images/'},
        '28': {name: 'number_8', width:100, height:100, path:'images/'},
        '29': {name: 'number_9', width:100, height:100, path:'images/'},
        '30': {name: 'number_10', width:100, height:100, path:'images/'},
    }
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

                // ためしにSVG描画
                // let view2 = document.getElementById('canvas2') as HTMLCanvasElement;
                // const cv2 = view2.getContext('2d');
                // ディスプレイ密度を考慮したサイズ
                // let scale = window.devicePixelRatio;
                // view2.width = 500*scale;
                // view2.height= 500*scale;

                // const img = new Image();
                // img.src= "/images/user.svg";
                // img.onload = () => cv2?.drawImage(img, 0, 0);
            }catch(e){
                console.log(e);
            }
        }
    });

    /** モデルのパスを取得する */
    const getModelPath = (diagram:string)=>{
        let model = 'tfjs_models/web_model/model.json';
        if(diagram == 'sequence'){ model = 'tfjs_models/seq_model/model.json'}
        if(diagram == 'architecture'){ model = 'tfjs_models/arc_model/model.json'}
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
        if(!doExec){ return }

        // 検出結果クリア
        setLastDetects([]);

        if(selectedDiagram == 'usecase'){
            executeUsecase();
        } else if(selectedDiagram == 'sequence'){
            const seqs = await getDetections(3,7,1);
            console.log(seqs);
            drawPredictions(seqs, sequenceClasses);
        } else if(selectedDiagram == 'architecture'){
            const arcs = await getDetections(5,4,6);
            console.log(arcs);
            drawPredictions(arcs, archiClasses);
            drawArchitecture(arcs, archiClasses);
            setLastDetects(arcs);
        }
    }
    const executeUsecase = async()=>{
        if(!doExec){ return; }
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

        convertUsecase(detections);
    };
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
        if(!ctxSvg || !canvasSvg){ return; }
        ctxSvg.clearRect(0,0, canvasSvg.width, canvasSvg.height);
        for(const detection of detections){
            const className = (classes[detection.cls])? classes[detection.cls].name: 'unknown';
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
    /** 検出結果をテキストに変換する */
    const convertUsecase = async(detections:Detection[])=>{
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
    /** .pptx ファイルの作成 */
    const genPptx = ()=>{
        let pres = new pptxgen();
        let slide = pres.addSlide();
        // slide.addText('Hello world.', {x:1, y:1, color: "363636"});
        // 1が、画像の100px分程度。横1000程度、縦560程度
        // canvas が 500x500 なので、1/100 でよさそう。
        // slide.addImage({path:'images/user.svg'});
        // slide.addImage({path:'images/server.svg', x:1,y:1});
        // slide.addImage({path:'images/database.svg', x:2,y:2});
        // slide.addImage({path:'images/user.svg', x:3,y:3});
        // slide.addImage({path:'images/server.svg', x:4,y:4});
        // slide.addImage({path:'images/database.svg', x:5,y:5});
        // slide.addImage({path:'images/user.svg', x:6,y:1});
        // slide.addImage({path:'images/server.svg', x:7,y:2});
        // slide.addImage({path:'images/database.svg', x:8,y:3});

        for(const detect of lastDetects){
            const icon = getIconPath(detect.cls, archiClasses);
            // TODO 画像サイズを定義
            const size = 100;
            if(icon!=''){
                let x = (detect.x + (detect.width/2) - (size/2)) / 100;
                let y = (detect.y + (detect.height/2) - (size/2)) / 100;
                slide.addImage({path:icon, x:x, y:y});
            }
        }

        pres.writeFile();
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
                    <FormControlLabel
                        control={<Checkbox checked={doExec} onChange={(e)=>{setDoExec(e.target.checked)}}/>}
                        label="exec()"/>
                    <NativeSelect
                        value={selectedDiagram}
                        onChange={(e)=>{
                            setSelectedDiagram(e.target.value);
                            tfjs.setBackend('webgl');
                            // let model = 'tfjs_models/web_model/model.json';
                            // if(e.target.value == 'sequence'){ model = 'tfjs_models/seq_model/model.json'}
                            // if(e.target.value == 'architecture'){ model = 'tfjs_models/arc_model/model.json'}
                            let model = getModelPath(e.target.value);
                            loadGraphModel(model).then(m=>setModel(m));
                        }}
                    >
                        <option value={"usecase"}>Usecase</option>
                        <option value={"sequence"}>Sequence</option>
                        <option value={"architecture"}>architecture</option>
                    </NativeSelect>
                    {/* <a id="download" onClick={download}>DL（右クリック）</a> */}
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
                <p>canvas2</p>
                <canvas id="canvas2" width="500" height="500" style={{border:"1px solid black"}}/>
            </Grid>
        </Grid>
    </>);
}
export default UmlDrawerComponent;