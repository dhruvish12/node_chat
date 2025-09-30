    const socket = io();

    const clientsTotal = document.getElementById('clients-total');

    const messageContainer = document.getElementById('message-container');
    const nameInput = document.getElementById('name-input');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const imageInput = document.getElementById('image-input');
    const previewInside = document.getElementById('preview-inside');    

    let chatName = localStorage.getItem("chatName") || "Anonymous";
    nameInput.value = chatName;

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMeassage();
    });

    socket.on('clients-total', (data) => {
        clientsTotal.innerText = `Total clients connected: ${data}`;
    });

    function sendMeassage() {
        if (messageInput.value === '' && !previewInside.dataset.image) return;
        const data = {
            name: chatName,
            message: messageInput.value,
            dateTime: new Date(),
            image: previewInside.dataset.image || null
        };
        socket.emit('message', data);
        addMessageToUI(true, data);
        messageInput.value = '';
        previewInside.innerHTML = '';
        delete previewInside.dataset.image;
    }

    socket.on('chat-message', (data) => {
        console.log(data);
        addMessageToUI(false, data);
    });

   function addMessageToUI(isOwnMessage, data) {
        clearFeedback();

        let content = "";
        if (data.image) {
            content += `<img src="${data.image}" class="chat-image"><br>`;
        }
        if (data.message) {
            content += data.message;
        }

        const element = `
            <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
            <p class="message">
                ${content}
                <span>${data.name} - ${moment(data.dateTime).fromNow()}</span>
            </p>
            </li>`;
        messageContainer.innerHTML += element;
        scrollToBottom();
    }

    function scrollToBottom() {
       messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }

    messageInput.addEventListener('focus', () => {
        socket.emit('feedback', {
            name: chatName,
            feedback: '✍ is typing...'
        });
    });

    messageInput.addEventListener('keypress', (e) => {
        socket.emit('feedback', {
             name: chatName,
            feedback: '✍ is typing...'
        });
    });

    messageInput.addEventListener('blur', (e) => {
        socket.emit('feedback', {
            name: chatName,
            feedback: ''
        });
    });

    socket.on('feedback', (data) => {
        clearFeedback();
        const element = ` <li class="message-feedback">
                <p class="feedback" id="feedback">
                    ${data.feedback}
                </p>
            </li>`

        messageContainertr.innerHTML += element;
     });

     function clearFeedback() {
        document.querySelectorAll('li.message-feedback').forEach((el) => el.remove());
     }

     imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        previewInside.innerHTML = `<img src="${reader.result}" class="chat-preview" />`;
        previewInside.dataset.image = reader.result;
    };
    reader.readAsDataURL(file);
});
