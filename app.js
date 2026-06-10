const API_URL =
    "presence-notify-production.up.railway.app";

const socket =
    io(API_URL);

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

/* STATUS SOCKET */

socket.on("connect", () => {

    document.getElementById(
        "socketStatus"
    ).textContent =
        "Conectado";

});

socket.on("disconnect", () => {

    document.getElementById(
        "socketStatus"
    ).textContent =
        "Desconectado";

});

/* SERVIDORES */

async function carregarServidores() {

    try {

        const resposta =
            await fetch(
                `${API_URL}/api/guilds`
            );

        const guilds =
            await resposta.json();

        guildSelect.innerHTML = "";

        guilds.forEach(guild => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                guild.id;

            option.textContent =
                guild.name;

            guildSelect.appendChild(
                option
            );

        });

        if (guilds.length) {

            carregarCanais(
                guilds[0].id
            );

        }

    } catch (err) {

        console.error(err);

    }

}

/* CANAIS */

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

    } catch (err) {

        console.error(err);

    }

}

guildSelect.addEventListener(
    "change",
    () => {

        carregarCanais(
            guildSelect.value
        );

    }
);

/* DEFINIR CANAL */

document
.getElementById(
    "definirCanalBtn"
)
.addEventListener(
    "click",
    async () => {

        await fetch(
            `${API_URL}/api/set-channel`,
            {
                method:"POST",
                headers:{
                    "Content-Type":
                    "application/json"
                },
                body:JSON.stringify({
                    channelId:
                    channelSelect.value
                })
            }
        );

        alert(
            "Canal definido."
        );

    }
);

/* AUTO RESIZE */

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

/* ENVIAR */

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

/* MENSAGENS */

function adicionarMensagem(
    data
) {

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "message";

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

/* ONLINE */

socket.on(
    "online",
    data => {

        statusDiv.innerHTML += `
            <div>
                🟢 ${data.user}
            </div>
        `;

    }
);

socket.on(
    "offline",
    data => {

        statusDiv.innerHTML += `
            <div>
                🔴 ${data.user}
            </div>
        `;

    }
);

/* MODAL */

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

/* CHANGLEOG */

const changelog =
`🚀 Atualização 26.0.2

[+] Sistema de canais
[+] Melhorias Socket.IO
[+] Novo visual Furina
[+] Correções de bugs
[+] Performance aprimorada`;

document
.getElementById(
    "copyUpdate"
)
.onclick =
async () => {

    await navigator.clipboard
    .writeText(
        changelog
    );

};

document
.getElementById(
    "sendUpdate"
)
.onclick =
() => {

    socket.emit(
        "enviarParaDiscord",
        {
            mensagem:
            changelog
        }
    );

};

carregarServidores();
