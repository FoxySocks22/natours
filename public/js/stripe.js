/* eslint-disable */

const stripe = Stripe('pk_test_51Ogqp6CUvXmDfa4cfLEB0eN1RbvafKoMhJWK15RWD7DRydzMJmM7lOO5dkbVuVohX7JrPbBGeRoTNvuZ9edXdVsV00Y9nfZ0v5')
const bookBtn = document.getElementById('book-tour');
import { showAlert } from './alert.js';

const bookTour = async tourId => {
    try {
        const session = await axios(
            `http://127.0.0.1:8000/api/v1/booking/checkout-session/${tourId}`
        )
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch(err){
        showAlert('error', err);
    }
}

if(bookBtn){
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...'
        const { tourId } = e.target.dataset; 
        bookTour(tourId);
    });
}