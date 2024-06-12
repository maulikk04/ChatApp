function togglePassword() {
    const password = document.getElementById('password');
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
}

document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmpassword = document.getElementById('confirmpassword').value;

    const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, email: email, password: password , confirmpassword:confirmpassword})
    });

    const result = await response.json();
    const messageElement = document.getElementById('message');
    if (response.ok) {
        window.location.href = `/dashboard?id=${result.userid}`;
    } else {
        messageElement.textContent = result.message;
        messageElement.style.color = 'red';
    }
});