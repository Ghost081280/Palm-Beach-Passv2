// device-detector.js - Add this script tag to your index.html <head>
(function() {
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
            localStorage.getItem('userPasses') ||
            window.location.search.includes('mobile=true')
        );
    }
    
    function shouldUseMobilePurchase() {
        return isMobilePhone() && 
               !localStorage.getItem('isLoggedIn') &&
               !window.location.pathname.includes('mobile');
    }
    
    // Route logic
    function routeToCorrectVersion() {
        const currentPath = window.location.pathname;
        
        // Don't redirect if already on mobile pages
        if (currentPath.includes('mobile')) return;
        
        // Route to mobile app if user has passes
        if (shouldUseMobileApp()) {
            console.log('Redirecting to mobile app...');
            window.location.href = './mobile.html' + window.location.search;
            return;
        }
        
        // Route to mobile purchase flow for new mobile users
        if (shouldUseMobilePurchase() && currentPath === '/' || currentPath.includes('index.html')) {
            console.log('Redirecting to mobile purchase...');
            window.location.href = './mobile-purchase.html' + window.location.search;
            return;
        }
        
        // Add mobile app promo for desktop users with passes
        if (!isMobilePhone() && localStorage.getItem('isLoggedIn') === 'true') {
            setTimeout(showMobileAppPromo, 3000);
        }
    }
    
    function showMobileAppPromo() {
        if (document.getElementById('mobile-promo')) return; // Don't show twice
        
        const promo = document.createElement('div');
        promo.id = 'mobile-promo';
        promo.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #2D5016, #006B7D);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                z-index: 1000;
                max-width: 280px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: slideIn 0.3s ease-out;
            ">
                <div style="font-weight: 600; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    📱 Mobile App Available
                </div>
                <div style="font-size: 0.85rem; margin-bottom: 1rem; opacity: 0.9; line-height: 1.4;">
                    Get instant access to your passes on mobile
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="openMobileDemo()" style="
                        background: rgba(255,255,255,0.9);
                        border: none;
                        color: #2D5016;
                        padding: 0.5rem 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.8rem;
                        font-weight: 600;
                        flex: 1;
                    ">Try Mobile Version</button>
                    <button onclick="this.closest('#mobile-promo').remove()" style="
                        background: transparent;
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 0.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.8rem;
                        width: 30px;
                    ">×</button>
                </div>
            </div>
        `;
        
        // Add animation
        if (!document.getElementById('mobile-promo-style')) {
            const style = document.createElement('style');
            style.id = 'mobile-promo-style';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(promo);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (document.getElementById('mobile-promo')) {
                document.getElementById('mobile-promo').remove();
            }
        }, 8000);
    }
    
    // Open mobile demo function
    window.openMobileDemo = function() {
        const width = 375;
        const height = 812;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);
        
        const mobileWindow = window.open(
            './mobile.html?demo=true',
            'MobileDemo',
            `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
        );
        
        if (mobileWindow) {
            document.getElementById('mobile-promo').remove();
        }
    };
    
    // Add query parameter helpers for testing
    window.testMobile = function() {
        window.location.href = './mobile.html?test=true';
    };
    
    window.testMobilePurchase = function() {
        window.location.href = './mobile-purchase.html?test=true';
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', routeToCorrectVersion);
    } else {
        routeToCorrectVersion();
    }
    
    // Debug info for client feedback
    console.log('Device Detection:', {
        isMobile: isMobilePhone(),
        screenWidth: window.screen.width,
        userAgent: navigator.userAgent,
        hasLoggedIn: localStorage.getItem('isLoggedIn'),
        hasPasses: localStorage.getItem('userPasses')
    });
})();
