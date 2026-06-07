const LINK_DO_BOT_RAILWAY =
"presence-notify.up.railway.app";

const socket = io(LINK_DO_BOT_RAILWAY);

const input = document.getElementById("mensagemInput");
const enviarBtn = document.getElementById("enviarBtn");

const messages =
document.getElementById("messages");

function abrirChat(){

document.getElementById("chatPage")
.style.display = "block";

document.getElementById("voicePage")
.style.display = "none";

}

function abrirVoice(){

document.getElementById("chatPage")
.style.display = "none";

document.getElementById("voicePage")
.style.display = "block";

}

function enviarMensagem(){

const texto = input.value;

if(!texto.trim()) return;

socket.emit("enviarParaDiscord",{
    mensagem:texto
});

input.value = "";

}

enviarBtn.addEventListener(
"click",
enviarMensagem
);

input.addEventListener(
"keypress",
e=>{
    if(e.key==="Enter")
        enviarMensagem();
}
);

socket.on("novaMensagem", msg => {

const div =
document.createElement("div");

div.className = "message";

div.innerHTML = `
<b>${msg.usuario}</b><br>
${msg.conteudo}
`;

messages.appendChild(div);

messages.scrollTop =
messages.scrollHeight;

});

document
.getElementById("joinVoice")
.addEventListener("click",()=>{

socket.emit("joinVoice",{
channelId:
document.getElementById("voiceChannel")
.value
});

});

document
.getElementById("leaveVoice")
.addEventListener("click",()=>{

socket.emit("leaveVoice");

});

document
.getElementById("speakBtn")
.addEventListener("click",()=>{

socket.emit("ttsSpeak",{

texto:
document.getElementById("ttsText")
.value

});

});
