document.addEventListener('DOMContentLoaded', function() {
    const list = document.getElementById('extension-list');
    let keyBindings = {}; 

    chrome.management.getAll(function(extensions) {
        extensions.sort((a, b) => a.name.localeCompare(b.name));
        extensions = extensions.filter(ext => ext.type === 'extension' && ext.id !== chrome.runtime.id);

        let keyCharCode = 97; 
        let maxRows = 5;
        let columnCount = Math.ceil(extensions.length / maxRows);

        // Adjust the grid columns based on the number of extensions
        list.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;

        // Adjust the popup width based on the number of columns
        document.body.style.width = `${columnCount * 200}px`; 

        extensions.forEach((extension, index) => {
            const item = document.createElement('li');
            const keyLabel = document.createElement('span');
            const extensionContainer = document.createElement('div'); 
            const img = document.createElement('img'); 
            const extensionNameSpan = document.createElement('span'); 
            const toggleButton = document.createElement('button');

            const key = keyCharCode <= 122 ? String.fromCharCode(keyCharCode) : String.fromCharCode(keyCharCode - 26).toUpperCase();
            keyLabel.textContent = `Key: ${key}`;
            keyLabel.className = 'key-label';
            item.appendChild(keyLabel);

            // Set up the image element
            img.className = 'extension-icon';
            const iconUrl = extension.icons && extension.icons.length > 0 ? extension.icons[0].url : 'default-icon.png';
            img.src = iconUrl;

            extensionNameSpan.textContent = extension.name;
            extensionContainer.className = 'extension-container';
            extensionContainer.appendChild(img);
            extensionContainer.appendChild(extensionNameSpan);
            item.appendChild(extensionContainer);

            updateButtonLabel(extension, toggleButton);

            toggleButton.onclick = function() {
                chrome.management.get(extension.id, currentExt => {
                    chrome.management.setEnabled(currentExt.id, !currentExt.enabled, () => {
                        chrome.management.get(currentExt.id, updatedExt => {
                            updateButtonLabel(updatedExt, toggleButton);
                        });
                    });
                });
            };

            item.appendChild(toggleButton);

            // Calculate the correct row and column position
            const row = index % maxRows;
            const column = Math.floor(index / maxRows);
            item.style.gridRowStart = row + 1;
            item.style.gridColumnStart = column + 1;

            list.appendChild(item);

            // Store the function in keyBindings with the key
            keyBindings[key.toLowerCase()] = toggleButton.onclick;
            keyCharCode = keyCharCode < 122 ? keyCharCode + 1 : (keyCharCode - 26 + 1);
        });

        document.addEventListener('keydown', function(event) {
            const key = event.key.toLowerCase();
            if (key in keyBindings) {
                keyBindings[key]();
                event.preventDefault();
            }
        });
    });

    function updateButtonLabel(extension, button) {
        button.textContent = extension.enabled ? 'Disable' : 'Enable';
        button.className = extension.enabled ? 'disable-button' : 'enable-button';
    }
});
