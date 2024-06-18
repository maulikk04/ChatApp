document.getElementById('reset-password-form').addEventListener('submit' , async (e)=>{
    e.preventDefault();
    const querystring = window.location.search;
    const urlparams = new URLSearchParams(querystring);
    const token = urlparams.get('token');
    const password = document.getElementById('new-password').value;

    const response = await fetch(`/auth/reset-password?token=${token}` , {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({password:password})
    })
    const result = await response.json();
    const messageElement = document.getElementById('message');
    if (response.ok) {
        messageElement.textContent = "Password changed successfully. You can now log in with your new password.";
        messageElement.style.color = 'green';
    } else {
        messageElement.textContent = result.message;
        messageElement.style.color = 'red';
    }
})