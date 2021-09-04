import { FC, useEffect, useState, MouseEvent, TouchEvent } from 'react';
import * as tfjs from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';

interface Pos{
    x:number;
    y:number;
}

const UmlDrawerComponent: FC=()=>{
    /** 描画中フラグ */
    let dragging=false;
    /** 合成表示用のキャンバス */
    let canvasView:HTMLCanvasElement;
    /** 描画用のキャンバス（非表示） */
    let canvasDraw:HTMLCanvasElement;
    /** 2Dコンテキスト */
    let ctxView:CanvasRenderingContext2D;
    /** 2Dコンテキスト */
    let ctxDraw:CanvasRenderingContext2D;
    /** 描画の履歴 */
    let history:ImageData[]=[];
    /** オブジェクト検出モデル */
    let model:tfjs.GraphModel;
    /** 描画開始座標 */
    let startPos:Pos={x:0,y:0};
    /** 描画中の直前の座標 */
    let prevPos:Pos={x:0,y:0};
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
    useEffect(()=>{
        try{
            canvasView = document.getElementById('canvas') as HTMLCanvasElement;
            canvasDraw = document.createElement('canvas');
            [canvasDraw.width, canvasDraw.height] = [canvasView.width, canvasView.height];
            const cv = canvasView.getContext('2d');
            if(cv){ ctxView = cv; }
            const cd = canvasDraw.getContext('2d');
            if(cd){ ctxDraw = cd; }
            clear();
            // モデルの読み込み
            tfjs.setBackend('webgl');
            loadGraphModel('tfjs_models/web_model/model.json').then( m=> model = m );
        }catch(e){
            console.log(e);
        }
    });

    /** 描画開始 */
    const start = (pageX:number, pageY:number)=>{
        dragging=true;
        ctxView.strokeStyle = 'black';
        ctxView.lineWidth = 1;
        ctxDraw.strokeStyle = 'black';
        ctxDraw.lineWidth = 1;
        startPos = getPos(pageX, pageY);
        prevPos = startPos;
        // history.push(ctxView.getImageData(0,0, canvasView.width, canvasView.height));
        history.push(ctxDraw.getImageData(0, 0, canvasDraw.width, canvasDraw.height));
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
            prevPos = pos;
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
        dragging=false;
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
        return {
            x: x - canvasView.getBoundingClientRect().left,
            y: y - canvasView.getBoundingClientRect().top
        };
    }
    /** 処理 */
    const execute = async()=>{
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



        const detections:any[]=[];
        scores[0].forEach((score,i)=>{
            if(score>thresold){
                const bbox = [];
                const minY = boxes[0][i][0] as number * canvasView.height;
                const minX = boxes[0][i][1] as number * canvasView.width;
                const maxY = boxes[0][i][2] as number * canvasView.height;
                const maxX = boxes[0][i][3] as number * canvasView.width;
                bbox[0] = minX;
                bbox[1] = minY;
                bbox[2] = maxX - minX;
                bbox[3] = maxY - minY;
                // TODO クラス化
                detections.push({
                    class: classes[i],
                    score: score.toFixed(4),
                    bbox: bbox
                });
            }
        });
        // console.log('detections: ', detections);
        // 推論による検出結果をキャンバスに描画する
        for(const detection of detections){
            const x = detection.bbox[0];
            const y = detection.bbox[1];
            const width = detection.bbox[2];
            const height = detection.bbox[3];
            ctxView.strokeStyle = '#00FF00';
            ctxView.strokeRect(x, y, width, height);
            ctxView.font = '21px serif';
            ctxView.fillStyle = '#00FF00';
            const className = usecaseClasses[detection.class].name;
            const score = (detection.score * 100).toFixed(2);
            ctxView.fillText(`${detection.class}: ${className}, ${score} %`, x,y);
        }
    };
    const btn = ()=>{
        // 動作確認ボタン
        const img = new Image();
        img.src = 'temp/usecase_h06.png';
        img.onload = ()=>{
            if(!ctxView){return;}
            canvasView.width = img.width;
            canvasView.height = img.height;
            ctxView.drawImage(img, 0, 0);
            execute();
        };

        console.log(canvasView.toDataURL('image/svg+xml'));
    };
    const clear = ()=>{
        ctxView.fillStyle = 'white';
        ctxView.fillRect(0, 0, canvasView.width, canvasView.height);
        ctxDraw.fillStyle = 'white';
        ctxDraw.fillRect(0, 0, canvasDraw.width, canvasDraw.height);
    };
    const setPrev = ()=>{
        if(history.length > 0){
            let last = history.pop();
            if(last){
                ctxView.putImageData(last, 0, 0);
            }
        }
    }
    const download = (e: MouseEvent<HTMLAnchorElement>)=>{
        console.log('download');
        (e.target as HTMLAnchorElement).href = canvasView.toDataURL('image/jpeg'/*, 1.0*/);
    };
    return (<>
        <p>canvas</p>
        <div>
            <button onClick={btn}>button</button>
            <button onClick={()=>{clear();}}>clear</button>
            <button onClick={()=>{setPrev();}}>←</button>
            <a id="download" onClick={download}>DL（右クリック）</a>
        </div>
        <canvas id="canvas" width="500" height="500" onMouseDown={mouseDown} onMouseMove={mouseMove} onMouseUp={mouseUp} onTouchStart={touchStart} onTouchMove={touchMove} onTouchEnd={touchEnd} onTouchCancel={touchCancel} style={{border:"1px solid black"}}></canvas>
        <script></script>
    </>);
}
export default UmlDrawerComponent;