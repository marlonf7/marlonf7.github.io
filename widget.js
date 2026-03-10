(function () {
  const scriptTag = document.currentScript;
  const clientId = scriptTag.getAttribute("data-client-id");
  const apiBase = "https://YOUR-VERCEL-PROJECT.vercel.app/api/chat";

  if (!clientId) {
    console.error("ReceptionPoint widget error: missing data-client-id");
    return;
  }

  let sessionId = null;

  // Styles
  const style = document.createElement("style");
  style.innerHTML = `
    #rp-chat-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: #111827;
      color: white;
      font-size: 24px;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }

    #rp-chat-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 340px;
      max-width: calc(100vw - 20px);
      height: 500px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      font-family: Arial, sans-serif;
    }

    #rp-chat-header {
      background: #111827;
      color: white;
      padding: 14px 16px;
      font-weight: bold;
      font-size: 15px;
    }

    #rp-chat-messages {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rp-msg {
      max-width: 80%;
      padding: 10px 12px;
      border-radius: 12px;
      line-height: 1.4;
      font-size: 14px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .rp-user {
      align-self: flex-end;
      background: #111827;
      color: white;
    }

    .rp-bot {
      align-self: flex-start;
      background: #e5e7eb;
      color: #111827;
    }

    #rp-chat-input-wrap {
      display: flex;
      border-top: 1px solid #e5e7eb;
      background: white;
    }

    #rp-chat-input {
      flex: 1;
      border: none;
      padding: 12px;
      font-size: 14px;
      outline: none;
    }

    #rp-chat-send {
      border: none;
      background: #111827;
      color: white;
      padding: 0 16px;
      cursor: pointer;
    }

    #rp-chat-footer {
      font-size: 11px;
      color: #6b7280;
      text-align: center;
      padding: 6px 10px;
      background: white;
      border-top: 1px solid #f3f4f6;
    }

    .rp-link {
      color: inherit;
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  // Elements
  const button = document.createElement("button");
  button.id = "rp-chat-button";
  button.innerHTML = "💬";

  const windowEl = document.createElement("div");
  windowEl.id = "rp-chat-window";
  windowEl.innerHTML = `
    <div id="rp-chat-header">Chat with us</div>
    <div id="rp-chat-messages"></div>
    <div id="rp-chat-input-wrap">
      <input id="rp-chat-input" type="text" placeholder="Type your message..." />
      <button id="rp-chat-send">Send</button>
    </div>
    <div id="rp-chat-footer">Powered by ReceptionPoint</div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(windowEl);

  const messagesEl = document.getElementById("rp-chat-messages");
  const inputEl = document.getElementById("rp-chat-input");
  const sendEl = document.getElementById("rp-chat-send");

  function linkify(text) {
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a class="rp-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }

  function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = `rp-msg ${sender === "user" ? "rp-user" : "rp-bot"}`;
    msg.innerHTML = linkify(text);
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(text, "user");
    inputEl.value = "";

    try {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          message: text,
          session_id: sessionId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        addMessage(data.error || "Sorry, something went wrong.", "bot");
        return;
      }

      if (data.session_id) {
        sessionId = data.session_id;
      }

      addMessage(data.reply || "Sorry, I couldn't generate a reply.", "bot");
    } catch (err) {
      addMessage("Sorry, something went wrong. Please try again.", "bot");
      console.error("ReceptionPoint widget error:", err);
    }
  }

  button.addEventListener("click", function () {
    windowEl.style.display =
      windowEl.style.display === "flex" ? "none" : "flex";
  });

  sendEl.addEventListener("click", sendMessage);

  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  addMessage("Hi! How can I help you today?", "bot");
})();
