const CLAVE_API_OPENAI = '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';
const URL_API_OPENAI = 'https://openrouter.ai/api/v1';

let historialMensajes = [];

// Esa línea de código sirve para que el bot sepa que es lo que tiene que responder porque  Sin ella, la IA podría contestar sin dirección como un asistente  en lugar de un representante de atención al cliente de una empresa de computadoras.

function iniciarChat() {
    mostrarMensajes();
    definirRolBot("Eres una app de atencion al cliente Eres una aplicación de atención al cliente con IA, diseñada para responder preguntas frecuentes y asistir a los usuarios, recuerda no eres un asistente virtual eses solo atencion al cliente, tu representas una empresa de venta de computadoras");
    
    document.getElementById("btnEnviar").addEventListener("click", enviarMensaje);
}

// Esto le indica a la IA que debe actuar como un asistente de atención al cliente en la venta de computadoras. 
// Al poner este mensaje, el bot sabre su propósito y responde a lo que se le ha dicho, Sin esta instrucción, podría generar respuestas que no tengan nada que ver o fuera del tema.
function definirRolBot(rol) {
    historialMensajes = [{ rol: "sistema", contenido: rol }];
}

// Aqui ese maneja el envio de mensajes toma el mensaje que el usuario escribió  y le quita los espacios extra con trim(). 
// Despues, revisa si el mensaje está vacío y si lo está, muestra una alerta diciendo que debe escribir algo antes de enviarlo. Si el mensaje no está vacío, el código sigue ejecutándose. Esto ayuda a evitar que se envíen mensajes en blanco .
async function enviarMensaje() {
    let inputMensaje = document.getElementById('txtMensaje');
    let mensajeUsuario = inputMensaje.value.trim();
    
    if (mensajeUsuario === "") {
        alert("Por favor, escribe un mensaje.");
        return;
    }
    
    // Aquí lo que se hace es guardar el mensaje que escribió el usuario en una lista llamada historialMensajes, para que no se pierda, luego borro el cuadro de texto para que quede listo para escribir otro mensaje.
    //  Después se llama a mostrarMensajes(), que se encarga de actualizar el chat y mostrar lo que el usuario acaba de enviar. 
    historialMensajes.push({ rol: "usuario", contenido: mensajeUsuario });
    inputMensaje.value = "";
    
    mostrarMensajes();
    
    // Aquí lo que se hace es pedirle una respuesta al bot usando la función llamarAPI(), que se comunica con la inteligencia artificial
    // Cuando el bot responde, se guarda el mensaje en la lista historialMensajes para que no se pierda. Luego, se llama a mostrarMensajes(), que actualiza el chat y muestra la respuesta. 
    let respuestaBot = await llamarAPI(historialMensajes);
    historialMensajes.push({ rol: "bot", contenido: respuestaBot });
    mostrarMensajes();
}

// Esta función sirve para mostrar los mensajes en el chat. Primero borra todo lo que hay en chatBox para que no se repitan los mensajes. 
// Luego revisa la lista historialMensajes y crea un nuevo mensaje en la pantalla dependiendo si es del usuario o del bot. Por último, hace que el chat se desplace hacia abajo para que siempre se vea el último mensaje.
function mostrarMensajes() {
    let chatBox = document.getElementById("mensajesChat");
    chatBox.innerHTML = "";
    
    historialMensajes.forEach(mensaje => {
        if (mensaje.rol !== "sistema") {
            let div = document.createElement("div");
            div.className = mensaje.rol === "usuario" ? "mensaje-usuario" : "mensaje-bot";
            div.innerHTML = `<span>${mensaje.contenido}</span>`;
            chatBox.appendChild(div);
        }
    });
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Esta función se conecta con la API para obtener la respuesta del bot. Primero arma el mensaje que se enviará con el historial de la conversación.
//  Luego, hace una petición a la API con esa información y espera la respuesta. Si todo sale bien, devuelve el mensaje del bot, pero si hay un error,devuelve un texto avisando que hubo un problema.
async function llamarAPI(historialMensajes) {
    const url = `${URL_API_OPENAI}/chat/completions`;
    const bodyRequest = {
        model: "deepseek/deepseek-r1:free",
        messages: historialMensajes.map(m => ({
            role: m.rol === "usuario" ? "user" : m.rol === "bot" ? "assistant" : "system",
            content: m.contenido
        }))
    };

    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CLAVE_API_OPENAI}`
        },
        body: JSON.stringify(bodyRequest)
    };

    try {
        const response = await fetch(url, request);
        const json = await response.json();
        return json.choices[0].message.content;
    } catch (error) {
        console.error("Error en la API:", error);
        return "Hubo un problema con la respuesta.";
    }
}

// Inicia el chat cuando la página carga
window.onload = iniciarChat;