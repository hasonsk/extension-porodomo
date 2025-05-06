# Focuzd - Pomodoro Timer Chrome Extension Installation Guide

## Directory Structure

After downloading the extension, ensure your files are organized as follows:

```
focuzd-pomodoro/
├── manifest.json
├── popup.html
├── popup.js
├── styles.css
├── background.js
├── images/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Installation Steps (Developer Mode)

1. **Prepare the extension files**:
   - Download or clone all the extension files
   - Make sure to create the `images` directory and convert the SVG icon into PNG files of sizes 16x16, 48x48, and 128x128

2. **Open Chrome Extensions page**:
   - Open Chrome browser
   - Type `chrome://extensions/` in the address bar and press Enter
   - Alternatively, go to Chrome menu (three dots) → More tools → Extensions

3. **Enable Developer Mode**:
   - Look for the "Developer mode" toggle in the top-right corner of the Extensions page
   - Turn it ON

4. **Load the extension**:
   - Click the "Load unpacked" button that appears after enabling Developer mode
   - Browse to and select the folder containing your extension files
   - Click "Select Folder" or "Open"

5. **Verify installation**:
   - If successful, you should see "Focuzd - Pomodoro Timer" appear in your extensions list
   - You should also see the extension icon in Chrome's toolbar (top-right corner of the browser)

6. **Pin for easy access (optional)**:
   - If the extension icon is hidden in the puzzle piece menu, click the puzzle piece
   - Find "Focuzd - Pomodoro Timer" and click the pin icon to keep it visible in your toolbar

## Converting SVG to PNG Icons

To create the required PNG icons from the SVG:

1. **Online Conversion**:
   - Use a free online converter like [SVG to PNG converter](https://svgtopng.com/)
   - Upload the SVG file
   - Convert to the required sizes (16x16, 48x48, and 128x128)
   - Download each size

2. **Using Image Editing Software**:
   - Open the SVG in software like GIMP, Photoshop, or Inkscape
   - Resize to the required dimensions
   - Export as PNG with each size

3. **Place icons in the images folder**:
   - Create an `images` folder if it doesn't exist
   - Save the PNG files as `icon16.png`, `icon48.png`, and `icon128.png` in this folder

## Troubleshooting

If you encounter issues during installation:

1. **Extension doesn't appear**:
   - Check for any error messages on the Extensions page
   - Verify that all files are in the correct location with proper names
   - Make sure manifest.json is properly formatted

2. **Icons don't display**:
   - Ensure image paths in manifest.json match your actual folder structure
   - Check that icon files are in the correct format and size

3. **Extension loads but doesn't work**:
   - Open Chrome DevTools while the extension popup is open (right-click → Inspect)
   - Check the Console tab for any JavaScript errors

4. **Permissions issues**:
   - Make sure you've granted the extension all necessary permissions when prompted

## Updating the Extension

To update the extension after making changes:

1. Edit your files as needed
2. Return to the chrome://extensions page
3. Find "Focuzd - Pomodoro Timer" in the list
4. Click the refresh icon (circular arrow)

## Using Keyboard Shortcuts

The default keyboard shortcut to open Focuzd is:
- **Windows/Linux**: Ctrl+Shift+F
- **Mac**: Command+Shift+F

To customize the keyboard shortcut:
1. Go to chrome://extensions/shortcuts
2. Find "Focuzd - Pomodoro Timer"
3. Click the pencil icon next to the shortcut
4. Press your desired key combination
5. Click OK
