// Simple navigation menu toggle
const navMenu = {
    toggle: function() {
        const menu = document.getElementById('js-nav-menu');
        const menuShow = document.getElementById('js-nav-menu-show');
        const menuHide = document.getElementById('js-nav-menu-hide');

        menu.classList.toggle('hidden');
        menuShow.classList.toggle('hidden');
        menuHide.classList.toggle('hidden');
    }
};

// Handle smooth scrolling with offset for fixed header
document.addEventListener('DOMContentLoaded', function() {
    // Set up mobile menu button click handler
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            navMenu.toggle();
        });
    }

    // Set up smooth scrolling
    const scrollLinks = document.querySelectorAll('.js-scroll-link');
    const headerOffset = document.querySelector('header').offsetHeight + 5;

    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});