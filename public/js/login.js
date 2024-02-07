/* eslint-disable */

// Modules
import { showAlert } from './alert.js';

const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout');

const login = async(email, password) => {
    try {
        const res = await axios({
            method: 'post',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        if(res.data.status === 'success') {
            showAlert('success', `Welcome back ${res.data.data.user.name.split(' ')[0]}`);
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch(err) {
        showAlert('error', err.response.data.message);
    }
}

if(loginForm){
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    })
}

const logout = async() => {
    try {
        const res = await axios({
            method: 'get',
            url: '/api/v1/users/logout'
        });
        if(res.data.status === 'success') {
            showAlert('success', 'Goodbye, see you next time.');
            window.setTimeout(() => {
                location.reload(true);
            }, 2000);
        }
    } catch(err) {
        showAlert('error', 'Something went wrong.');
    }
}

if(logoutBtn) logoutBtn.addEventListener('click', logout);

// The true on location.reload(true) forces a reload from the server
// Look into bundler and polyfill