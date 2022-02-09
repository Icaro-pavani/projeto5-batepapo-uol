const options = document.querySelector('.open-sidebar');
const closeSidebar = document.querySelector('.close-sidebar');
const contacts = document.querySelectorAll(".contact");
const visibilities = document.querySelectorAll(".visibility");

let groupMessages = "";

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

function loadMessages(messages) {
    messages.forEach(message => {
        switch (message.type) {
            case "status":
                groupMessages += `
                <div class="message entry">
                    <p>
                        <span class="hour">${message.time}</span>
                        <span class="name"><strong>${message.from}</strong></span> ${message.text}entra na sala...
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

let cancel = setInterval(reloadMessages, 3000);

function getMessages(response) {
    console.log(response);
    const messages = response.data;
    console.log(messages);
    loadMessages(messages);
}