// Skill Description Modal JavaScript
// This file contains all the functionality for the Skill Description modal

// Function to initialize the Skill Description modal
function initializeSkillDescriptionModal() {
    console.log('[Skill Description Modal] Initializing modal');
    
    // The skill description modal is simple and doesn't need much initialization
    // It's mainly used to display skill information when skill pills are clicked
    
    console.log('[Skill Description Modal] Modal initialized successfully');
}

// Function to show skill description
function showSkillDescription(skillName, skillDescription) {
    console.log('[Skill Description Modal] Showing skill description for:', skillName);
    
    // Update modal title and body
    const skillDescModalLabel = document.getElementById('skillDescModalLabel');
    const skillDescModalBody = document.getElementById('skillDescModalBody');
    
    if (skillDescModalLabel) {
        skillDescModalLabel.textContent = skillName;
    }
    
    if (skillDescModalBody) {
        skillDescModalBody.textContent = skillDescription;
    }
    
    // Show the modal
    if (window.skillDescModal) {
        window.skillDescModal.show();
    } else {
        // Fallback: manually show the modal
        console.warn('[Skill Description Modal] Using fallback modal show method');
        const modalEl = document.getElementById('skillDescModal');
        if (modalEl) {
            modalEl.classList.add('show');
            modalEl.style.display = 'block';
            modalEl.removeAttribute('aria-hidden');
            modalEl.removeAttribute('inert');
            // Add backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.id = 'skillDescModalBackdrop';
            document.body.appendChild(backdrop);
            
            // Add click handler to backdrop
            backdrop.addEventListener('click', function() {
                const modalEl = document.getElementById('skillDescModal');
                if (modalEl) {
                    modalEl.classList.remove('show');
                    modalEl.style.display = 'none';
                    modalEl.setAttribute('inert', '');
                    backdrop.remove();
                }
            });
        }
    }
}

// Make functions globally available
window.showSkillDescription = showSkillDescription;
