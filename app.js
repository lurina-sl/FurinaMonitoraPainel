const API_URL =
"https://presence-notify-production.up.railway.app";

const socket = io(API_URL);

const messages =
document.getElementById("messages");

const status =
document.getElementById("status");

const input =
document.getElementById("mensagemInput");

// ================= CHAT =================

document
.getElementById("enviarBtn")
.addEventListener("click", enviarMensagem);

input.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        enviarMensagem();
    }

});

function enviarMensagem() {

    const texto = input.value.trim();

    if (!texto) return;

    socket.emit("enviarParaDiscord", {
        mensagem: texto
    });

    input.value = "";

}

// ================= MENSAGENS =================

socket.on("novaMensagem", (msg) => {

    const div =
    document.createElement("div");

    div.className = "message";

    div.innerHTML = `
        <b>${msg.usuario}</b>
        <br>
        ${msg.conteudo}
    `;

    messages.appendChild(div);

    messages.scrollTop =
    messages.scrollHeight;

});

// ================= STATUS =================

socket.on("online", (data) => {

    const div =
    document.createElement("div");

    div.innerHTML =
    `🟢 ${data.user} entrou (${data.time})`;

    status.prepend(div);

});

socket.on("offline", (data) => {

    const div =
    document.createElement("div");

    div.innerHTML =
    `🔴 ${data.user} saiu (${data.time})`;

    status.prepend(div);

});

// ================= SERVIDORES =================

async function carregarServidores() {

    try {

        const resposta =
            await fetch(
                `${API_URL}/api/guilds`
            );

        const guilds =
            await resposta.json();

        const guildSelect =
            document.getElementById(
                "guildSelect"
            );

        guildSelect.innerHTML = "";

        guilds.forEach(guild => {

            const option =
                document.createElement("option");

            option.value =
                guild.id;

            option.textContent =
                `${guild.name} (${guild.members})`;

            guildSelect.appendChild(
                option
            );

        });

        if (guilds.length > 0) {

            carregarCanais(
                guilds[0].id
            );

        }

    } catch (err) {

        console.error(
            "Erro servidores:",
            err
        );

    }

}

// ================= CANAIS =================

async function carregarCanais(guildId) {

    try {

        const resposta =
            await fetch(
                `${API_URL}/api/channels/${guildId}`
            );

        const canais =
            await resposta.json();

        const channelSelect =
            document.getElementById(
                "channelSelect"
            );

        channelSelect.innerHTML = "";

        canais.forEach(canal => {

            const option =
                document.createElement("option");

            option.value =
                canal.id;

            option.textContent =
                canal.name;

            channelSelect.appendChild(
                option
            );

        });

    } catch (err) {

        console.error(
            "Erro canais:",
            err
        );

    }

}

// ================= TROCA DE SERVIDOR =================

document
.getElementById("guildSelect")
.addEventListener("change", (e) => {

    carregarCanais(
        e.target.value
    );

});

// ================= DEFINIR CANAL =================

document
.getElementById("definirCanalBtn")
.addEventListener("click", async () => {

    const channelId =
        document.getElementById(
            "channelSelect"
        ).value;

    if (!channelId) return;

    try {

        const resposta =
            await fetch(
                `${API_URL}/api/set-channel`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({
                        channelId
                    })
                }
            );

        const data =
            await resposta.json();

        if (data.success) {

            alert(
                "✅ Canal definido!"
            );

        }

    } catch (err) {

        console.error(err);

        alert(
            "❌ Erro ao definir canal"
        );

    }

});

// ================= INICIAR =================

carregarServidores();
