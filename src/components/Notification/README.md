# Notification System

A React Context-based notification system for displaying temporary messages like warnings, errors, success messages, and information popups.

## Features

- **Multiple notification types**: success, warning, error, info
- **Customizable duration**: Set how long notifications stay visible
- **Auto-dismiss**: Notifications automatically disappear after specified time
- **Manual dismiss**: Users can close notifications manually
- **Global access**: Use anywhere within the Planner component tree
- **Responsive design**: Notifications are positioned and styled for mobile and desktop
- **Rich animations**: Smooth enter/exit animations with different effects per type
  - **Slide-in**: Default smooth slide from right
  - **Subtle bounce**: Success notifications with gentle entrance
  - **Soft pulse**: Success notifications have a subtle pulse effect
  - **Staggered**: Multiple notifications appear with reduced timing
  - **Interactive**: Minimal hover effects for better user experience

## Setup

The notification system is already integrated into the `DynamicSizePlanner` component. All child components automatically have access to the notification functions.

```tsx
// The system is wrapped around the planner:
<NotificationProvider>
  <ResizePlanner render={(dimensions) => (
    <Planner width={dimensions.width} height={dimensions.height} />
  )} />
  <NotificationContainer />
</NotificationProvider>
```

## Usage

### Basic Usage

```tsx
import { useNotification } from '../Notification';

export const MyComponent = () => {
  const { showSuccess, showWarning, showError, showInfo } = useNotification();

  const handleSave = () => {
    try {
      // ... save logic
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError('Failed to save data');
    }
  };

  return (
    <button onClick={handleSave}>Save</button>
  );
};
```

### Advanced Usage

```tsx
import { useNotification } from '../Notification';

export const AdvancedComponent = () => {
  const { showSuccess, showWarning, showError, showInfo, addNotification, removeNotification } = useNotification();

  // Custom duration (in milliseconds)
  const handleCustomDuration = () => {
    showSuccess('This message stays for 5 seconds', 5000);
  };

  // Persistent notification (won't auto-close)
  const handlePersistent = () => {
    showError('Critical error - please review', 0);
  };

  // Using the generic addNotification method
  const handleCustomNotification = () => {
    addNotification({
      type: 'warning',
      message: 'Custom notification with full control',
      duration: 4000
    });
  };

  return (
    <div>
      <button onClick={handleCustomDuration}>5 Second Message</button>
      <button onClick={handlePersistent}>Persistent Error</button>
      <button onClick={handleCustomNotification}>Custom Notification</button>
    </div>
  );
};
```

## API Reference

### useNotification Hook

```tsx
const {
  notifications,           // Array of current notifications
  addNotification,         // Add a custom notification
  removeNotification,      // Manually remove a notification by ID
  showSuccess,            // Show success notification
  showWarning,            // Show warning notification  
  showError,              // Show error notification
  showInfo                // Show info notification
} = useNotification();
```

### Notification Types

- **success**: Green color scheme, checkmark icon
- **warning**: Yellow color scheme, warning triangle icon
- **error**: Red color scheme, X circle icon
- **info**: Blue color scheme, info icon

### Notification Methods

#### showSuccess(message, duration?)
- `message`: string - The message to display
- `duration`: number (optional) - Duration in milliseconds (default: 3000)

#### showWarning(message, duration?)
- `message`: string - The message to display
- `duration`: number (optional) - Duration in milliseconds (default: 3000)

#### showError(message, duration?)
- `message`: string - The message to display
- `duration`: number (optional) - Duration in milliseconds (default: 3000)

#### showInfo(message, duration?)
- `message`: string - The message to display  
- `duration`: number (optional) - Duration in milliseconds (default: 3000)

#### addNotification(notification)
- `notification`: object with `type`, `message`, and optional `duration`

#### removeNotification(id)
- `id`: string - The ID of the notification to remove

## Examples in the Planner

The notification system is already integrated into several Planner operations:

1. **Save operations**: Success/error messages when saving to browser
2. **File operations**: Upload/download success and error messages
3. **Surface operations**: Warnings for invalid operations
4. **Undo/Redo**: Info messages confirming actions

## Styling

The notifications use Tailwind CSS classes and are positioned fixed in the top-right corner. They include:

- Background blur effect
- Color-coded borders and backgrounds
- Smooth animations
- Responsive design
- Close button for manual dismissal

## Animations

The notification system includes several animation types:

### Enter Animations
- **Default**: Gentle slide-in from the right with ease-out curve
- **Subtle bounce**: Success notifications use a gentle entrance with minimal spring
- **Stagger**: Multiple notifications appear with 50ms delays for a soft cascading effect

### Exit Animations
- **Slide-out**: Notifications slide out to the right when dismissed
- **Quick fade**: Fast 250ms exit animation for responsiveness

### Hover Effects
- **Notification cards**: Minimal scale (101%) and slight left movement on hover
- **Icons**: Gentle scale (105%) on hover
- **Close button**: Subtle scale (105%) and 45-degree rotation on hover

### Special Effects
- **Success pulse**: Success notifications have a very subtle green pulse effect
- **Reduced opacity**: All notifications use 95% opacity to be less distracting
- **Container fade**: The entire container gently fades in when first notification appears

### Design Philosophy
- **Non-intrusive**: Notifications are designed to inform without disrupting workflow
- **Quick feedback**: Shorter default duration (2.5s) for faster interaction
- **Subtle presence**: Reduced shadows, smaller sizes, and gentler animations
- **Accessibility**: Maintains readability while being less visually demanding

### CSS Classes
Custom animation classes are defined in `animations.css`:
- `.notification-enter` - Default slide-in animation
- `.notification-exit` - Slide-out animation
- `.notification-bounce` - Bouncy entrance for success notifications
- `.notification-success` - Pulse effect for success notifications

## Customization

To modify notification appearance, edit the `getNotificationStyles` function in `NotificationContainer.tsx`. To change positioning, modify the container div classes.

## Translations

Notification messages support internationalization. Add your notification messages to the translation files under `planner.notifications`:

```json
{
  "planner": {
    "notifications": {
      "saveSuccess": "Surface saved to browser successfully",
      "saveError": "Failed to save surface to browser",
      "downloadSuccess": "Surface downloaded successfully",
      // ... more messages
    }
  }
}
```
