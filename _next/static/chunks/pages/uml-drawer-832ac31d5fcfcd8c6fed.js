(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[467],{5744:function(t,e,n){"use strict";n.r(e);var i=n(5893),r=n(7757),h=n.n(r),o=n(2137),a=n(6610),s=n(5991),c=n(7294),u=n(3642),l=n(282),f=n(5996),d=n(9446),g=n(4540),x=n(3098),y=n(6575),w=n(553),v=n(4436),p=n(74),m=n(7162),b=n(2571),k=n(7443),j=n(7320),_=n.n(j),S=n(1018),Z=n.n(S);function T(t,e){var n;if("undefined"===typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(n=function(t,e){if(!t)return;if("string"===typeof t)return C(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return C(t,e)}(t))||e&&t&&"number"===typeof t.length){n&&(t=n);var i=0,r=function(){};return{s:r,n:function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}},e:function(t){throw t},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var h,o=!0,a=!1;return{s:function(){n=t[Symbol.iterator]()},n:function(){var t=n.next();return o=t.done,t},e:function(t){a=!0,h=t},f:function(){try{o||null==n.return||n.return()}finally{if(a)throw h}}}}function C(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,i=new Array(e);n<e;n++)i[n]=t[n];return i}var I="http://www.plantuml.com/plantuml/img/",E=function(){function t(e,n,i,r,h,o){var s=arguments.length>6&&void 0!==arguments[6]?arguments[6]:"";(0,a.Z)(this,t),this.cls=e,this.score=n,this.x=i,this.y=r,this.width=h,this.height=o,this.ref=s}return(0,s.Z)(t,[{key:"collision",value:function(t){return this.x<t.x+t.width&&this.x+this.width>t.width&&this.y<t.y+t.height&&this.y+this.height>t.y}},{key:"top",value:function(){return{x:this.x,y:this.y,width:this.width,height:0}}},{key:"top2",value:function(){return{x:this.x,y:this.y-this.height,width:this.width,height:this.height}}},{key:"bottom",value:function(){return{x:this.x,y:this.y+this.height,width:this.width,height:0}}},{key:"bottom2",value:function(){return{x:this.x,y:this.y+this.height+this.height,width:this.width,height:this.height}}},{key:"right",value:function(){return{x:this.x+this.width,y:this.y,width:0,height:this.height}}},{key:"right2",value:function(){return{x:this.x+this.width,y:this.y,width:this.width,height:this.height}}},{key:"left",value:function(){return{x:this.x,y:this.y,width:0,height:this.height}}},{key:"left2",value:function(){return{x:this.x-this.width,y:this.y,width:this.width,height:this.height}}},{key:"rightTop",value:function(){return{x:this.x+this.width/2,y:this.y,width:this.width/2,height:this.height/2}}},{key:"rightTop2",value:function(){return{x:this.x+this.width/2,y:this.y-this.y/2,width:this.width,height:this.height}}},{key:"rightBottom",value:function(){return{x:this.x+this.width/2,y:this.y+this.y/2,width:this.width/2,height:this.height/2}}},{key:"rightBottom2",value:function(){return{x:this.x+this.width/2,y:this.y+this.y/2,width:this.width,height:this.height}}},{key:"leftTop",value:function(){return{x:this.x,y:this.y,width:this.width/2,height:this.height/2}}},{key:"leftTop2",value:function(){return{x:this.x-this.width/2,y:this.y-this.height/2,width:this.width,height:this.height}}},{key:"leftBottom",value:function(){return{x:this.x,y:this.y+this.height/2,width:this.width/2,height:this.height/2}}},{key:"leftBottom2",value:function(){return{x:this.x-this.width/2,y:this.y+this.height/2,width:this.width,height:this.height}}}]),t}();e.default=function(){var t=(0,c.useState)(!1),e=t[0],n=t[1],r=(0,c.useState)("brush"),a=r[0],s=r[1],j=(0,c.useState)(""),S=j[0],C=j[1],D=(0,c.useState)(""),A=D[0],B=D[1],F=(0,c.useState)(!1),X=F[0],M=F[1],N=(0,c.useState)(),R=N[0],O=N[1],Y=(0,c.useState)(),P=Y[0],L=Y[1],U=(0,c.useState)(),W=U[0],z=U[1],Q=(0,c.useState)(),$=Q[0],q=Q[1],G=(0,c.useState)([]),H=G[0],J=G[1],K=(0,c.useState)(),V=K[0],tt=K[1],et=(0,c.useState)({x:0,y:0}),nt=(et[0],et[1]),it=(0,c.useState)({x:0,y:0}),rt=it[0],ht=it[1],ot={1:{name:"usecase"},2:{name:"actor"},3:{name:"actor_with_label"},4:{name:"rectangle"},5:{name:"rectangle_with_label"},6:{name:"note"},7:{name:"arrow_right"},8:{name:"arrow_left"},9:{name:"arrow_up"},10:{name:"arrow_down"},11:{name:"arrow_right_up"},12:{name:"arrow_right_down"},13:{name:"arrow_left_up"},14:{name:"arrow_left_down"}},at=[7,8,9,10,11,12,13,14];(0,c.useEffect)((function(){if(!e){console.log("constructor");try{var t=document.getElementById("canvas"),i=document.createElement("canvas"),r=[t.width,t.height];i.width=r[0],i.height=r[1],O(t),L(i);var h=t.getContext("2d");h&&z(h);var o=i.getContext("2d");o&&q(o),xt(t,i,h,o),b.CQI("webgl"),(0,k.YL)("tfjs_models/web_model/model.json").then((function(t){return tt(t)})),n(!0)}catch(a){console.log(a)}}}));var st=function(t,e){if(W&&$&&P){M(!0),"brush"===a?($.strokeStyle="black",$.lineWidth=1):"eraser"===a&&($.strokeStyle="white",$.lineWidth=20);var n=lt(t,e);nt(n),ht(n),H.push($.getImageData(0,0,P.width,P.height))}},ct=function(t,e){if(X){if(!$||!W||!R)return;var n=lt(t,e);$.beginPath(),$.moveTo(rt.x,rt.y),$.lineTo(n.x,n.y),$.stroke(),W.putImageData($.getImageData(0,0,R.width,R.height),0,0),ht(n)}},ut=function(){M(!1),ft()},lt=function(t,e){var n={x:0,y:0};return R&&(n={x:t-R.getBoundingClientRect().left,y:e-R.getBoundingClientRect().top}),n},ft=function(){var t=(0,o.Z)(h().mark((function t(){var e,n,i,r,o,a,s,c,u,l,f,d;return h().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(R&&W&&V){t.next=2;break}return t.abrupt("return");case 2:return e=b.Xhn.fromPixels(R),n=e.toInt().transpose([0,1,2]).expandDims(),t.next=6,V.executeAsync(n);case 6:for(i=t.sent,Array.isArray(i)||(i=[i]),r=i[1].arraySync(),o=i[2].arraySync(),a=i[5].dataSync(),s=[],o[0].forEach((function(t,e){if(t>.5){var n=r[0][e][0]*R.height,i=r[0][e][1]*R.width,h=r[0][e][2]*R.height,o=r[0][e][3]*R.width;s.push(new E(a[e],t.toFixed(4),i,n,o-i,h-n))}})),c=0,u=s;c<u.length;c++)l=u[c],W.strokeStyle="#00FF00",W.strokeRect(l.x,l.y,l.width,l.height),W.font="21px serif",W.fillStyle="#00FF00",f=ot[l.cls].name,d=(100*Number(l.score)).toFixed(2),W.fillText("".concat(l.cls,": ").concat(f,", ").concat(d," %"),l.x,l.y);dt(s);case 15:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}(),dt=function(){var t=(0,o.Z)(h().mark((function t(e){var n,i,r,o,a,s,c,u,l,f,d,g,x,y;return h().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:n="",i=T(e),t.prev=2,i.s();case 4:if((r=i.n()).done){t.next=35;break}if(1!=(o=r.value).cls){t.next=14;break}return a=null===$||void 0===$?void 0:$.getImageData(o.x,o.y,o.width,o.height),t.next=10,gt(a);case 10:return s=t.sent,o.ref="(".concat(s,")"),n+="".concat(o.ref,"\n"),t.abrupt("continue",33);case 14:if(2!=o.cls){t.next=18;break}return o.ref=":actor:",n+="".concat(o.ref,"\n"),t.abrupt("continue",33);case 18:if(!at.indexOf(o.cls)){t.next=33;break}if(c=null,u=null,!(o.cls=7)){t.next=27;break}l=T(e);try{for(l.s();!(f=l.n()).done;)((d=f.value).collision(o.right())||d.collision(o.right2()))&&(u=d),(d.collision(o.left())||d.collision(o.left2()))&&(c=d)}catch(h){l.e(h)}finally{l.f()}if(!c||""===c.ref||!u||""===u.ref){t.next=27;break}return n+="".concat(c.ref," --\x3e ").concat(u.ref,"\n"),t.abrupt("break",35);case 27:if(!(o.cls=9)){t.next=33;break}g=T(e);try{for(g.s();!(x=g.n()).done;)((y=x.value).collision(o.top())||y.collision(o.top2()))&&(u=y),(y.collision(o.bottom())||y.collision(o.bottom2()))&&(c=y)}catch(h){g.e(h)}finally{g.f()}if(!c||""===c.ref||!u||""===u.ref){t.next=33;break}return n+="".concat(c.ref," --\x3e ").concat(u.ref,"\n"),t.abrupt("break",35);case 33:t.next=4;break;case 35:t.next=40;break;case 37:t.prev=37,t.t0=t.catch(2),i.e(t.t0);case 40:return t.prev=40,i.f(),t.finish(40);case 43:C(n),""!=n&&B(I+Z().encode(n));case 45:case"end":return t.stop()}}),t,null,[[2,37,40,43]])})));return function(e){return t.apply(this,arguments)}}(),gt=function(){var t=(0,o.Z)(h().mark((function t(e){var n,i,r,o;return h().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(P&&e){t.next=2;break}return t.abrupt("return");case 2:return(n=document.createElement("canvas")).width=e.width,n.height=e.height,null===(i=n.getContext("2d"))||void 0===i||i.putImageData(e,0,0),t.next=9,_().recognize(n,"eng");case 9:return r=t.sent,o=r.data.text,t.abrupt("return",o.replace(/[\n\(\)]/g,""));case 12:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),xt=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null;R&&W&&P&&$&&(t=R,e=P,n=W,i=$),t&&e&&n&&i&&(n.fillStyle="white",n.fillRect(0,0,t.width,t.height),i.fillStyle="white",i.fillRect(0,0,e.width,e.height)),J([])};return(0,i.jsx)(i.Fragment,{children:(0,i.jsxs)(u.Z,{container:!0,children:[(0,i.jsxs)(u.Z,{item:!0,xs:6,children:[(0,i.jsx)("p",{children:"canvas"}),(0,i.jsxs)("div",{children:[(0,i.jsx)(l.Z,{onClick:function(){xt()},variant:"outlined",startIcon:(0,i.jsx)(f.Z,{}),children:"Clear"}),(0,i.jsx)(l.Z,{onClick:function(){!function(){if(H.length>0){var t=H.pop();t&&$&&W&&($.putImageData(t,0,0),W.putImageData(t,0,0))}}()},variant:"outlined",children:(0,i.jsx)(d.Z,{})}),(0,i.jsx)("a",{id:"download",onClick:function(t){R&&(console.log("download"),t.target.href=R.toDataURL("image/jpeg"))},children:"DL\uff08\u53f3\u30af\u30ea\u30c3\u30af\uff09"}),(0,i.jsx)(v.Z,{component:"fieldset",children:(0,i.jsxs)(m.Z,{row:!0,children:[(0,i.jsx)(w.Z,{label:"brush",control:(0,i.jsx)(p.Z,{value:"brush",checked:"brush"===a,onClick:function(){s("brush")},color:"primary",icon:(0,i.jsx)(g.Z,{color:"disabled"}),checkedIcon:(0,i.jsx)(g.Z,{})})}),(0,i.jsx)(w.Z,{value:"eraser",label:"eraser",control:(0,i.jsx)(p.Z,{value:"eraser",checked:"eraser"===a,onClick:function(){s("eraser")},color:"secondary",icon:(0,i.jsx)(x.Z,{color:"disabled"}),checkedIcon:(0,i.jsx)(x.Z,{})})})]})})]}),(0,i.jsx)("canvas",{id:"canvas",width:"500",height:"500",onMouseDown:function(t){st(t.pageX,t.pageY)},onMouseMove:function(t){ct(t.pageX,t.pageY)},onMouseUp:function(t){ut()},onTouchStart:function(t){t.changedTouches.length>0&&st(t.changedTouches[0].pageX,t.changedTouches[0].pageY)},onTouchMove:function(t){t.changedTouches.length>0&&ct(t.changedTouches[0].pageX,t.changedTouches[0].pageY)},onTouchEnd:function(t){ut()},onTouchCancel:function(t){ut()},style:{border:"1px solid black"}})]}),(0,i.jsxs)(u.Z,{item:!0,xs:6,children:[(0,i.jsx)("p",{children:"view"}),(0,i.jsxs)(u.Z,{container:!0,children:[(0,i.jsx)(u.Z,{item:!0,xs:12,children:(0,i.jsx)(y.Z,{id:"text",fullWidth:!0,multiline:!0,variant:"outlined",value:S,onChange:function(t){C(t.target.value),""!=t.target.value&&B(I+Z().encode(t.target.value))}})}),(0,i.jsx)(u.Z,{item:!0,xs:12,children:(0,i.jsx)("img",{src:A})})]})]})]})})}},7377:function(t,e,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/uml-drawer",function(){return n(5744)}])},5410:function(){},8628:function(){},1601:function(){},7792:function(){},5042:function(){}},function(t){t.O(0,[774,447,127,57,971,888,179],(function(){return e=7377,t(t.s=e);var e}));var e=t.O();_N_E=e}]);