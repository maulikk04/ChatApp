let reciever_id = null;
let sender_id = null;
const socket = io();
function selectUser(userid, currentuserid) {
    reciever_id = userid;
    sender_id = currentuserid;
    document.getElementById('welcome-message').classList.add('hidden');
    document.getElementById('chat-area').classList.remove('hidden');

    document.querySelectorAll('.user-button').forEach(button => {
        button.classList.remove('active');
    });

    document.querySelector(`.user-button[data-recipient-id="${userid}"]`).classList.add('active');

    fetchmessage();

    socket.emit('join-room', currentuserid);
    
}

async function fetchmessage() {
    const response = await fetch('/message/allmessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sender_id: sender_id,
            reciever_id: reciever_id
        })
    });
    if (response.ok) {
        const messages = await response.json();
        displaymessage(messages);
    }

}

function displaymessage(messages) {
    const msg = document.getElementById('chat-messages');
    msg.innerHTML = '';
    messages.forEach(message => {
        const msgele = document.createElement('div');
        msgele.classList.add('message');
        msgele.textContent = message.text;

        if (message.sender_id === sender_id) {
            msgele.classList.add('message-sent');
        }
        else {
            msgele.classList.add('message-received');
        }

        msg.appendChild(msgele);
    })

    msg.scrollTop = msg.scrollHeight;
}

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (!message || !reciever_id) {
        alert('Please select a user and type a message.');
        return;
    }

    const response = await fetch('/message/sendmessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sender_id: sender_id,
            reciever_id: reciever_id,
            text: message
        })
    });

    if (response.ok) {
        messageInput.value = '';
        displaySentMessage(message);
        socket.emit('send-message', {
            message: message,
            sender_id: sender_id,
            reciever_id: reciever_id
        })
    } else {
        alert('Failed to send message.');
    }

}

socket.on('new-message', (message) => {
    displayRecievedMessage(message);
})

function displayRecievedMessage(message) {
    if (message.reciever_id === sender_id) {
        const chatmsg = document.getElementById('chat-messages');
        const msgele = document.createElement('div');
        msgele.classList.add('message');
        msgele.textContent = message.message;
        msgele.classList.add('message-received');
        chatmsg.appendChild(msgele);
        chatmsg.scrollTop = chatmsg.scrollHeight;
    }

}

function displaySentMessage(message) {
    const chatmessages = document.getElementById('chat-messages');
    const msgele = document.createElement('div');
    msgele.classList.add('message');
    msgele.textContent = message;
    msgele.classList.add('message-sent');
    chatmessages.appendChild(msgele);
    chatmessages.scrollTop = chatmessages.scrollHeight;
}

