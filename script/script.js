const options = document.querySelector('.open-sidebar');
const closeSidebar = document.querySelector('.close-sidebar');
const contacts = document.querySelectorAll(".contact");
const visibilities = document.querySelectorAll(".visibility");
const sendButton = document.querySelector("footer ion-icon");

let user = {
    name: null
};

let groupMessages = "";
let initiateMessages = null;
let refreshLogin = null;

sendButton.addEventListener("click", function() {
    let message = document.querySelector("input");
    sendMessage(message.value);
    message.value = "";
})

options.addEventListener("click", function () {
    document.querySelector(".sidebar").classList.toggle("faded");
    document.querySelector(".close-sidebar").classList.toggle("isClose");
});

closeSidebar.addEventListener("click", function () {
    this.classList.toggle('isClose');
    document.querySelector(".sidebar").classList.toggle("faded");
});

contacts.forEach(contact => {
    contact.addEventListener("click", () => {
        contact.querySelector(".check").classList.toggle("isClose");
    })
});

visibilities.forEach(visibility => {
    visibility.addEventListener("click", () => {
        visibility.querySelector(".check").classList.toggle("isClose");
    })
});

function checkLoginName() {
    if (user.name){
        console.log(user.name)
        let serverRequisition = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", user)
        serverRequisition.then(initiateChat);
        serverRequisition.catch(checkError);
    } else {
        user.name = prompt("Qual será seu nome?");
        console.log(user);
        checkLoginName();
    }
}

function initiateChat(answer){
    console.log(answer);
    initiateMessages = setInterval(reloadMessages, 3000);
    refreshLogin = setInterval(resendName, 5000);
}

function checkError(error) {
    user.name = prompt("Nome selecionado já em uso, digite outro nome:");
    console.log(error);
    checkLoginName();
}

function resendName(){
    axios.post("https://mock-api.driven.com.br/api/v4/uol/status", user);
}

function sendMessage(message) {
    messageObject = {
        from: user.name,
        to: "Todos",
        text: message,
        type: "message"
    };
    postMessage(messageObject);
}

function postMessage(messageObject) {
    checkDelivery = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", messageObject);
    checkDelivery.then(refreshAfterPostMessage);
}

function refreshAfterPostMessage(answer) {
    console.log(answer);
    reloadMessages();
}

function loadMessages(messages) {
    messages.forEach(message => {
        switch (message.type) {
            case "status":
                groupMessages += `
                <div class="message entry">
                    <p>
                        <span class="hour">${message.time}</span>
                        <span class="name"><strong>${message.from}</strong></span> ${message.text}
                    </p>
                </div>`;
                break;
            case "message":
                groupMessages += `
                <div class="message public">
                    <p>
                        <span class="hour">${message.time}</span>
                        <span class="name"><strong>${message.from}</strong> para <strong>${message.to}</strong>:</span>
                        ${message.text}
                    </p>
                </div>`;
                break;
            case "message private_message":
                groupMessages += `
                <div class="private">
                    <p>
                        <span class="hour">${message.time}</span>
                        <span class="name"
                        ><strong>${message.from}</strong> reservadamente para
                        <strong>${message.to}</strong>:</span>
                        ${message.text}
                    </p>
                </div>`;
                break;
        }
    });
    printMessages(groupMessages);
    groupMessages = "";
}

function printMessages(groupMessages) {
    const mainContent = document.querySelector("main");
    // console.log(mainContent.innerHTML);
    if (mainContent.innerHTML !== groupMessages) {
        mainContent.innerHTML = groupMessages;
        const messagesLoaded = document.querySelectorAll(".message");
        messagesLoaded[messagesLoaded.length - 1].scrollIntoView();
    }
}

function reloadMessages() {
    let promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
    promise.then(getMessages);
}

function getMessages(response) {
    console.log(response);
    const messages = response.data;
    console.log(messages);
    loadMessages(messages);
}

checkLoginName();