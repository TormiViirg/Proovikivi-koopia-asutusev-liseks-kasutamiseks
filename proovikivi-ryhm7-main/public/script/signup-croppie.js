document.addEventListener('DOMContentLoaded', function () {
    var photoInput = document.getElementById('photoInput');
    var croppieContainer = document.getElementById('croppieContainer');
    var croppedImage = document.getElementById('croppedImage');
    var form = document.querySelector('.formContainer');
    var deleteImageButton = document.getElementById('deleteImageButton');

    croppedImage.value = '';

    var croppieInstance = new Croppie(croppieContainer, {
        viewport: { width: 150, height: 150, type: 'circle' },
        boundary: { width: 160, height: 160 },
        showZoomer: true,
    });

    photoInput.addEventListener('change', function () {
        var reader = new FileReader();
        reader.onload = function (e) {
            croppieContainer.style.display = 'block';
            deleteImageButton.style.display = 'block';
            croppieInstance.bind({
                url: e.target.result,
            });
        };
        reader.readAsDataURL(photoInput.files[0]);
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (photoInput.files.length > 0) {
            croppieInstance.result({
                type: 'base64',
                size: { width: 150, height: 150 },
                format: 'png',
            }).then(function (base64) {
                croppedImage.value = base64;
                form.submit();
            });
        } else {
            form.submit();
        }
    });

    deleteImageButton.addEventListener('click', function () {
        photoInput.value = '';
        croppieContainer.style.display = 'none';
        deleteImageButton.style.display = 'none';
        croppieInstance.destroy();
        croppieInstance = new Croppie(croppieContainer, {
            viewport: { width: 150, height: 150, type: 'circle' },
            boundary: { width: 160, height: 160 },
            showZoomer: true,
        });
        croppedImage.value = '';
    });

    const submitButton = document.querySelector('.submitButton');

    submitButton.addEventListener('click', function (event) {
        event.preventDefault();

        if (croppieInstance) {
            croppieInstance.result('base64').then(function (result) {
                croppedImage.value = result;
                submitButton.closest('form').submit();
            });
        } else {
            submitButton.closest('form').submit();
        }
    });
});