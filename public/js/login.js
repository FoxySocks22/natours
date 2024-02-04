/* eslint-disable */

const displayMessage = (className, messgae) => {
    const displayError = document.getElementById('message');
    displayError.innerHTML = messgae;
    displayError.classList = '';
    displayError.classList.add(className);
    if(className === 'valid') {
        window.setTimeout(() => {
            location.assign('/');
        }, 1500);
    }
}

const login = async(email, password) => {
    try {
        const res = await axios({
            method: 'post',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        if(res.data.status === 'success') {
            displayMessage('valid', `welcome back ${res.data.data.user.name}`);
        }
    } catch(err) {
        displayMessage('error', err.response.data.message);
    }
}

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
})