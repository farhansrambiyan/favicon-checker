# Favicon Validator Extension
=====================================

A Chrome extension designed to validate and analyze favicons on web pages. It checks for relevance based on size and format, and also verifies if the favicon is blocked by `robots.txt`. The extension provides a clear and user-friendly interface to view favicon details, making it a useful tool for web developers and SEO specialists.

## Features
------------

- **Favicon Validation:** Checks if favicons meet Google's guidelines for size and format.
- **Robots.txt Check:** Verifies if favicons are blocked by `robots.txt`.
- **User-Friendly Interface:** Displays favicon details in a clean and easy-to-understand format.
- **Font Awesome Icons:** Uses Font Awesome for a visually appealing UI.

## How It Works
----------------

1. **Favicon Extraction:** The extension extracts all favicon URLs from the current webpage.
2. **Validation Checks:** It checks each favicon for size (minimum 48x48 pixels) and format (supported formats include ico, png, jpg, jpeg, gif, webp).
3. **Robots.txt Analysis:** The extension fetches and parses the website's `robots.txt` file to determine if any favicons are blocked.
4. **UI Display:** The results are displayed in a popup with toggleable details for each favicon.

## Installation
--------------

1. Clone this repository or download the extension files.
2. Go to `chrome://extensions/` in your Chrome browser.
3. Enable *Developer Mode*.
4. Click *Load unpacked* and select the folder containing the extension files.
5. The extension will now be available in your Chrome toolbar.

## Usage
-----

1. Open any webpage.
2. Click the extension icon in the Chrome toolbar.
3. The popup will display a list of all favicons found on the page, along with their validation status.

## Contributing
--------------

Contributions are welcome! If you have any ideas or improvements, feel free to open an issue or submit a pull request.


