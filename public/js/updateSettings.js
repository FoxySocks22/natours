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
        ? '/api/v1/users/update-my-password' 
        : '/api/v1/users/update-account';
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
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'data');
        window.setTimeout(() => {
            location.reload();
        }, 5500);
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