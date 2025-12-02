document.addEventListener('DOMContentLoaded', () => {
    const idDisplay = document.getElementById('idDisplay');
    const copyBtn = document.getElementById('copyBtn');
    const status = document.getElementById('status');

    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];

        if (!currentTab || !currentTab.url) {
            showError("Cannot access tab URL.");
            return;
        }

        const url = currentTab.url;
        const extractedId = extractItemId(url);

        if (extractedId) {
            idDisplay.value = extractedId;
            // Auto-copy for speed
            copyToClipboard(extractedId);
        } else {
            idDisplay.value = "";
            copyBtn.disabled = true;
            showError("No 'itemId' found in URL.");
        }
    });

    copyBtn.addEventListener('click', () => {
        const id = idDisplay.value;
        if (id) {
            copyToClipboard(id);
        }
    });

    function extractItemId(urlString) {
        try {
            // Bitwarden uses hash routing (e.g., #/vault?itemId=...)
            // We look for itemId in the whole string to be safe,
            // handling both standard query params (?) and hash strings (#)

            // Regex to find itemId=... until the next ampersand or end of string
            // Matches UUIDs or standard ID strings
            const regex = /[?&]itemId=([^&]+)/;
            const match = urlString.match(regex);

            if (match && match[1]) {
                return match[1];
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            status.textContent = "Copied!";
            status.classList.remove("error");
            setTimeout(() => {
                status.textContent = "";
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            status.textContent = "Copy failed. Permissions?";
            status.classList.add("error");
        });
    }

    function showError(msg) {
        status.textContent = msg;
        status.classList.add("error");
    }
});
