document.addEventListener('DOMContentLoaded', () => {
    const qrContainer = document.getElementById('qr-container');
    const urlInput = document.getElementById('urlInput');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const closeBtn = document.getElementById('closeBtn');
    const infoBtn = document.getElementById('infoBtn');

    let currentUrl = 'https://google.com';
    let qrCode = null;

    const generateQR = (text) => {
        if (qrCode) {
            qrContainer.innerHTML = '';
        }

        const options = {
            width: 250,
            height: 250,
            type: "svg",
            data: text,
            margin: 0,
            image: chrome.runtime.getURL("logo.png"),
            qrOptions: {
                typeNumber: 0,
                mode: "Byte",
                errorCorrectionLevel: "L"
            },
            dotsOptions: {
                color: "#111827",
                type: "dots"
            },
            backgroundOptions: {
                color: "#ffffff",
            },
            cornersSquareOptions: {
                color: "#111827",
                type: "extra-rounded"
            },
            cornersDotOptions: {
                color: "#111827",
                type: "dot"
            },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.8,
                margin: 2
            }
        };

        qrCode = new QRCodeStyling(options);
        qrCode.append(qrContainer);
    };

    // Grab the current active tab's URL using Chrome Extension API
    if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs && tabs[0]) {
                currentUrl = tabs[0].url;
                urlInput.value = currentUrl;
                generateQR(currentUrl);
            }
        });
    } else {
        // Fallback if opened outside extension
        urlInput.value = currentUrl;
        generateQR(currentUrl);
    }

    // Handlers
    infoBtn.addEventListener('click', () => {
        const targetLink = "https://tr4n.github.io/qr-generator/?url=" + encodeURIComponent(currentUrl);
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: targetLink });
        } else {
            window.open(targetLink, '_blank');
        }
    });

    closeBtn.addEventListener('click', () => {
        window.close();
    });

    copyBtn.addEventListener('click', async () => {
        try {
            const blob = await qrCode.getRawData("png");
            if (!blob) throw new Error("Could not extract PNG data");
            
            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
            ]);
            
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "Copied!";
            setTimeout(() => {
                copyBtn.innerText = originalText;
            }, 2000);
        } catch (e) {
            console.error("Copy failed:", e);
        }
    });

    downloadBtn.addEventListener('click', () => {
        qrCode.download({ name: "qr-code", extension: "png" });
    });
});
