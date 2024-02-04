/* eslint-disable */

// Modules
import { showAlert } from './alert.js';

// Variables
const dataForm = document.querySelector('.form-user-data');
const dataPassword = document.querySelector('.form-user-password');
const passwordResetButton = document.getElementById('pswd-reset');

const updateSettings = async(data, type) => {
    try {
        const url = type === 'password' 
        ? 'http://127.0.0.1:8000/api/v1/users/update-my-password' 
        : 'http://127.0.0.1:8000/api/v1/users/update-account';
        const res = await axios({
            method: 'patch',
            url,
            data
        })
        if(res.data.status === 'success') {
            showAlert('success', `Your ${type.toUpperCase()} was updated.`);
        }
    } catch(err){
        showAlert('error', err.response.data.message);
    }
}

if(dataForm){
    dataForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        updateSettings({ name, email }, 'data');
    })
}

if(dataPassword){
    dataPassword.addEventListener('submit', async e => {
        e.preventDefault();
        passwordResetButton.textContent = 'Updating...'
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({ passwordCurrent, password, passwordConfirm}, 'password');
        passwordResetButton.textContent = 'Save Password'
        dataPassword.reset();
    })
}