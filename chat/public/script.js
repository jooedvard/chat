$(() => {
  const username = $("#user");
  const letsChat = $("#chat");
  const form = $(".nickname-form");
  const chat = $(".main");
  const chatArea = $(".messages");
  const text = $("#text");
  const info = $(".info");
  const info2 = $(".info2");
  const image = $("#image");
  const welcome = $(".user");
  const profile = $(".profile-picture");
  const emojiContainer = $(".emoji-container");
  const send = $(".send");  
  const emojisButton = $(".emojis");
  const avatars = $(".avatars");
  const avatarContainer = $(".avatar-container");
  const online = $(".online");

  let socket = io();
  let emojis = ["😀", "😄", "😆", "😅", "🤣", "🙂", "😉", "😍"];
  


  emojiContainer.hide();
  chat.hide();
  info.hide();
  info2.hide();
  image.hide();
  getOnlineUsers();
  setAvatars();
  chooseFile();

  newJoined(socket);
  onLeave(socket);


  letsChat.on("click", (e) => {
    if (username.val() && image.val()) {
      chat.show(250);
      form.slideUp(250);
      avatarContainer.slideUp(250);
      sendMessage(socket);
      updateMessage(socket);
      setEmojis(emojis);
      newConnection(socket, username.val(), image.val());
      
    }
    else{
      let error = $(".error");
      error.slideDown(250);
      setTimeout(()=>{error.slideUp();username.focus();},1000);
      
    }
  });

  function newConnection(socket, user, img) {
    socket.emit("new user", user, img);
    welcome.text(`Hello, ${user}!`);
    profile.attr("src", img);
   
    
  }

  function newJoined(socket) {
    socket.on("new join", (data) => {
      info.find("span").text(data.text);
      info.find("img").attr("src", data.img);
      info.fadeIn(250);
      setTimeout(() => {
        info.fadeOut();
      }, 1500);
      online.text("Online: "+data.online);
    });
  }

  function onLeave(socket) {
   
  
    socket.on("somebody left the chat", () => {
      info2.fadeIn(250);
      getOnlineUsers();
      setTimeout(() => {
        info2.fadeOut();
      }, 1500);
    });
  }

  function sendMessage(socket) {
    send.on("click", () => {
      emitSendMessage(socket);
    });

    text.on("keypress", (e) => {
      if (e.keyCode == 13) {
        emitSendMessage(socket);
      }
    });
  }

  function emitSendMessage(socket) {
    socket.emit("send message", text.val(), image.val(), username.val());
    text.val("");
  }

  function updateMessage(socket) {
    socket.on("refresh messages", (msg) => {
      let value = 9000;
      let time = new Date();
      let clock = timeStamp(time);

      chatArea.append(
        `
          <div class="message-row">
          <div class="new-message">
          <img src="${msg.img}"/>
          <span class="user-text">
          <span>${msg.text}</span>
          <span class="user-in-chat">${msg.user}</span>
          </span>
          </div>
          <span class="timestamp">${clock}</span>
          </div>
        `
      );
      chatArea.animate({ scrollTop: value });
    });
  }

  function timeStamp(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
   

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;

    }
    let timestamp = hours + ":" + minutes;
    return timestamp;
  }

  function setEmojis(emojis) {
    emojis.forEach((emoji) => {
      emojiContainer.append(emojiToString(emoji));
    });

    emojisButton.on("click", (e) => {
      e.preventDefault();
      emojiContainer.slideDown(250);
    });

    let elements = $(".emoji");
    elements.on("click", (e) => {
      let selectedEmoji = e.target.textContent;
      text.val(text.val() + selectedEmoji);
      emojiContainer.slideUp(250);
    });
  }

  function emojiToString(code) {
    return `<div class="emoji">${code}</div>`;
  }

  function setAvatars(){
      let refresh = $(".refresh-avatars"); 
      refresh.on("click",(e)=>{
          e.preventDefault();
          getCats();
      })
      getCats();

   

  }

  function getCats(){
   
    $.ajax({
      method:"GET",
      url :'https://api.thecatapi.com/v1/images/search?limit=5',
      header :'x-api-key: 293c7dd4-1a91-45b9-8b61-46f29d7b9ff1',
      success:function(cats){
          avatars.empty();
          avatars.hide();
          cats.forEach(cat=>{
            avatars.append(`<img src="${cat.url}" class="cat"/>`)
          })
          avatars.fadeIn(250);
          let cat = $(".cat");
          cat.on("click",(e)=>{
              let selected = e.target;
              cat.removeClass("selected-avatar");
              selected.classList.add("selected-avatar");
              let catPicture = e.target.src;
              image.val(catPicture);
          })
      },
      error:function(err){
        console.log(err);
      }
    })
  }
  
  function chooseFile(){
    let fileInput = $("#myfile");
    let preview = $(".preview");
    fileInput.on("change",(e)=>{
        let reader = new FileReader();
        let file = e.target.files[0];
        reader.readAsDataURL(file);
        reader.addEventListener("load",(e)=>{
            let result = reader.result;
            image.val(result);
            preview.find("img").attr("src",result);
        })
    })
  }

  function getOnlineUsers(){
    $.ajax({
      method:"GET",
      url:"/onlineusers",
      success:function(data){
        setOnlineUsersText(data.online)
      }
    })
  }

  function setOnlineUsersText(number){
      online.text("Online: "+number);
  }

 
});
