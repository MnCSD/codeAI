import BotAi from "./assets/bot.svg";
import User from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.innerHTML += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let i = 0;

  const typeInterval = setInterval(() => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
    }
  }, 20);
}

function generateId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const string = randomNumber.toString(16);

  return `id-${timestamp}-${string}`;
}

function chat(isAi, value, id) {
  return `
  <div class="wrapper ${isAi && "ai"}">
    <div class="chat">
      <div class="profile">
        <img src="${isAi ? BotAi : User}" alt="profile">
      </div>
      <div class="message" id=${id}>
        ${value}
      </div>
    </div>
  </div>
  `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  chatContainer.innerHTML += chat(false, data.get("prompt"));

  form.reset();

  const id = generateId();
  chatContainer.innerHTML += chat(true, "", id);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(id);

  loader(messageDiv);

  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);

  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const error = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    console.log(error);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
