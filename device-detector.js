// device-detector.js - Fixed for GitHub Pages compatibility
(function() {
    console.log('Device detector loading...');
    
    // Simple mobile detection
    function isMobilePhone() {
        const userAgent = navigator.userAgent;
        const screenWidth = window.screen.width;
        
        return (
            (/Android/i.test(userAgent) && screenWidth < 768) ||
            (/iPhone/i.test(userAgent)) ||
            (/Windows Phone/i.test(userAgent)) ||
            (screenWidth < 768 && 'ontouchstart' in window)
        ) && !(/iPad/i.test(userAgent)); // Exclude iPads
    }
    
    function shouldUseMobileApp() {
        return isMobilePhone() && (
            localStorage.getItem('isLoggedIn') === 'true' ||
            localStorage.getItem('userPasses')
        );
    }
    
    function shouldUseMobilePurchase() {
        return isMobilePhone() && 
               !localStorage.getItem('isLoggedIn') &&
               !localStorage.getItem('userPasses');
    }
    
    // Get the correct base path for GitHub Pages
    function getBasePath() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        // For GitHub Pages (username.github.io/repo-name)
        if (hostname.includes('github.io')) {
            const pathParts = pathname.split('/').filter(part => part);
            if (pathParts.length > 0 && !pathParts[0].includes('.html')) {
                return `/${pathParts[0]}/`;
            }
        }
        
        // For custom domains or local development
        return '/';
    }
    
    // Route logic - Fixed for GitHub Pages
    function routeToCorrectVersion() {
        // Don't redirect if already on mobile pages
        const currentPath = window.location.pathname;
        if (currentPath.includes('mobile')) {
            console.log('Already on mobile page, no redirect needed');
            return;
        }
        
        const basePath = getBasePath();
        console.log('Base path:', basePath);
        
        // Route to mobile app if user has passes/is logged in
        if (shouldUseMobileApp()) {
            console.log('Redirecting to mobile app...');
            const mobileUrl = basePath + 'mobile.html';
            window.location.href = mobileUrl;
            return;
        }
        
        // Route to mobile purchase flow for new mobile users
        if (shouldUseMobilePurchase()) {
            console.log('Redirecting to mobile purchase...');
            const mobilePurchaseUrl = basePath + 'mobile-purchase.html';
            window.location.href = mobilePurchaseUrl;
            return;
        }
        
        console.log('No mobile redirect needed');
    }
    
    // Initialize when DOM is ready
    function initialize() {
        // Only run on index page or root
        const currentPath = window.location.pathname;
        const basePath = getBasePath();
        
        if (currentPath === basePath || 
            currentPath === basePath + 'index.html' || 
            currentPath === '/' || 
            currentPath === '/index.html') {
            
            // Add small delay to ensure page is loaded
            setTimeout(routeToCorrectVersion, 100);
        }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Debug info
    console.log('Device Detection Info:', {
        isMobile: isMobilePhone(),
        screenWidth: window.screen.width,
        userAgent: navigator.userAgent,
        hasLoggedIn: localStorage.getItem('isLoggedIn'),
        hasPasses: localStorage.getItem('userPasses'),
        basePath: getBasePath(),
        currentPath: window.location.pathname,
        hostname: window.location.hostname
    });
})();
