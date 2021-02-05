(this["webpackJsonpxstate-react-typescript-template"]=this["webpackJsonpxstate-react-typescript-template"]||[]).push([[0],{24:function(t,e,n){},35:function(t,e,n){"use strict";n.r(e);var o=n(23),s=n(11),a=(n(24),n(7),n(20)),c=n(41),i=n(4),r=n(40),l=n(39);const p=Object(i.k)((t=>({type:"SPEAK",value:"Repainting to ".concat(t.recResult)})));function g(t){return Object(i.k)((e=>({type:"SPEAK",value:t})))}const b={initial:"init",states:{init:{on:{CLICK:"welcome"}},welcome:{initial:"prompt",on:{RECOGNISED:[{target:"stop",cond:t=>"stop"===t.recResult},{target:"repaint"}]},states:{prompt:{entry:g("Tell me the colour"),on:{ENDSPEECH:"ask"}},ask:{entry:Object(i.k)("LISTEN")}}},stop:{entry:g("Ok"),always:"init"},repaint:{initial:"prompt",states:{prompt:{entry:p,on:{ENDSPEECH:"repaint"}},repaint:{entry:"changeColour",always:"#root.dm.welcome"}}}}};var u=n(19),j=n(12);Object(l.a)({url:"https://statecharts.io/inspect",iframe:!1});const O=Object(c.a)({id:"root",type:"parallel",states:{dm:Object(s.a)({},b),asrtts:{initial:"idle",states:{idle:{on:{LISTEN:"recognising",SPEAK:{target:"speaking",actions:Object(i.b)(((t,e)=>({ttsAgenda:e.value})))}}},recognising:{entry:"recStart",exit:"recStop",on:{ASRRESULT:{actions:["recLogResult",Object(i.b)(((t,e)=>({recResult:e.value})))],target:".match"},RECOGNISED:"idle"},states:{match:{entry:Object(i.k)("RECOGNISED")}}},speaking:{entry:"ttsStart",on:{ENDSPEECH:"idle"}}}}}},{actions:{recLogResult:t=>{console.log("<< ASR: "+t.recResult)},test:()=>{console.log("test")},logIntent:t=>{console.log("<< NLU intent: "+t.nluData.intent.name)}}}),m=t=>{switch(!0){case t.state.matches({asrtts:"recognising"}):return Object(j.jsx)("button",Object(s.a)(Object(s.a)({type:"button",className:"glow-on-hover",style:{animation:"glowing 20s linear"}},t),{},{children:"Listening..."}));case t.state.matches({asrtts:"speaking"}):return Object(j.jsx)("button",Object(s.a)(Object(s.a)({type:"button",className:"glow-on-hover",style:{animation:"bordering 1s infinite"}},t),{},{children:"Speaking..."}));default:return Object(j.jsx)("button",Object(s.a)(Object(s.a)({type:"button",className:"glow-on-hover"},t),{},{children:"Click to start"}))}};function S(){const t=Object(u.useSpeechSynthesis)({onEnd:()=>{g("ENDSPEECH")}}),e=t.speak,n=t.cancel,s=(t.speaking,Object(u.useSpeechRecognition)({onResult:t=>{g({type:"ASRRESULT",value:t})}})),a=s.listen,c=(s.listening,s.stop),i=Object(r.b)(O,{devTools:!0,actions:{recStart:Object(r.a)((()=>{console.log("Ready to receive a color command."),a({interimResults:!1,continuous:!0})})),recStop:Object(r.a)((()=>{console.log("Recognition stopped."),c()})),changeColour:Object(r.a)((t=>{console.log("Repainting..."),document.body.style.background=t.recResult})),ttsStart:Object(r.a)(((t,n)=>{console.log("Speaking..."),e({text:t.ttsAgenda})})),ttsCancel:Object(r.a)(((t,e)=>{console.log("TTS STOP..."),n()}))}}),l=Object(o.a)(i,3),p=l[0],g=l[1];l[2];return Object(j.jsx)("div",{className:"App",children:Object(j.jsx)(m,{state:p,onClick:()=>g("CLICK")})})}const d=document.getElementById("root");a.render(Object(j.jsx)(S,{}),d)}},[[35,1,2]]]);
//# sourceMappingURL=main.cd6f0553.chunk.js.map