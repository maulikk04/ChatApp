document.getElementById('forgot-password-form').addEventListener('submit' , async (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const response = await fetch('/auth/forgot-password' , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({email:email})

    })
    console.log(response);
    const result = await response.json();
    console.log(result);
    const messageElement = document.getElementById('message');
    if(response.ok)
    {
        messageElement.textContent = "Password reset link has been sent to your email.";
        messageElement.style.color = "green";
    }
    else
    {
        messageElement.textContent = result.message;
        messageElement.style.color = 'red';
    }
})


