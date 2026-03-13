(function () {
  const scriptTag = document.currentScript;
  const clientId = scriptTag.getAttribute("data-client-id");
  const businessName =
    scriptTag.getAttribute("data-business-name") || "Chat with us";
  const API_URL = "https://receptionpoint-backend.vercel.app/api/chat";

  let sessionId = null;

  function getBotIconSvg() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 10h8"></path>
        <path d="M8 14h5"></path>
        <path d="M12 3v3"></path>
        <rect x="4" y="6" width="16" height="12" rx="6"></rect>
      </svg>
    `;
  }

  /* ---------- STYLES ---------- */

  const style = document.createElement("style");
  style.innerHTML = `
    #rp-widget-button{
      position:fixed;
      bottom:20px;
      right:20px;
      width:60px;
      height:60px;
      border-radius:50%;
      background:#2F6BFF;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      box-shadow:0 6px 18px rgba(0,0,0,0.2);
      z-index:9999;
    }

    #rp-widget-button svg{
      width:28px;
      height:28px;
      stroke:currentColor;
      stroke-width:2;
      fill:none;
      stroke-linecap:round;
      stroke-linejoin:round;
    }

    #rp-widget{
      position:fixed;
      bottom:90px;
      right:20px;
      width:320px;
      height:440px;
      background:white;
      border-radius:14px;
      box-shadow:0 10px 35px rgba(0,0,0,0.2);
      display:none;
      flex-direction:column;
      overflow:hidden;
      font-family:Arial, sans-serif;
      z-index:9999;
    }

    #rp-header{
      background:#2F6BFF;
      color:white;
      padding:12px;
      font-weight:bold;
      text-align:center;
      font-size:15px;
    }

    #rp-messages{
      flex:1;
      padding:12px;
      overflow-y:auto;
      background:#F4F6F9;
      display:flex;
      flex-direction:column;
      gap:10px;
    }

    .rp-row{
      display:flex;
      align-items:flex-end;
      gap:8px;
      max-width:100%;
    }

    .rp-user-row{
      justify-content:flex-end;
    }

    .rp-bot-row{
      justify-content:flex-start;
    }

    .rp-avatar{
      width:28px;
      height:28px;
      border-radius:50%;
      flex-shrink:0;
      background:#2F6BFF;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
    }

    .rp-avatar svg{
      width:15px;
      height:15px;
      stroke:currentColor;
      stroke-width:2;
      fill:none;
      stroke-linecap:round;
      stroke-linejoin:round;
    }

    .rp-msg{
      padding:10px 14px;
      border-radius:12px;
      max-width:72%;
      font-size:14px;
      line-height:1.45;
      word-wrap:break-word;
    }

    .rp-user{
      background:#2F6BFF;
      color:white;
    }

    .rp-bot{
      background:#E6EAF2;
      color:#1F2A44;
    }

    .rp-link{
      color:#2F6BFF;
      font-weight:600;
      text-decoration:underline;
    }

    #rp-input-area{
      display:flex;
      align-items:center;
      gap:8px;
      padding:10px;
      border-top:1px solid #eee;
      background:white;
    }

    #rp-input{
      flex:1;
      border:1px solid #d8dee9;
      padding:10px 12px;
      font-size:16px;
      border-radius:14px;
      outline:none;
      box-sizing:border-box;
      min-width:0;
    }

    #rp-send{
      background:#2F6BFF;
      color:white;
      border:none;
      padding:10px 16px;
      cursor:pointer;
      font-weight:bold;
      border-radius:14px;
      flex-shrink:0;
    }

    #rp-send:hover{
      background:#1c4ed8;
    }

    .rp-typing{
      display:flex;
      gap:4px;
      align-items:center;
      padding:10px 14px;
      background:#E6EAF2;
      border-radius:12px;
    }

    .rp-dot{
      width:6px;
      height:6px;
      background:#1F2A44;
      border-radius:50%;
      animation:rpblink 1.4s infinite;
    }

    .rp-dot:nth-child(2){animation-delay:0.2s}
    .rp-dot:nth-child(3){animation-delay:0.4s}

    @keyframes rpblink{
      0%,80%,100%{opacity:0}
      40%{opacity:1}
    }

    #rp-footer{
      font-size:10px;
      text-align:center;
      padding:4px 8px;
      border-top:1px solid #eee;
      background:white;
      line-height:1.2;
    }

    #rp-footer a{
      color:#2F6BFF;
      text-decoration:none;
      font-weight:500;
    }

    #rp-footer a:hover{
      text-decoration:underline;
    }

    @media (max-width: 768px) {
      #rp-widget-button{
        right:16px;
        bottom:16px;
        width:58px;
        height:58px;
      }

      #rp-widget{
        left:12px;
        right:12px;
        width:auto;
        bottom:84px;
        height:min(62dvh, 520px);
        max-height:calc(100dvh - 100px);
        border-radius:16px;
      }

      #rp-header{
        padding:13px 12px;
      }

      #rp-messages{
        padding:10px;
      }

      .rp-msg{
        max-width:78%;
        font-size:14px;
      }

      #rp-input-area{
        padding:10px;
      }

      #rp-input{
        font-size:16px; /* prevents iPhone zoom on focus */
      }

      #rp-send{
        padding:10px 14px;
      }
    }
  `;
  document.head.appendChild(style);

  /* ---------- HTML ---------- */

  const button = document.createElement("div");
  button.id = "rp-widget-button";
  button.innerHTML = getBotIconSvg();

  const widget = document.createElement("div");
  widget.id = "rp-widget";

  widget.innerHTML = `
    <div id="rp-header">${businessName}</div>
    <div id="rp-messages"></div>

    <div id="rp-input-area">
      <input id="rp-input" placeholder="Type a message..." />
      <button id="rp-send">Send</button>
    </div>

    <div id="rp-footer">
      Powered by <a href="https://receptionpoint.co.uk" target="_blank" rel="noopener noreferrer">ReceptionPoint</a>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(widget);

  /* ---------- ELEMENTS ---------- */

  const messagesEl = document.getElementById("rp-messages");
  const inputEl = document.getElementById("rp-input");
  const sendBtn = document.getElementById("rp-send");

  /* ---------- FORMAT MESSAGE ---------- */

  function formatMessage(text) {
    if (!text) return "";

    if (text.includes("<a ")) return text;

    let formatted = text.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi,
      '<a class="rp-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    if (!formatted.includes("<a ")) {
      formatted = formatted.replace(
        /(https?:\/\/[^\s]+)/gi,
        '<a class="rp-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );
    }

    return formatted;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function createBotAvatar() {
    const avatar = document.createElement("div");
    avatar.className = "rp-avatar";
    avatar.innerHTML = getBotIconSvg();
    return avatar;
  }

  /* ---------- ADD MESSAGE ---------- */

  function addMessage(text, sender) {
    const row = document.createElement("div");
    row.className = `rp-row ${sender === "user" ? "rp-user-row" : "rp-bot-row"}`;

    const msg = document.createElement("div");
    msg.className = `rp-msg ${sender === "user" ? "rp-user" : "rp-bot"}`;
    msg.innerHTML = formatMessage(text);

    if (sender === "user") {
      row.appendChild(msg);
    } else {
      row.appendChild(createBotAvatar());
      row.appendChild(msg);
    }

    messagesEl.appendChild(row);
    scrollToBottom();
  }

  /* ---------- TYPING ---------- */

  let typingEl;

  function showTyping() {
    typingEl = document.createElement("div");
    typingEl.className = "rp-row rp-bot-row";

    const avatar = createBotAvatar();

    const typing = document.createElement("div");
    typing.className = "rp-typing";
    typing.innerHTML = `
      <div class="rp-dot"></div>
      <div class="rp-dot"></div>
      <div class="rp-dot"></div>
    `;

    typingEl.appendChild(avatar);
    typingEl.appendChild(typing);

    messagesEl.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTyping() {
    if (typingEl) typingEl.remove();
    typingEl = null;
  }

  /* ---------- SEND MESSAGE ---------- */

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(text, "user");
    inputEl.value = "";
    showTyping();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          message: text,
          session_id: sessionId
        })
      });

      const data = await res.json();
      hideTyping();

      if (data.session_id) sessionId = data.session_id;

      if (!res.ok) {
        addMessage(data.error || "Sorry — something went wrong.", "bot");
        return;
      }

      addMessage(data.reply || "Sorry — something went wrong.", "bot");
    } catch (err) {
      hideTyping();
      addMessage("Sorry — something went wrong.", "bot");
    }
  }

  /* ---------- EVENTS ---------- */

  sendBtn.onclick = sendMessage;

  inputEl.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  button.onclick = () => {
    widget.style.display = widget.style.display === "flex" ? "none" : "flex";
    if (widget.style.display === "flex") {
      setTimeout(() => inputEl.focus(), 50);
    }
  };

  /* ---------- WELCOME ---------- */

  setTimeout(() => {
    addMessage("Hi! How can I help today?", "bot");
  }, 600);
})();
