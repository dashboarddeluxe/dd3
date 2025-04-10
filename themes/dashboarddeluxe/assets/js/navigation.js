// Simple navigation menu toggle
const navMenu = {
    toggle: function() {
        const menu = document.getElementById('js-nav-menu');
        const menuShow = document.getElementById('js-nav-menu-show');
        const menuHide = document.getElementById('js-nav-menu-hide');

        menu.classList.toggle('hidden');
        menuShow.classList.toggle('hidden');
        menuHide.classList.toggle('hidden');
    },
    hide: function() {
        const menu = document.getElementById('js-nav-menu');
        const menuShow = document.getElementById('js-nav-menu-show');
        const menuHide = document.getElementById('js-nav-menu-hide');

        if (!menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
            menuShow.classList.remove('hidden');
            menuHide.classList.add('hidden');
        }
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

    // Check if we should scroll to a section on page load (from URL hash)
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            setTimeout(function() {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 100); // Small delay to ensure page is fully loaded
        }
    }

    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default if it's not a modified click (ctrl, alt, shift, meta)
            // This allows links to open in new tabs with ctrl+click or middle mouse click
            if (!e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey && e.which === 1) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                // Close mobile menu when link is clicked
                navMenu.hide();

                if (targetElement) {
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL hash without causing a jump (pushState is smoother)
                    history.pushState(null, null, '#' + targetId);
                }
            }
        });
    });
});