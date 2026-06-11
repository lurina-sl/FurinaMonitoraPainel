const API_URL =
    "https://presence-notify-production.up.railway.app";

const socket = io(API_URL, {
    transports: ["websocket"]
});

/* =========================
   ELEMENTOS
========================= */

const messages =
    document.getElementById("messages");

const guildSelect =
    document.getElementById("guildSelect");

const channelSelect =
    document.getElementById("channelSelect");

const textarea =
    document.getElementById("mensagemInput");

const statusDiv =
    document.getElementById("status");

const socketStatus =
    document.getElementById("socketStatus");

const pingElement =
    document.getElementById("botPing");

const totalMsgElement =
    document.getElementById("totalMessages");

const currentGuild =
    document.getElementById("currentGuild");

const currentChannel =
    document.getElementById("currentChannel");

/* =========================
   TOAST
========================= */

function toast(text, type = "success") {

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.textContent =
        text;

    document.body.appendChild(
        toast
    );

    setTimeout(() => {

        toast.classList.add(
            "show"
        );

    }, 50);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

/* =========================
   SOCKET
========================= */

socket.on("connect", () => {

    socketStatus.textContent =
        "Conectado";

    socketStatus.style.color =
        "#4eff87";

});

socket.on("disconnect", () => {

    socketStatus.textContent =
        "Desconectado";

    socketStatus.style.color =
        "#ff5b5b";

});

/* =========================
   STATUS
========================= */

async function carregarStatus() {

    try {

        const res =
            await fetch(
                `${API_URL}/api/status`
            );

        const data =
            await res.json();

        if (pingElement) {

            pingElement.textContent =
                `${data.ping}ms`;

        }

        if (totalMsgElement) {

            totalMsgElement.textContent =
                data.totalMensagens;
        }

    } catch (err) {

        console.error(err);

    }

}

setInterval(
    carregarStatus,
    5000
);

/* =========================
   SERVIDORES
========================= */

async function carregarServidores() {

    try {

        const resposta =
            await fetch(
                `${API_URL}/api/guilds`
            );

        const guilds =
            await resposta.json();

        guildSelect.innerHTML =
            "";

        guilds.forEach(guild => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                guild.id;

            option.textContent =
                `${guild.name} (${guild.members})`;

            guildSelect.appendChild(
                option
            );

        });

        if (guilds.length) {

            currentGuild.textContent =
                guilds[0].name;

            carregarCanais(
                guilds[0].id
            );

        }

    } catch (err) {

        console.error(err);

        toast(
            "Erro ao carregar servidores",
            "error"
        );

    }

}

/* =========================
   CANAIS
========================= */

async function carregarCanais(
    guildId
) {

    try {

        const resposta =
            await fetch(
                `${API_URL}/api/channels/${guildId}`
            );

        const canais =
            await resposta.json();

        channelSelect.innerHTML =
            "";

        canais.forEach(canal => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                canal.id;

            option.textContent =
                canal.name;

            channelSelect.appendChild(
                option
            );

        });

        if (canais.length) {

            currentChannel.textContent =
                canais[0].name;

        }

    } catch (err) {

        console.error(err);

    }

}

guildSelect.addEventListener(
    "change",
    () => {

        currentGuild.textContent =
            guildSelect.options[
                guildSelect.selectedIndex
            ].text;

        carregarCanais(
            guildSelect.value
        );

    }
);

channelSelect.addEventListener(
    "change",
    () => {

        currentChannel.textContent =
            channelSelect.options[
                channelSelect.selectedIndex
            ].text;

    }
);

/* =========================
   DEFINIR CANAL
========================= */

document
.getElementById(
    "definirCanalBtn"
)
.addEventListener(
    "click",
    async () => {

        try {

            await fetch(
                `${API_URL}/api/set-channel`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body:
                        JSON.stringify({
                            channelId:
                            channelSelect.value
                        })
                }
            );

            toast(
                "Canal definido com sucesso"
            );

        } catch {

            toast(
                "Erro ao definir canal",
                "error"
            );

        }

    }
);

