import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import {motion,AnimatePresence} from "framer-motion";
import {Send,Plus,Paperclip,BookOpen,PanelLeftClose,Sun,Moon,Sparkles,ChevronRight} from "lucide-react";
import ReactMarkdown from "react-markdown";
import "./style.css";

const API="http://localhost:8000";
const initial={
 role:"assistant",
 content:"## Good morning 👋\n\nI'm **StudyMate**, your personal study partner. Ask me a concept, doubt, numerical, or paste a question — I'll suggest the next best learning actions.",
 actions:[
  {id:"simple",label:"Explain simply"},
  {id:"quiz",label:"Quiz me"},
  {id:"revision",label:"Start revision"},
  {id:"web",label:"Web sources"},
  {id:"books",label:"Books"}
 ]
};

function App(){
 const [msgs,setMsgs]=useState([initial]);
 const [text,setText]=useState("");
 const [loading,setLoading]=useState(false);
 const [dark,setDark]=useState(true);
 const [side,setSide]=useState(true);

 async function send(value=text){
   value=value.trim();
   if(!value||loading)return;
   setText("");
   setMsgs(m=>[...m,{role:"user",content:value}]);
   setLoading(true);
   try{
     const r=await fetch(API+"/api/chat",{
       method:"POST",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({
         message:value,
         history:msgs.slice(-10).map(x=>({role:x.role,content:x.content}))
       })
     });
     const d=await r.json();
     setMsgs(m=>[...m,{
       role:"assistant",
       content:d.answer||"I couldn't generate an answer.",
       actions:d.actions||[]
     }]);
   }catch(e){
     setMsgs(m=>[...m,{
       role:"assistant",
       content:"Backend isn't running yet. Start FastAPI on port 8000, then try again.",
       actions:[{id:"retry",label:"Try again"}]
     }]);
   }
   setLoading(false);
 }

 function action(a){send(a.label+" about the current topic.");}

 return <div className={dark?"app dark":"app"}>
  <AnimatePresence>
   {side&&<motion.aside initial={{x:-30,opacity:0}} animate={{x:0,opacity:1}}
     exit={{x:-30,opacity:0}} className="sidebar">
    <div className="brand"><div className="logo"><Sparkles size={17}/></div><b>StudyMate</b></div>
    <button className="newchat" onClick={()=>setMsgs([initial])}><Plus size={18}/> New chat</button>
    <div className="navtitle">RECENT</div>
    {["Electromagnetic induction","Integration doubts","Organic chemistry"].map(x=>
      <button className="recent" key={x}><BookOpen size={15}/>{x}</button>
    )}
    <div className="spacer"/>
    <div className="stats"><span>🔥 4 day streak</span><span>📚 12 topics</span></div>
    <button className="recent" onClick={()=>setDark(!dark)}>
      {dark?<Sun size={15}/>:<Moon size={15}/>} {dark?"Light mode":"Dark mode"}
    </button>
   </motion.aside>}
  </AnimatePresence>

  <main className="main">
   <header>
    <button className="iconbtn" onClick={()=>setSide(!side)}><PanelLeftClose size={19}/></button>
    <div className="headerTitle"><span>Study session</span><small>Open-weight AI • contextual learning</small></div>
    <div className="status"><i/> AI ready</div>
   </header>

   <section className="chat">
    {msgs.map((m,i)=>
      <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
        className={m.role==="user"?"row user":"row"}>
       <div className={m.role==="user"?"bubble userBubble":"bubble"}>
        <ReactMarkdown>{m.content}</ReactMarkdown>
       </div>
       {m.role==="assistant"&&m.actions?.length>0&&
        <div className="actions">
         {m.actions.map(a=>
          <motion.button whileHover={{y:-2,scale:1.015}} whileTap={{scale:.98}}
            key={a.id} onClick={()=>action(a)}>
            {a.label}<ChevronRight size={14}/>
          </motion.button>
         )}
        </div>
       }
      </motion.div>
    )}
    {loading&&<div className="typing"><span/><span/><span/> StudyMate is thinking…</div>}
   </section>

   <div className="composerWrap">
    <div className="composer">
     <button className="attach"><Paperclip size={19}/></button>
     <textarea value={text}
       onChange={e=>setText(e.target.value)}
       onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}}
       placeholder="Ask StudyMate anything…"/>
     <button className="send" onClick={()=>send()}><Send size={18}/></button>
    </div>
    <div className="hint">Enter to send • Shift + Enter for a new line • StudyMate can make mistakes</div>
   </div>
  </main>
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);
