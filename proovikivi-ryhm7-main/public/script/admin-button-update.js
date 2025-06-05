document.addEventListener('DOMContentLoaded', function() {
    // Function to update button styles based on searchOptionQuery
    function updateButtonStyles() {
        var searchOptionQuery = document.getElementById('search-option').value;

        // Reset all button styles to default
        document.querySelectorAll('.search-nav-option').forEach(function(button) {
            button.classList.remove('active-button');
        });

        // Apply active style to the appropriate button
        switch(searchOptionQuery) {
            case 'My-Projects':
                document.getElementById('search-nav1').classList.add('active-button');
                break;
            case 'Favourites':
                document.getElementById('search-nav2').classList.add('active-button');
                break;
            case 'All-Projects':
                document.getElementById('search-nav3').classList.add('active-button');
                break;
            default:
                // Handle default case
                break;
        }
    }

    // Call updateButtonStyles initially
    updateButtonStyles();
});