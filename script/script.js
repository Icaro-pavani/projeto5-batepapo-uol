const options = document.querySelector('.open-sidebar');
const closeSidebar = document.querySelector('.close-sidebar');
const contacts = document.querySelectorAll(".contact");
const visibilities = document.querySelectorAll(".visibility");
const sendButton = document.querySelector("footer ion-icon");
const enterButton = document.querySelector(".login button");

let user = {
    name: null
};

let adressedUser = "Todos";
let visibilityValue = "message";

let messageField = "";
let membersAreaText = `
        <div class="contact" onclick="selectMember(this);">
          <div class="info">
            <ion-icon name="people"></ion-icon>
            <p>Todos</p>
          </div>
          <ion-icon class="check" name="checkmark-outline"></ion-icon>
        </div>`;
let lastMessage = null;
let initiateMessages = null;
let refreshLogin = null;
let loadMembers = null;

sendButton.addEventListener("click", function () {
    let message = document.querySelector("footer input");
    creatMessageToSend(message.value);
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

function selectMember(member) {
    let checkMark = document.querySelector(".contact .selected");
    if (checkMark !== null){
        checkMark.classList.remove("selected");
    }
    member.querySelector(".check").classList.add("selected");
    adressedUser = member.querySelector("p").innerHTML;
}


visibilities.forEach(visibility => {
    visibility.addEventListener("click", () => {
        let checkMark = document.querySelector(".visibility .selected");
        checkMark.classList.remove("selected");
        visibility.querySelector(".check").classList.add("selected");
        if (visibility.querySelector("p").innerHTML === "Reservadamente"){
            visibilityValue = "private_message";
        } else {
            visibilityValue = "message";
        }
    });
});

enterButton.addEventListener("click", checkLoginName)

function checkLoginName() {
    user.name = document.querySelector(".login input").value;
    if (user.name) {
        // console.log(user.name)
        toggleLoadScreen();
        let serverRequisition = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", user)
        serverRequisition.then(initiateChat);
        serverRequisition.catch(checkError);
    } else {
        document.querySelector(".login input").setAttribute("placeholder", "Insira um nome");
        // user.name = prompt("Qual será seu nome?");
        // // console.log(user);
        // checkLoginName();
    }
}

function toggleLoadScreen() {
    document.querySelector(".login input").classList.toggle("isClose");
    document.querySelector(".login button").classList.toggle("isClose");
    document.querySelector(".login .loading").classList.toggle("isClose");
    document.querySelector(".login p").classList.toggle("isClose");
}

function initiateChat(answer) {
    // console.log(answer.response);
    closeLoginScreen();
    initiateMessages = setInterval(reloadMessages, 3000);
    refreshLogin = setInterval(resendName, 5000);
    loadMembers = setInterval(showMembers, 10000);
}

function checkError(error) {
    toggleLoadScreen();
    document.querySelector(".login input").setAttribute("placeholder", "Nome em uso, digite outro");
    // user.name = prompt("Nome selecionado já em uso, digite outro nome:");
    console.log(error);
    // checkLoginName();
}

function closeLoginScreen() {
    document.querySelector(".login").classList.add("isClose");
}

function resendName() {
    axios.post("https://mock-api.driven.com.br/api/v4/uol/status", user);
}

function creatMessageToSend(message) {
    messageObject = {
        from: user.name,
        to: adressedUser,
        text: message,
        type: visibilityValue
    };
    sendMessage(messageObject);
}

function sendMessage(messageObject) {
    checkDelivery = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", messageObject);
    checkDelivery.then(refreshAfterPostMessage);
    checkDelivery.catch(refreshPage);
}

function refreshAfterPostMessage(answer) {
    // console.log(answer);
    reloadMessages();
}

function refreshPage(error) {
    console.log(error.response);
    window.location.reload();
}

function loadMessages(messages) {
    // if (!messageField) {
        messages.forEach(message => {
            addMessage(message);
        });
        printMessages(messageField);
    // } else {
    //     const index = indexLastMessage(messages);
    //     // console.log(index);
    //     // console.log(messages);
    //     // console.log(lastMessage);
    //     if (messages.length - 1 !== index) {
    //         lastMessage = messages[messages.length - 1];
    //         for (let i = index + 1; i < messages.length; i++) {
    //             // console.log(index);
    //             addMessage(messages[i]);
    //             printMessages(messageElement);
    //             // lastMessage = messages[i];
    //         }
    //         const messagesLoaded = document.querySelectorAll(".message");
    //         messagesLoaded[messagesLoaded.length - 1].scrollIntoView();
    //     }
    // }
}

function indexLastMessage(messages) {
    let indexMessage = messages.length - 1;
    for (; indexMessage >= 0; indexMessage--){
        if (messages[indexMessage].time === lastMessage.time && messages[indexMessage].from === lastMessage.from){
            break;
        }
    }
    return indexMessage;
}

function addMessage(message) {
    switch (message.type) {
        case "status":
            messageField += `
            <div class="message entry">
                <p>
                    <span class="hour">${message.time}</span>
                    <span class="name"><strong>${message.from}</strong></span> ${message.text}
                </p>
            </div>`;
            break;
        case "message":
            messageField += `
            <div class="message public">
                <p>
                    <span class="hour">${message.time}</span>
                    <span class="name"><strong>${message.from}</strong> para <strong>${message.to}</strong>:</span>
                    ${message.text}
                </p>
            </div>`;
            break;
        case "private_message":
            if (message.from === user.name || message.to === user.name){
                messageField += `
                <div class="private">
                    <p>
                        <span class="hour">${message.time}</span>
                        <span class="name"
                        ><strong>${message.from}</strong> reservadamente para
                        <strong>${message.to}</strong>:</span>
                        ${message.text}
                    </p>
                </div>`;
            }
            break;
    }
}

function printMessages(messages) {
    const mainContent = document.querySelector("main");
    if (mainContent.innerHTML !== messageField){
        mainContent.innerHTML = messageField;
    }
    messageField = "";
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
    // console.log(response);
    const messages = response.data;
    // console.log(messages);
    loadMessages(messages);
}

function errorGetMessages(error) {
    console.log(error.response);
}

function showMembers() {
    let promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
    promise.then(getMembers);
    promise.catch(showMemberError);
}

function getMembers(members) {
    console.log(members);
    const membersDisplay = document.querySelector(".contacts");
    members.data.forEach(member => {
        addMember(member);
    });
    membersDisplay.innerHTML = membersAreaText;
    membersAreaText = `
        <div class="contact" onclick="selectMember(this);">
          <div class="info">
            <ion-icon name="people"></ion-icon>
            <p>Todos</p>
          </div>
          <ion-icon class="check" name="checkmark-outline"></ion-icon>
        </div>`;
}

function showMemberError(error) {
    console.log(error.response);
}

function addMember(member) {
    if (member !== user) {
        membersAreaText += `
        <div class="contact" onclick="selectMember(this);">
          <div class="info">
            <ion-icon name="person-circle"></ion-icon>
            <p>${member.name}</p>
          </div>
          <ion-icon class="check" name="checkmark-outline"></ion-icon>
        </div>`
    }
}
