const openParticipantsOnline = document.querySelector('.open-sidebar');
const closeSidebar = document.querySelector('.close-sidebar');
const choosePublicOrPrivateMessage = document.querySelectorAll(".visibility");
const sendMessageButton = document.querySelector("footer ion-icon");
const enterChatButton = document.querySelector(".login button");
const sendMessageWithEnter = document.querySelector("footer input");

let user = {
    name: null
};

let addressedUser = "Todos";
let visibilityValue = "message";

let messagesDivisionInnerHTML = "";
let ParticipantsDivisionInnerHTML = `
        <div class="contact" onclick="selectParticipantOnline(this);" data-identifier="participant">
          <div class="info">
            <ion-icon name="people"></ion-icon>
            <p>Todos</p>
          </div>
          <ion-icon class="check" name="checkmark-outline"></ion-icon>
        </div>`;
let initiateMessagesRefresh = null;
let refreshLogin = null;
let refreshParticipants = null;
let addressedMemberOnline = false;
let lastMessage = null;

sendMessageButton.addEventListener("click", function () {
    let message = document.querySelector("footer input");
    creatMessageToSend(message.value);
    message.value = "";
});

sendMessageWithEnter.addEventListener("keypress", function (e) {
    if (e.which === 13) {
        creatMessageToSend(this.value);
        this.value = "";
    }
});

openParticipantsOnline.addEventListener("click", function () {
    document.querySelector(".sidebar").classList.toggle("faded");
    document.querySelector(".close-sidebar").classList.toggle("isClose");
});

closeSidebar.addEventListener("click", function () {
    this.classList.toggle('isClose');
    document.querySelector(".sidebar").classList.toggle("faded");
});

function selectParticipantOnline(participant) {
    let checkMark = document.querySelector(".contact .selected");
    if (checkMark !== null) {
        checkMark.classList.remove("selected");
    }
    participant.querySelector(".check").classList.add("selected");
    addressedUser = participant.querySelector("p").innerHTML;
    if (addressedUser === "Todos") {
        resetSidebarSelection();
    }
    showAddresserInMessageInput();
}


choosePublicOrPrivateMessage.forEach(visibility => {
    visibility.addEventListener("click", () => {
        if (addressedUser !== "Todos"){
            let checkMark = document.querySelector(".visibility .selected");
            checkMark.classList.remove("selected");
            visibility.querySelector(".check").classList.add("selected");
            if (visibility.querySelector("p").innerHTML === "Reservadamente") {
                visibilityValue = "private_message";
            } else {
                visibilityValue = "message";
            }
            showAddresserInMessageInput();
        }
    });
});

enterChatButton.addEventListener("click", checkLoginName);

function checkLoginName() {
    user.name = document.querySelector(".login input").value;
    if (user.name) {
        toggleLoadScreen();
        let serverRequisition = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", user)
        serverRequisition.then(initiateChat);
        serverRequisition.catch(checkError);
    } else {
        document.querySelector(".login input").setAttribute("placeholder", "Insira um nome");
    }
}

function toggleLoadScreen() {
    document.querySelector(".login input").classList.toggle("isClose");
    document.querySelector(".login button").classList.toggle("isClose");
    document.querySelector(".login .loading").classList.toggle("isClose");
    document.querySelector(".login p").classList.toggle("isClose");
}

function initiateChat(answer) {
    // Carrega os componentes da página
    closeLoginScreen();
    loadMessagesToScreen();
    loadParticipantsToSidebar();
    // Inicia os ciclos de atualização
    initiateMessagesRefresh = setInterval(loadMessagesToScreen, 3000);
    refreshLogin = setInterval(sendUserNameServer, 5000);
    initiateMessagesRefresh = setInterval(loadParticipantsToSidebar, 10000);
}

function checkError(error) {
    toggleLoadScreen();
    const inputElement = document.querySelector(".login input");
    inputElement.setAttribute("placeholder", "Nome em uso, digite outro");
    inputElement.value = "";
    console.log(error);
}

function closeLoginScreen() {
    document.querySelector(".login").classList.add("isClose");
}

function sendUserNameServer() {
    let promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/status", user);
    promise.catch(refreshPage);
}

