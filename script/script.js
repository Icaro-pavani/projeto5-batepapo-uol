const options = document.querySelector('.open-sidebar');
const closeSidebar = document.querySelector('.close-sidebar');
const contacts = document.querySelectorAll(".contact");
const visibilities = document.querySelectorAll(".visibility");
const sendButton = document.querySelector("footer ion-icon");

let user = {
    name: null
};

let messageElement = "";
let lastMessage = null;
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
        let checkMark = document.querySelector(".contact .selected");
        checkMark.classList.remove("selected");
        contact.querySelector(".check").classList.add("selected");
    })
});

visibilities.forEach(visibility => {
    visibility.addEventListener("click", () => {
        let checkMark = document.querySelector(".visibility .selected");
        checkMark.classList.remove("selected");
        visibility.querySelector(".check").classList.add("selected");
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
    console.log(answer.response);
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
    checkDelivery.catch(refreshPage);
}

function refreshAfterPostMessage(answer) {
    console.log(answer);
    reloadMessages();
}

function refreshPage(error) {
    console.log(error.response);
    window.location.reload();
}

function loadMessages(messages) {
    if (!lastMessage){
        messages.forEach(message => {
            addMessage(message);
            printMessages(messageElement);
            lastMessage = message;
        });
    } else {
        const index = messages.findIndex(object => object.time === lastMessage.time);
        console.log(index);
        console.log(messages.length - 1);
        // console.log(lastMessage);
        if (messages.length - 1 !== index) {
            for (let i = index + 1; i < messages.length; i++){
                console.log(index);
                addMessage(messages[i]);
                printMessages(messageElement);
                lastMessage = messages[i];
            }        
        }
    }
}

function addMessage(message) {
    switch (message.type) {
        case "status":
            messageElement = `
            <div class="message entry">
                <p>
                    <span class="hour">${message.time}</span>
                    <span class="name"><strong>${message.from}</strong></span> ${message.text}
                </p>
            </div>`;
            break;
        case "message":
            messageElement = `
            <div class="message public">
                <p>
                    <span class="hour">${message.time}</span>
                    <span class="name"><strong>${message.from}</strong> para <strong>${message.to}</strong>:</span>
                    ${message.text}
                </p>
            </div>`;
            break;
        case "message private_message":
            messageElement = `
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
}

function printMessages(message) {
    const mainContent = document.querySelector("main");
    mainContent.innerHTML += message;
    const messagesLoaded = document.querySelectorAll(".message");
    messagesLoaded[messagesLoaded.length - 1].scrollIntoView();
    // console.log(mainContent.innerHTML);
}

function reloadMessages() {
    let promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
    promise.then(getMessages);
    promise.catch(errorGetMessages);
}

function getMessages(response) {
    console.log(response);
    const messages = response.data;
    console.log(messages);
    loadMessages(messages);
}

function errorGetMessages(error) {
    console.log(error.response);
}

checkLoginName();