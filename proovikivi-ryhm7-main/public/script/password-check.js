document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.querySelector('form');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');

    form.addEventListener('submit', (e) => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!validatePassword(password)) {
            e.preventDefault();
            showAlert('Parool peab olema vähemalt 8 tähemärki, sisaldama suuri ja väikseid tähti ning numbreid!');
        } else if (password !== confirmPassword) {
            e.preventDefault();
            showAlert('Paroolid on erinevad!');
        }
    });

    function validatePassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    function showAlert(message) {
        alert(message);
    }
});

