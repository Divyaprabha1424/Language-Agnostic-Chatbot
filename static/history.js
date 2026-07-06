function searchHistory() {

    let input = document.getElementById("searchInput").value.toLowerCase();

    let cards = document.querySelectorAll(".history-card");

    cards.forEach(card => {

        if (card.innerText.toLowerCase().includes(input)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}

function clearAllHistory() {

    if (!confirm("Delete all chat history?"))
        return;

    fetch("/clear", {

        method: "POST"

    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        location.reload();

    });

}

function deleteChat(id){

    if(!confirm("Delete this chat?"))
        return;

    fetch("/delete_chat/" + id, {

        method:"POST"

    })

    .then(res => res.json())

    .then(data => {

        location.reload();

    });

}

function viewChat(user, bot, language){

    document.getElementById("modalUser").innerText = user;

    document.getElementById("modalBot").innerText = bot;

    document.getElementById("modalLang").innerText = language;

    document.getElementById("chatModal").style.display="flex";

}

function closeModal(){

    document.getElementById("chatModal").style.display="none";

}

window.onclick=function(event){

    let modal=document.getElementById("chatModal");

    if(event.target==modal){

        modal.style.display="none";

    }

}