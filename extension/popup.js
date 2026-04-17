document.addEventListener('DOMContentLoaded', () => {
    const qrContainer = document.getElementById('qr-container');
    const urlInput = document.getElementById('urlInput');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const closeBtn = document.getElementById('closeBtn');
    const infoBtn = document.getElementById('infoBtn');

    let currentUrl = 'https://google.com';
    let qrCode = null;
    let currentOptions = null;

    const generateQR = (text) => {
        if (qrCode) {
            qrContainer.innerHTML = '';
        }

        currentOptions = {
            width: 250, // UI container exact size to avoid CSS warp
            height: 250,
            type: "canvas", // UI uses canvas purely for live preview snippet
            data: text,
            margin: 0,
            image: chrome.runtime.getURL("ic_dabeeo.svg"),
            qrOptions: {
                typeNumber: 0,
                mode: "Byte",
                errorCorrectionLevel: "Q"
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
                imageSize: 0.4,
                margin: 5
            }
        };

        qrCode = new QRCodeStyling(currentOptions);
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

    const getBase64ImageFromUrl = async (imageUrl) => {
        try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error("Fetch base64 logo failed:", e);
            return imageUrl;
        }
    };

    const exportSvgToPng = async (exportOpts, size) => {
        // Enforce safe margin to prevent path bleed / offset overflow
        exportOpts.margin = 16;
        exportOpts.width = size;
        exportOpts.height = size;
        exportOpts.type = "svg";

        const tempQr = new QRCodeStyling(exportOpts);
        const svgBlob = await tempQr.getRawData("svg");
        if (!svgBlob) throw new Error("SVG generation failed");

        // Force explicit viewbox size onto the SVG string to avoid raster distortion
        let svgText = await svgBlob.text();
        if (!svgText.includes('viewBox')) {
            svgText = svgText.replace('<svg ', `<svg viewBox="0 0 ${size} ${size}" `);
        }
        const preciseBlob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(preciseBlob);
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.width = size;
        img.height = size;
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });
        
        const canvas = document.createElement("canvas");
        // Multiply canvas resolution by 2 to prevent any blurriness before scaling down for export
        const exportScale = 2;
        canvas.width = size * exportScale;
        canvas.height = size * exportScale;
        
        const ctx = canvas.getContext("2d");
        ctx.scale(exportScale, exportScale);
        ctx.fillStyle = exportOpts.backgroundOptions?.color || "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);
        
        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
        });
    };

    copyBtn.addEventListener('click', async () => {
        try {
            const exportOptions = { ...currentOptions };
            exportOptions.imageOptions = { ...currentOptions.imageOptions, margin: 4 }; // adjusted margin ratio
            
            // Pre-process image to base64 so SVG mapping does not block logo drawing
            if (exportOptions.image && !exportOptions.image.startsWith('data:')) {
                exportOptions.image = await getBase64ImageFromUrl(exportOptions.image);
            }
            
            const pngBlob = await exportSvgToPng(exportOptions, 400);
            if (!pngBlob) throw new Error("PNG conversion failed");

            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": pngBlob })
            ]);
            
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "Copied!";
            setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
        } catch (e) {
            console.error("Copy SVG->PNG failed:", e);
            alert("Could not process copy. Try restarting the extension.");
        }
    });

    downloadBtn.addEventListener('click', async () => {
        try {
            const exportOptions = { ...currentOptions };
            exportOptions.imageOptions = { ...currentOptions.imageOptions, margin: 4 };

            if (exportOptions.image && !exportOptions.image.startsWith('data:')) {
                exportOptions.image = await getBase64ImageFromUrl(exportOptions.image);
            }

            const pngBlob = await exportSvgToPng(exportOptions, 400);
            if (!pngBlob) throw new Error("PNG conversion failed");

            const url = URL.createObjectURL(pngBlob);
            const a = document.createElement("a");
            a.download = "qr-code.png";
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (e) {
            console.error("Download SVG->PNG failed:", e);
            alert("Could not process download. Try restarting the extension.");
        }
    });
});
