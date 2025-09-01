# CSS File Structure

This directory contains the CSS files for the A2A Interaction Agent App UI.

## Modal Styles (Split from modals.css)

The original `modals.css` file has been split into multiple focused CSS files to match the modal JavaScript files:

### `base-modal.css`
- Common modal backdrop styles
- General modal button styles
- Reasoning engine modal styles
- Shared modal functionality

### `chat-modal.css`
- Chat modal dialog styles
- Chat container and message styling
- Message bubbles (user/agent)
- Markdown styling for agent messages
- Chat input and send button
- Typing indicators and animations

### `interaction-modal.css`
- Interaction modal specific styles
- Interaction plan and task tiles
- Task request/response styling
- Legacy session modal styles (for compatibility)

### `exchange-modal.css`
- Exchange modal dialog styles
- Exchange assets grid layout
- Asset tiles and hover effects
- Loading spinners and states
- Asset pills and remove buttons
- Responsive grid adjustments

### `add-agent-modal.css`
- Add agent modal specific styles
- Placeholder for future styling needs

### `skill-description-modal.css`
- Skill description modal specific styles
- Placeholder for future styling needs

## Other CSS Files

- `base.css` - Base styles and variables
- `layout.css` - Layout and grid styles
- `conversation.css` - Conversation area styles
- `agents.css` - Agent management styles
- `sessions.css` - Session management styles
- `release-notes.css` - Release notes styling

## Benefits of Splitting

1. **Better Organization**: Each modal has its own dedicated CSS file
2. **Easier Maintenance**: Developers can work on specific modal styles without affecting others
3. **Modular Loading**: Only load the CSS needed for specific functionality
4. **Clearer Dependencies**: Easy to see which styles belong to which modal
5. **Reduced Conflicts**: Less chance of CSS conflicts between different modals

## Usage

All CSS files are loaded in the main `index.html` file. The split maintains the same functionality while providing better organization and maintainability.
