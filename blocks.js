document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.manifesto-card');
    const playground = document.getElementById('playground');
    // const resetButton = document.getElementById('resetButton');

    // Store original positions for reset functionality
    const originalPositions = [];

    cards.forEach(function(card) {
        // Save original position and rotation
        originalPositions.push({
            element: card,
            top: card.style.top || window.getComputedStyle(card).top,
            left: card.style.left || window.getComputedStyle(card).left,
            transform: card.style.transform || window.getComputedStyle(card).transform
        });
        
        let isDragging = false;
        let offsetX, offsetY;
        
        // Touch start handler
        card.addEventListener('touchstart', function(e) {
            handleDragStart(e.touches[0]);
            e.preventDefault();
        });
        
        // Mouse down handler
        card.addEventListener('mousedown', function(e) {
            handleDragStart(e);
        });
        
        function handleDragStart(e) {
            isDragging = true;
            
            // Get initial position of cursor/touch relative to the card
            const rect = card.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            // Add active class for visual feedback
            card.classList.add('drag-active');
            
            // Bring card to front
            cards.forEach(c => {
                if (c !== card) c.style.zIndex = 1;
            });
            card.style.zIndex = 10;
        }
        
        // Touch move handler
        document.addEventListener('touchmove', function(e) {
            if (isDragging) {
                handleDrag(e.touches[0]);
            }
        });
        
        // Mouse move handler
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                handleDrag(e);
            }
        });
        
        function handleDrag(e) {
            if (!isDragging) return;
            
            const playgroundRect = playground.getBoundingClientRect();
            
            // Calculate new position, keeping card within playground boundaries
            let newX = e.clientX - playgroundRect.left - offsetX;
            let newY = e.clientY - playgroundRect.top - offsetY;
            
            // Get card dimensions
            const cardRect = card.getBoundingClientRect();
            
            // Set boundaries to keep card mostly visible within playground
            const maxX = playgroundRect.width - cardRect.width * 0.5;
            const maxY = playgroundRect.height - cardRect.height * 0.5;
            
            newX = Math.max(-cardRect.width * 0.3, Math.min(newX, maxX));
            newY = Math.max(-cardRect.height * 0.3, Math.min(newY, maxY));
            
            // Update card position
            card.style.left = newX + 'px';
            card.style.top = newY + 'px';
        }
        
        // Touch end handler
        document.addEventListener('touchend', handleDragEnd);
        
        // Mouse up handler
        document.addEventListener('mouseup', handleDragEnd);
        
        function handleDragEnd() {
            if (isDragging) {
                isDragging = false;
                card.classList.remove('drag-active');
            }
        }
    });
});