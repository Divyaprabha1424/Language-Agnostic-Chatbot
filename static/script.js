// ================================
// Get Current Time
// ================================

function getCurrentTime() {

    let now = new Date();

    return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}

// ================================
// Send Message
// ================================

function sendMessage() {

    let input = document.getElementById("message");
    let message = input.value.trim();

    if (message === "")
        return;

    let chat = document.getElementById("chat-box");

    // User Message
    chat.innerHTML +=
        "<div class='user'>" +
            "<span>" + message + "</span>" +
            "<div class='time'>" + getCurrentTime() + "</div>" +
        "</div>";

    chat.scrollTop = chat.scrollHeight;

    input.value = "";

    // Typing Animation
    chat.innerHTML +=
        "<div class='bot typing' id='typing'><span>Typing...</span></div>";

    chat.scrollTop = chat.scrollHeight;

    fetch("/chat", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            message: message
        })

    })

    .then(response => response.json())

    .then(data => {

        let typing = document.getElementById("typing");

        if (typing) {
            typing.remove();
        }

        chat.innerHTML +=
            "<div class='bot'>" +
                "<span>" + marked.parse(data.reply) + "</span>" +
                "<div class='time'>" + getCurrentTime() + "</div>" +
            "</div>";

        chat.scrollTop = chat.scrollHeight;

        input.focus();

    })

    .catch(error => {

        let typing = document.getElementById("typing");

        if (typing) {
            typing.remove();
        }

        chat.innerHTML +=
            "<div class='bot'>" +
                "<span>❌ Unable to connect to server.</span>" +
                "<div class='time'>" + getCurrentTime() + "</div>" +
            "</div>";

        chat.scrollTop = chat.scrollHeight;

        console.error(error);

    });

}

// ================================
// Clear Chat
// ================================

function clearChat() {

    if (!confirm("Clear all chat history?"))
        return;

    fetch("/clear", {

        method: "POST"

    })

    .then(response => response.json())

    .then(data => {

        document.getElementById("chat-box").innerHTML = "";

        alert(data.message);

        document.getElementById("message").focus();

    })

    .catch(error => {

        console.error(error);

        alert("Unable to clear chat.");

    });

}

// ================================
// Dark Mode
// ================================

function toggleTheme() {

    document.body.classList.toggle("dark-mode");

    let btn = document.getElementById("themeBtn");

    if (document.body.classList.contains("dark-mode")) {

        btn.innerHTML = '<i class="fa-solid fa-sun"></i>';

    } else {

        btn.innerHTML = '<i class="fa-solid fa-moon"></i>';

    }

}

// ================================
// Export Chat
// ================================

function exportChat() {

    let chat = document.getElementById("chat-box");

    let messages = chat.querySelectorAll(".user, .bot");

    let text = "==============================\n";
    text += "Language Agnostic Chatbot\n";
    text += "Chat History\n";
    text += "==============================\n\n";

    messages.forEach(function(message) {

        let time = "";

        let timeElement = message.querySelector(".time");

        if (timeElement) {
            time = timeElement.innerText;
        }

        if (message.classList.contains("user")) {

            text += "User (" + time + ")\n";
            text += message.querySelector("span").innerText + "\n\n";

        } else {

            text += "Bot (" + time + ")\n";
            text += message.querySelector("span").innerText + "\n\n";

        }

    });

    let blob = new Blob([text], {
        type: "text/plain"
    });

    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "chat_history.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

}

// ================================
// Enter Key Support
// ================================

document.getElementById("message").addEventListener("keypress", function(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

    }

});

// ================================
// Auto Focus
// ================================

window.onload = function() {

    document.getElementById("message").focus();

};