function creatMessageToSend(message) {
    messageObject = {
        from: user.name,
        to: addressedUser,
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
    loadMessagesToScreen();
}

function refreshPage(error) {
    console.log(error.response);
    window.location.reload();
}

function loadMessages(messages) {
    messages.forEach(addMessageToHTMLElement);
    includeMessagesToHTML(messagesDivisionInnerHTML);
}

function addMessageToHTMLElement(message) {
    switch (message.type) {
        case "status":
            messagesDivisionInnerHTML += `
            <div class="message entry" data-identifier="message">
                <p>
                    <span class="hour">${message.time}</span>
                    <span class="name"><strong>${message.from}</strong></span> ${message.text}
                </p>
            </div>`;
            break;
        case "message":
            messagesDivisionInnerHTML += `
            <div class="message public" data-identifier="message">
                <p>
                    <span class="hour">${message.time}</span>
                    <span class="name"><strong>${message.from}</strong> para <strong>${message.to}</strong>:</span>
                    ${message.text}
                </p>
            </div>`;
            break;
        case "private_message":
            if (message.from === user.name || message.to === user.name) {
                messagesDivisionInnerHTML += `
                <div class="message private" data-identifier="message">
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

function includeMessagesToHTML(messages) {
    const mainContent = document.querySelector("main");
    if (mainContent.innerHTML !== messages) {
        mainContent.innerHTML = messages;
        const messagesLoaded = document.querySelectorAll(".message");
        messagesLoaded[messagesLoaded.length - 1].scrollIntoView();
    }
    messagesDivisionInnerHTML = "";
}

function loadMessagesToScreen() {
    let promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
    promise.then(getMessagesFromServer);
    promise.catch(errorGetMessagesFromServer);
}

function getMessagesFromServer(response) {
    const messages = response.data;
    if (!lastMessage){
        lastMessage = messages[messages.length - 1];
        loadMessages(messages);
    } else {
        if (lastMessage.time !== messages[messages.length - 1].time && lastMessage.from !== messages[messages.length - 1].from){
            loadMessages(messages);
            lastMessage = messages[messages.length - 1];
        }
    }
}

function errorGetMessagesFromServer(error) {
    console.log(error.response);
    window.location.reload();
}

function loadParticipantsToSidebar() {
    let promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
    promise.then(getParticipantsFromServer);
    promise.catch(showParticipantsError);
}

function getParticipantsFromServer(participants) {
    const participantsDisplay = document.querySelector(".contacts");
    addressedMemberOnline = false;
    participants.data.forEach(addParticipantToHTMLElement);
    participantsDisplay.innerHTML = ParticipantsDivisionInnerHTML;
    if (!ParticipantsDivisionInnerHTML.includes(addressedUser) || addressedUser === "Todos") {
        addressedUser = "Todos";
        visibilityValue = "message";
        resetSidebarSelection();
        showAddresserInMessageInput()
    }
    ParticipantsDivisionInnerHTML = `
            <div class="contact" onclick="selectParticipantOnline(this);" data-identifier="participant">
              <div class="info">
                <ion-icon name="people"></ion-icon>
                <p>Todos</p>
              </div>
              <ion-icon class="check" name="checkmark-outline"></ion-icon>
            </div>`;
}

function showParticipantsError(error) {
    console.log(error.response);
    window.location.reload();
}

function addParticipantToHTMLElement(participant) {
    if (participant.name !== user.name) {
        if (participant.name === addressedUser) {
            ParticipantsDivisionInnerHTML += `
            <div class="contact" onclick="selectParticipantOnline(this);" data-identifier="participant">
                <div class="info">
                    <ion-icon name="person-circle"></ion-icon>
                    <p>${participant.name}</p>
                </div>
                <ion-icon class="check selected" name="checkmark-outline"></ion-icon>
            </div>`;
        } else {
            ParticipantsDivisionInnerHTML += `
            <div class="contact" onclick="selectParticipantOnline(this);" data-identifier="participant">
              <div class="info">
                <ion-icon name="person-circle"></ion-icon>
                <p>${participant.name}</p>
              </div>
              <ion-icon class="check" name="checkmark-outline"></ion-icon>
            </div>`;
        }
    }
}

function resetSidebarSelection() {
    addressedUser = "Todos";
    visibilityValue = "message";
    document.querySelector(".contacts .check").classList.add("selected");
    const visibilityOptions = document.querySelectorAll(".visibility .check");
    visibilityOptions[0].classList.add("selected");
    visibilityOptions[1].classList.remove("selected");
}

function showAddresserInMessageInput() {
    const messageInformation = document.querySelector("footer p");
    if (addressedUser !== "Todos"){
        messageInformation.classList.remove("isClose");
        if (visibilityValue === "message"){
            messageInformation.innerHTML = `Enviando para ${addressedUser}`;
        } else {
            messageInformation.innerHTML = `Enviando para ${addressedUser} (reservadamente)`;
        }
    } else {
        messageInformation.classList.add("isClose");
    }
}