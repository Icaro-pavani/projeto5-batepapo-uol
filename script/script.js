const options = document.querySelector('.open-sidebar');
const closeSidebar = document.querySelector('.close-sidebar');
const contacts = document.querySelectorAll(".contact");
const visibilities = document.querySelectorAll(".visibility");

options.addEventListener("click", function() {
    document.querySelector(".sidebar").classList.toggle("faded");
    document.querySelector(".close-sidebar").classList.toggle("isClose");
});

closeSidebar.addEventListener("click", function(){
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