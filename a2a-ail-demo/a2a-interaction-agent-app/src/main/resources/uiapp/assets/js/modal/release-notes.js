// Release Notes Modal Functionality
class ReleaseNotesManager {
    constructor() {
        this.modal = null;
        this.contentElement = null;
        this.init();
    }

    init() {
        // Initialize modal
        this.modal = new bootstrap.Modal(document.getElementById('releaseNotesModal'));
        this.contentElement = document.getElementById('releaseNotesContent');
        
        // Add event listener to info button
        const infoBtn = document.getElementById('infoBtn');
        if (infoBtn) {
            infoBtn.addEventListener('click', () => this.showReleaseNotes());
        }
    }

    async showReleaseNotes() {
        try {
            // Show loading state
            this.contentElement.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading release notes...</p>
                </div>
            `;

            // Show modal
            this.modal.show();

            // Load release notes
            const response = await fetch('assets/release-notes.md');
            if (!response.ok) {
                throw new Error(`Failed to load release notes: ${response.status}`);
            }

            const markdown = await response.text();
            
            // Convert markdown to HTML
            const html = this.convertMarkdownToHtml(markdown);
            
            // Update content
            this.contentElement.innerHTML = html;

        } catch (error) {
            console.error('Error loading release notes:', error);
            this.contentElement.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h6 class="alert-heading">Error Loading Release Notes</h6>
                    <p>Failed to load release notes. Please try again later.</p>
                    <hr>
                    <p class="mb-0">Error: ${error.message}</p>
                </div>
            `;
        }
    }

    convertMarkdownToHtml(markdown) {
        // Configure marked options for better rendering
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });

        // Convert markdown to HTML
        let html = marked.parse(markdown);

        // Add custom styling classes
        html = this.addCustomStyling(html);

        return html;
    }

    addCustomStyling(html) {
        // Add custom styling classes for release notes
        return html
            // Links
            .replace(/<a /g, '<a target="_blank" ')
            
            // Code blocks
            .replace(/<pre>/g, '<pre><code>')
            .replace(/<\/pre>/g, '</code></pre>');
    }
}

// Initialize release notes manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReleaseNotesManager();
});
