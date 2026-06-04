// PINTE AQUI O LINK DO SEU BOT NO RAILWAY (Quando você gerar ele no passo abaixo)
const LINK_DO_BOT_RAILWAY = "presence-notify.up.railway.app"; 

const socket = io(LINK_DO_BOT_RAILWAY);

const input = document.getElementById("mensagemInput");
const botao = document.getElementById("enviarBtn");

function enviarMensagem() {
    const texto = input.value;
    if (texto.trim() !== "") {
        // Envia a mensagem para o bot através da internet
        socket.emit("enviarParaDiscord", { mensagem: texto });
        input.value = ""; // Limpa a caixinha
    }
}

botao.addEventListener("click", enviarMensagem);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") enviarMensagem();
});
