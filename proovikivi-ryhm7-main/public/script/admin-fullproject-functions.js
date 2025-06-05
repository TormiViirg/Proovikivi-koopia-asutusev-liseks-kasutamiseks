$(document).ready(function() {

    $('.carousel').slick({
        infinite: true,
        slidesToShow: 5,
        slidesToScroll: 1,
        prevArrow: '<button class="carousel-control prev">&#10094;</button>',
        nextArrow: '<button class="carousel-control next">&#10095;</button>',
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    function updateInitialLikeState(projectId, isLiked) {
        const btn = $(`.likeBtn[data-project-id='${projectId}']`);
        if (isLiked) {
            btn.addClass('liked');
        } else {
            btn.removeClass('liked');
        }
    }

    // Like button functionality
    function updateLikeButtonState(projectId) {
        $.ajax({
            method: 'GET',
            url: `/project/like/status/${projectId}`,
            success: function(data) {
                if (data.liked) {
                    $(`.likeBtn[data-project-id='${projectId}']`).addClass('liked');
                } else {
                    $(`.likeBtn[data-project-id='${projectId}']`).removeClass('liked');
                }
                $(`.like-number[data-project-id='${projectId}']`).text(data.likeCount);
            },
            error: function(err) {
                console.error('Failed to update like button state:', err);
            }
        });
    }
    
    $('.likeBtn').click(function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        const btn = $(this);
        const projectId = btn.data('project-id');
        const isLiked = btn.hasClass('liked');

        $.ajax({
            method: 'POST',
            url: `/project/like/${projectId}`,
            success: function(data) {
                if (data.success) {
                    const likeNumber = btn.closest('.like-container').find('.like-number');
                    const currentCount = parseInt(likeNumber.text().trim());
                    likeNumber.text(isLiked ? currentCount - 1 : currentCount + 1);
                    btn.toggleClass('liked');
                } else {
                    console.error('Failed to update like status.');
                }
            },
            error: function(err) {
                console.error('Failed to update like status:', err);
            }
        });
    });

    $('.likeBtn').each(function() {
        const projectId = $(this).data('project-id');
        const isLiked = $(this).hasClass('liked');
        updateLikeButtonState(projectId);
    });

    // Accordion functionality
    var acc = document.getElementsByClassName("accordion");
    var i;
    
    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }

});