/* =========================
   AUTO RESIZE
========================= */

textarea.addEventListener(
    "input",
    () => {

        textarea.style.height =
            "auto";

        textarea.style.height =
            textarea.scrollHeight +
            "px";

    }
);

/* =========================
   ENVIAR
========================= */

function enviarMensagem() {

    const mensagem =
        textarea.value.trim();

    if (!mensagem) return;

    socket.emit(
        "enviarParaDiscord",
        {
            mensagem
        }
    );

    textarea.value = "";

    textarea.style.height =
        "auto";

    toast(
        "Mensagem enviada"
    );

}

document
.getElementById(
    "enviarBtn"
)
.addEventListener(
    "click",
    enviarMensagem
);

textarea.addEventListener(
    "keydown",
    e => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            enviarMensagem();

        }

    }
);

/* =========================
   HISTÓRICO
========================= */

async function carregarHistorico() {

    try {

        const res =
            await fetch(
                `${API_URL}/api/history`
            );

        const data =
            await res.json();

        messages.innerHTML =
            "";

        data.forEach(
            adicionarMensagem
        );

    } catch (err) {

        console.error(err);

    }

}

/* =========================
   MENSAGENS
========================= */

function adicionarMensagem(
    data
) {

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "message new-message";

    div.innerHTML = `
        <img
            class="avatar"
            src="${data.avatar}"
        >

        <div class="message-body">

            <div class="message-top">

                <span class="message-author">
                    ${data.usuario}
                </span>

                <span class="message-time">
                    ${data.horario}
                </span>

            </div>

            <div class="message-content">
                ${data.conteudo}
            </div>

        </div>
    `;

    messages.appendChild(
        div
    );

    messages.scrollTop =
        messages.scrollHeight;

}

socket.on(
    "novaMensagem",
    adicionarMensagem
);

/* =========================
   ONLINE / OFFLINE
========================= */

socket.on(
    "online",
    data => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "status-online";

        div.innerHTML =
            `🟢 ${data.user}`;

        statusDiv.appendChild(
            div
        );

    }
);

socket.on(
    "offline",
    data => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "status-offline";

        div.innerHTML =
            `🔴 ${data.user}`;

        statusDiv.appendChild(
            div
        );

    }
);

/* =========================
   MODAL UPDATE
========================= */

const modal =
    document.getElementById(
        "updatesModal"
    );

document
.getElementById(
    "updatesBtn"
)
.onclick =
() => {

    modal.classList.add(
        "active"
    );

};

document
.getElementById(
    "closeModal"
)
.onclick =
() => {

    modal.classList.remove(
        "active"
    );

};

/* =========================
   CHANGELOG
========================= */

document
.getElementById(
    "copyUpdate"
)
.onclick =
async () => {

    const texto =
        document
        .getElementById(
            "updateEditor"
        )
        ?.value ||
        "";

    await navigator
        .clipboard
        .writeText(
            texto
        );

    toast(
        "Copiado"
    );

};

document
.getElementById(
    "sendUpdate"
)
.onclick =
() => {

    const texto =
        document
        .getElementById(
            "updateEditor"
        )
        ?.value ||
        "";

    socket.emit(
        "enviarParaDiscord",
        {
            mensagem:
                texto
        }
    );

    toast(
        "Atualização enviada"
    );

};

/* =========================
   LOGIN
========================= */

const loginBtn =
    document.getElementById(
        "loginBtn"
    );

if (loginBtn) {

    loginBtn.onclick =
    async () => {

        const senha =
            document.getElementById(
                "loginPassword"
            ).value;

        const res =
            await fetch(
                `${API_URL}/api/login`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body:
                        JSON.stringify({
                            senha
                        })
                }
            );

        if (
            res.ok
        ) {

            document
                .getElementById(
                    "loginScreen"
                )
                .remove();

            toast(
                "Login realizado"
            );

        } else {

            toast(
                "Senha incorreta",
                "error"
            );

        }

    };

}

/* =========================
   INIT
========================= */

carregarServidores();
carregarHistorico();
carregarStatus();
