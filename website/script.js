// eslint-disable-next-line no-undef
let socket = io("/");

document.getElementById("login").addEventListener("click", () => {
    socket.emit("loginRedirect")
    console.log("You have been redirected to login with Google!")
})