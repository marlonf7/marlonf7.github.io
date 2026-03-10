(function () {

const clientId = document.currentScript.getAttribute("data-client-id");
const API_URL = "https://receptionpoint-backend.vercel.app/api/chat";

let sessionId = null;

/* ---------- STYLES ---------- */

const style = document.createElement("style");
style.innerHTML = `

#rp-widget-button{
position:fixed;
bottom:20px;
right:20px;
width:60px;
height:60px;
border-radius:50%;
background:#2F6BFF;
color:white;
display:flex;
align-items:center;
justify-content:center;
font-size:26px;
cursor:pointer;
box-shadow:0 6px 18px rgba(0,0,0,0.2);
z-index:9999;
}

#rp-widget{
position:fixed;
bottom:90px;
right:20px;
width:320px;
height:440px;
background:white;
border-radius:14px;
box-shadow:0 10px 35px rgba(0,0,0,0.2);
display:none;
flex-direction:column;
overflow:hidden;
font-family:Arial, sans-serif;
z-index:9999;
}

#rp-header{
background:#2F6BFF;
color:white;
padding:12px;
font-weight:bold;
text-align:center;
}

#rp-messages{
flex:1;
padding:12px;
overflow-y:auto;
background:#F4F6F9;
display:flex;
flex-direction:column;
gap:10px;
}

.rp-row{
display:flex;
align-items:flex-end;
gap:6px;
}

.rp-user-row{
justify-content:flex-end;
}

.rp-avatar{
width:26px;
height:26px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:14px;
background:#E6EAF2;
}

.rp-user-avatar{
background:#2F6BFF;
color:white;
}

.rp-msg{
padding:8px 12px;
border-radius:10px;
max-width:70%;
font-size:14px;
line-height:1.4;
word-wrap:break-word;
}

.rp-user{
background:#2F6BFF;
color:white;
}

.rp-bot{
background:#E6EAF2;
color:#1F2A44;
}

.rp-link{
color:#2F6BFF;
font-weight:600;
text-decoration:underline;
}

#rp-input-area{
display:flex;
border-top:1px solid #eee;
}

#rp-input{
flex:1;
border:none;
padding:10px;
font-size:14px;
outline:none;
}

#rp-send{
background:#2F6BFF;
color:white;
border:none;
padding:0 16px;
cursor:pointer;
font-weight:bold;
}

#rp-send:hover{
background:#1c4ed8;
}

/* typing animation */

.rp-typing{
display:flex;
gap:4px;
padding:8px 12px;
background:#E6EAF2;
border-radius:10px;
}

.rp-dot{
width:6px;
height:6px;
background:#999;
border-radius:50%;
animation:rpblink 1.4s infinite;
}

.rp-dot:nth-child(2){animation-delay:0.2s}
.rp-dot:nth-child(3){animation-delay:0.4s}

@keyframes rpblink{
0%,80%,100%{opacity:0}
40%{opacity:1}
}

/* footer */

#rp-footer{
font-size:11px;
text-align:center;
padding:6px;
border-top:1px solid #eee;
background:white;
}

#rp-footer a{
color:#2F6BFF;
text-decoration:none;
font-weight:500;
}

#rp-footer a:hover{
text-decoration:underline;
}

`;

document.head.appendChild(style);

/* ---------- HTML ---------- */

const button = document.createElement("div");
button.id = "rp-widget-button";
button.innerHTML = "💬";

const widget = document.createElement("div");
widget.id = "rp-widget";

widget.innerHTML = `
<div id="rp-header">Chat with us</div>
<div id="rp-messages"></div>

<div id="rp-input-area">
<input id="rp-input" placeholder="Type a message..." />
<button id="rp-send">Send</button>
</div>

<div id="rp-footer">
Powered by <a href="https://receptionpoint.co.uk" target="_blank">ReceptionPoint</a>
</div>
`;

document.body.appendChild(button);
document.body.appendChild(widget);

/* ---------- ELEMENTS ---------- */

const messagesEl = document.getElementById("rp-messages");
const inputEl = document.getElementById("rp-input");
const sendBtn = document.getElementById("rp-send");

/* ---------- LINKIFY ---------- */

function linkify(text){
return text.replace(
/(https?:\/\/[^\s]+)/g,
'<a class="rp-link" href="$1" target="_blank">$1</a>'
);
}

/* ---------- ADD MESSAGE ---------- */

function addMessage(text,sender){

const row = document.createElement("div");
row.className = "rp-row";

if(sender==="user") row.classList.add("rp-user-row");

const avatar = document.createElement("div");
avatar.className = "rp-avatar";

if(sender==="user"){
avatar.classList.add("rp-user-avatar");
avatar.innerHTML="👤";
}else{
avatar.innerHTML="💬";
}

const msg = document.createElement("div");
msg.className = `rp-msg ${sender==="user"?"rp-user":"rp-bot"}`;

if(text.includes("<a ")) msg.innerHTML=text;
else msg.innerHTML=linkify(text);

if(sender==="user"){
row.appendChild(msg);
row.appendChild(avatar);
}else{
row.appendChild(avatar);
row.appendChild(msg);
}

messagesEl.appendChild(row);
messagesEl.scrollTop=messagesEl.scrollHeight;

}

/* ---------- TYPING ---------- */

let typingEl;

function showTyping(){

typingEl=document.createElement("div");
typingEl.className="rp-row";

typingEl.innerHTML=`
<div class="rp-avatar">💬</div>
<div class="rp-typing">
<div class="rp-dot"></div>
<div class="rp-dot"></div>
<div class="rp-dot"></div>
</div>
`;

messagesEl.appendChild(typingEl);
messagesEl.scrollTop=messagesEl.scrollHeight;

}

function hideTyping(){
if(typingEl) typingEl.remove();
}

/* ---------- SEND MESSAGE ---------- */

async function sendMessage(){

const text=inputEl.value.trim();
if(!text) return;

addMessage(text,"user");
inputEl.value="";

showTyping();

try{

const res=await fetch(API_URL,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
client_id:clientId,
message:text,
session_id:sessionId
})
});

const data=await res.json();

hideTyping();

if(data.session_id) sessionId=data.session_id;

addMessage(data.reply,"bot");

}catch(err){

hideTyping();
addMessage("Sorry — something went wrong.","bot");

}

}

/* ---------- EVENTS ---------- */

sendBtn.onclick=sendMessage;

inputEl.addEventListener("keypress",function(e){
if(e.key==="Enter") sendMessage();
});

button.onclick=()=>{

widget.style.display=
widget.style.display==="flex"
? "none"
: "flex";

};

/* ---------- WELCOME ---------- */

setTimeout(()=>{
addMessage("Hi! How can I help today?","bot");
},600);

})();
