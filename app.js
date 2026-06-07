const LINK_DO_BOT_RAILWAY =
"https://presence-notify.up.railway.app";

const socket = io(LINK_DO_BOT_RAILWAY);

// ==================== ELEMENTOS ====================

const input = document.getElementById("mensagemInput");
const enviarBtn = document.getElementById("enviarBtn");

const messages =
document.getElementById("messages");

// ==================== ABAS ====================

function abrirChat() {

    document.getElementById("chatPage")
        .style.display = "block";

    document.getElementById("voicePage")
        .style.display = "none";

}

function abrirVoice() {

    document.getElementById("chatPage")
        .style.display = "none";

    document.getElementById("voicePage")
        .style.display = "block";

}

// ==================== ENVIAR MENSAGEM ====================

function enviarMensagem() {

    const texto = input.value;

    if (!texto.trim()) return;

    socket.emit("enviarParaDiscord", {
        mensagem: texto
    });

    input.value = "";

}

enviarBtn.addEventListener(
    "click",
    enviarMensagem
);

input.addEventListener(
    "keypress",
    (e) => {

        if (e.key === "Enter") {
            enviarMensagem();
        }

    }
);

// ==================== RECEBER MENSAGENS ====================

socket.on("novaMensagem", (msg) => {

    const div =
        document.createElement("div");

    div.className = "message";

    div.innerHTML = `
        <div style="
            display:flex;
            gap:10px;
            align-items:flex-start;
        ">

            <img
                src="${msg.avatar}"
                width="40"
                height="40"
                style="
                    border-radius:50%;
                    object-fit:cover;
                "
            >

            <div>
                <b>${msg.usuario}</b>
                <small style="opacity:.7;">
                    ${msg.horario}
                </small>
                <br>
                ${msg.conteudo}
            </div>

        </div>
    `;

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;

});

// ==================== CALL ====================

const joinBtn =
document.getElementById("joinVoice");

const leaveBtn =
document.getElementById("leaveVoice");

const speakBtn =
document.getElementById("speakBtn");

joinBtn.addEventListener("click", () => {

    socket.emit("joinVoice", {
        channelId:
        document.getElementById("voiceChannel")
            .value
    });

});

leaveBtn.addEventListener("click", () => {

    socket.emit("leaveVoice");

});

speakBtn.addEventListener("click", () => {

    const texto =
        document.getElementById("ttsText")
            .value;

    if (!texto.trim()) return;

    socket.emit("ttsSpeak", {
        texto
    });

});

// ==================== CONEXÃO ====================

socket.on("connect", () => {

    console.log(
        "✅ Conectado ao bot"
    );

});

socket.on("disconnect", () => {

    console.log(
        "❌ Desconectado do bot"
    );

});
