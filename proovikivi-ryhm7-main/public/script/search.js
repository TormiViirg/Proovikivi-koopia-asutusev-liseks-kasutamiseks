document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const projectsForm = document.getElementById('projects-form');
    const pageNavigationForm = document.getElementById('pageNavigationForm');
    const filtersSelect = document.getElementById('filters');
    const searchInput = document.getElementById('search-words');
    const searchOption = document.getElementById('search-option');
    const currentPageInput = document.getElementById('currentPage');
    const searchNav = document.getElementById('searchNav');
    const totalPages = document.getElementById('totalPages');
    const firstPageInput = document.getElementById('firstPage');
    const prevPageInput = document.getElementById('prevPage');
    const nextPageInput = document.getElementById('nextPage');
    const lastPageInput = document.getElementById('lastPage');
    
    // Total count of pages
    const totalCount = parseInt(totalPages.innerText);

    // Function to submit the projects form with optional newPage parameter
    function submitProjectsForm(newPage = 1) {
        const url = new URL('/projects', window.location.origin);
        const searchQuery = searchInput.value.trim();
        const filtersQuery = filtersSelect.value;
        const searchOptionQuery = searchOption.value;

        let currentPage = parseInt(newPage);

        if (isNaN(currentPage) || currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalCount) {
            currentPage = totalCount;
        }

        url.searchParams.set('page', currentPage);

        if (searchQuery) {
            url.searchParams.set('search', searchQuery);
        }
        if (filtersQuery) {
            url.searchParams.set('filters', filtersQuery);
        }
        if (searchOptionQuery) {
            url.searchParams.set('searchOption', searchOptionQuery);
        }

        window.location.href = url.toString();
    }

    // Event listeners for form submissions and user inputs
    projectsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitProjectsForm();
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitProjectsForm();
        }
    });

    filtersSelect.addEventListener('change', function() {
        submitProjectsForm();
    });

    pageNavigationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitProjectsForm();
    });

    // Event listeners for navigation buttons (first, prev, next, last)
    firstPageInput.addEventListener('click', function() {
        if (currentPageInput.value > '1') { 
            currentPageInput.value = 1;
            submitProjectsForm(1);
        }
    });

    prevPageInput.addEventListener('click', function() {
        let currentPage = parseInt(currentPageInput.value);
        if (currentPage > 1) { 
            currentPage--;
            currentPageInput.value = currentPage;
            submitProjectsForm(currentPage);
        }
    });

    nextPageInput.addEventListener('click', function() {
        let currentPage = parseInt(currentPageInput.value);
        if (currentPage < totalCount) {
            currentPage++;
            currentPageInput.value = currentPage;
            submitProjectsForm(currentPage);
        }
    });

    lastPageInput.addEventListener('click', function() {
        if (currentPageInput.value !== totalCount.toString()) {
            currentPageInput.value = totalCount;
            submitProjectsForm(totalCount);
        }
    });

    // Event listener for search option navigation buttons
    searchNav.addEventListener('click', function(event) {
        if (event.target.classList.contains('search-nav-option')) {
            const value = event.target.value;
            searchOption.value = value;
            submitProjectsForm();
        }
    });

});