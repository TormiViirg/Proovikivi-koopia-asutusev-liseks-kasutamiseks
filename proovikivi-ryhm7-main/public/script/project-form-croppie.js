$(document).ready(function() {
    var $croppieContainer = $('#croppieContainer');
    var croppieInstance;

    $('#photoInput').on('change', function() {
        var reader = new FileReader();
        reader.onload = function(e) {
            if (croppieInstance) {
                croppieInstance.croppie('destroy');
                $croppieContainer.html(''); // Clear the container
            }
            croppieInstance = $croppieContainer.croppie({
                viewport: { width: 840, height: 490 }, 
                boundary: { width: 860, height: 510 }, 
                showZoomer: true
            });
            croppieInstance.croppie('bind', {
                url: e.target.result
            });
            $croppieContainer.show();
        }
        reader.readAsDataURL(this.files[0]);
    });

    $('#projectForm').on('submit', function(event) {
        event.preventDefault();

        if ($('#photoInput').val()) {
            croppieInstance.croppie('result', {
                type: 'base64',
                size: 'viewport'
            }).then(function(base64) {
                $('#croppedImage').val(base64);
                event.currentTarget.submit();
            });
        } else {
            event.currentTarget.submit();
        }
    });

    $('#clearImageButton').click(function(e) {
        e.preventDefault();
        $('#photoInput').val('');
        if (croppieInstance) {
            croppieInstance.croppie('destroy');
            croppieInstance = null;
            $croppieContainer.html(''); 
        }
        $croppieContainer.hide();
    });
});
