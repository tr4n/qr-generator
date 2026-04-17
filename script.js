document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('data-input');
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if the user wants to generate a full-screen QR code instantly
    if (urlParams.has('data')) {
        const dataStr = urlParams.get('data');
        let width = 400, height = 400;
        const sizeParam = urlParams.get('size');
        if (sizeParam) {
            if (sizeParam.includes('x')) {
                const parts = sizeParam.split('x');
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    width = Number(parts[0]);
                    height = Number(parts[1]);
                }
            } else if (!isNaN(sizeParam)) {
                width = height = Number(sizeParam);
            }
        }
        
        let logoImage = undefined;
        if (urlParams.get('logo') === 'dabeeo') {
            logoImage = 'extension/ic_dabeeo.png';
        }
        
        // Hide standard UI and apply fullscreen canvas style
        document.body.innerHTML = '';
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        document.body.style.minHeight = '100vh';
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.margin = '0';
        
        const qrCode = new QRCodeStyling({
            width: width,
            height: height,
            type: "svg",
            data: dataStr,
            margin: 0,
            image: logoImage,
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
                margin: Math.max(1, Math.floor(width * 0.0125))
            }
        });
        
        qrCode.append(document.body);
        return; // Early return to short-circuit regular page load
    }

    // Default input initialization for UI
    const queryData = urlParams.get('text') || urlParams.get('url') || urlParams.get('q');
    if (queryData) {
        dataInput.value = queryData;
    } else if (window.location.search.length > 1 && !window.location.search.includes('=')) {
        dataInput.value = decodeURIComponent(window.location.search.substring(1));
    }

    const charCount = document.getElementById('char-count');
    const qrContainer = document.getElementById('qr-preview-container');
    const downloadPngBtn = document.getElementById('download-png');
    const copyPngBtn = document.getElementById('copy-png');

    // Customization elements
    const qrSizeInput = document.getElementById('qr-size');
    const dotsStyleInput = document.getElementById('dots-style');
    const dotDensityInput = document.getElementById('dot-density');
    const dotsColorInput = document.getElementById('dots-color');
    const dotsColorValue = document.getElementById('dots-color-value');
    const cornerColorInput = document.getElementById('corner-color');
    const cornerColorValue = document.getElementById('corner-color-value');
    const bgColorInput = document.getElementById('bg-color');
    const bgColorValue = document.getElementById('bg-color-value');
    const addFrameCheckbox = document.getElementById('add-frame');
    const hideBgDotsCheckbox = document.getElementById('hide-bg-dots');
    
    // Logo elements
    const logoUpload = document.getElementById('logo-upload');
    const fileNameDisplay = document.getElementById('file-name-display');
    const logoFileName = document.getElementById('logo-file-name');
    const removeLogoBtn = document.getElementById('remove-logo');
    const logoSizeInput = document.getElementById('logo-size');
    const logoSizeValue = document.getElementById('logo-size-value');

    // State
    let currentLogoImage = null;
    let lastGeneratedOptions = null;

    // Default configuration for QR Code Styling
    const defaultOptions = {
        type: "svg", // Use svg for better cross-platform compatibility (e.g. Windows LG Gram scaling issues)
        width: 350,
        height: 350,
        data: dataInput.value || "https://tr4n.github.io/qr-generator/",
        margin: 10,
        qrOptions: {
            typeNumber: 0,
            mode: "Byte",
            errorCorrectionLevel: dotDensityInput ? dotDensityInput.value : "Q"
        },
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: logoSizeInput ? parseFloat(logoSizeInput.value) : 0.45,
            margin: 6,
            crossOrigin: "anonymous",
        },
        dotsOptions: {
            color: dotsColorInput ? dotsColorInput.value : "#0f172a",
            type: dotsStyleInput ? dotsStyleInput.value : "dots"
        },
        backgroundOptions: {
            color: bgColorInput ? bgColorInput.value : "#ffffff",
        },
        cornersSquareOptions: {
            color: cornerColorInput ? cornerColorInput.value : "#0f172a",
            type: "extra-rounded"
        },
        cornersDotOptions: {
            color: cornerColorInput ? cornerColorInput.value : "#0f172a",
            type: "dot"
        }
    };

    // Initialize QR Code Styling instance
    lastGeneratedOptions = defaultOptions;
    let qrCode = new QRCodeStyling(defaultOptions);

    // Initial render
    qrCode.append(qrContainer);

    // Debounce function to optimize performance when generating QR as user types
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Function to update QR code
    const updateQRCode = debounce(() => {
        const text = dataInput.value.trim();
        const size = 350; // Increased fixed size for sharper preview math


        const style = dotsStyleInput.value;
        const density = dotDensityInput.value;
        const dotsColor = dotsColorInput.value;
        const cornerColor = cornerColorInput.value;
        const bgColor = bgColorInput.value;
        const logoSize = logoSizeInput ? parseFloat(logoSizeInput.value) : 0.45;
        const hasFrame = addFrameCheckbox.checked;
        const hideBg = hideBgDotsCheckbox.checked;

        // Prevent generating if empty
        if (!text) return;

        // Determine margin and frame effects
        const marginPx = hasFrame ? Math.floor(size * 0.08) : Math.floor(size * 0.04); 
        
        const newOptions = {
            type: "svg", // Use svg for better cross-platform compatibility (e.g. Windows LG Gram scaling issues)
            data: text,
            width: size,
            height: size,
            margin: marginPx,
            image: currentLogoImage || "",
            qrOptions: {
                errorCorrectionLevel: density
            },
            dotsOptions: {
                color: dotsColor,
                type: style
            },
            backgroundOptions: {
                color: bgColor,
            },
            cornersSquareOptions: {
                color: cornerColor,
                type: "extra-rounded"
            },
            cornersDotOptions: {
                color: cornerColor,
                type: "dot"
            },
            imageOptions: {
                hideBackgroundDots: hideBg,
                imageSize: logoSize,
                margin: 6,
                crossOrigin: "anonymous",
            }
        };

        lastGeneratedOptions = newOptions;
        qrCode.update(newOptions);
    }, 150);

    // Logo Upload Logic
    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Enforce max 2MB limit roughly
        if (file.size > 2 * 1024 * 1024) {
            alert("Please select a logo image smaller than 2MB.");
            logoUpload.value = '';
            return;
        }

        // Reset logo size to default
        if (logoSizeInput) {
            logoSizeInput.value = 0.45;
            if (logoSizeValue) logoSizeValue.textContent = '45%';
        }

        // Display file name
        logoFileName.textContent = file.name;
        fileNameDisplay.classList.remove('hidden');

        // Read file as Data URL
        const reader = new FileReader();
        reader.onload = (event) => {
            currentLogoImage = event.target.result;
            updateQRCode();
        };
        reader.readAsDataURL(file);
    });

    // Remove Logo Logic
    removeLogoBtn.addEventListener('click', () => {
        logoUpload.value = ''; // Reset input
        currentLogoImage = null; // Clear state
        fileNameDisplay.classList.add('hidden'); // Hide UI
        logoFileName.textContent = '';
        
        // Reset logo size to default
        if (logoSizeInput) {
            logoSizeInput.value = 0.45;
            if (logoSizeValue) logoSizeValue.textContent = '45%';
        }

        updateQRCode(); // Re-render
    });

    // Listeners for all inputs
    dataInput.addEventListener('input', () => {
        const length = dataInput.value.length;
        if (charCount) {
            charCount.textContent = `${length}/2000`;
            if (length >= 2000) {
                charCount.classList.add('text-red-500');
                charCount.classList.remove('text-gray-400');
            } else {
                charCount.classList.remove('text-red-500');
                charCount.classList.add('text-gray-400');
            }
        }
        updateQRCode();
    });
    dotsStyleInput.addEventListener('change', updateQRCode);
    dotDensityInput.addEventListener('change', updateQRCode);
    
    dotsColorInput.addEventListener('input', (e) => {
        dotsColorValue.textContent = e.target.value;
        updateQRCode();
    });

    cornerColorInput.addEventListener('input', (e) => {
        cornerColorValue.textContent = e.target.value;
        updateQRCode();
    });
    
    bgColorInput.addEventListener('input', (e) => {
        bgColorValue.textContent = e.target.value;
        updateQRCode();
    });

    // Initialize character counter
    dataInput.dispatchEvent(new Event('input'));

    logoSizeInput.addEventListener('input', (e) => {
        logoSizeValue.textContent = Math.round(e.target.value * 100) + '%';
        updateQRCode();
    });

    addFrameCheckbox.addEventListener('change', updateQRCode);
    hideBgDotsCheckbox.addEventListener('change', updateQRCode);

    downloadPngBtn.addEventListener('click', async () => {
        let downloadSize = parseInt(qrSizeInput.value) || 300;
        if (downloadSize < 50) downloadSize = 50;
        if (downloadSize > 3000) downloadSize = 3000;

        const hasFrame = addFrameCheckbox.checked;
        const targetMargin = hasFrame ? Math.floor(downloadSize * 0.08) : Math.floor(downloadSize * 0.04);
        
        // Use a pristine, standalone canvas instance strictly for high-res export
        // This eliminates fractional pixel smudging from UI updates
        const exportOptions = {
            ...lastGeneratedOptions,
            type: "canvas", 
            width: downloadSize,
            height: downloadSize,
            margin: targetMargin
        };

        const exportQrCode = new QRCodeStyling(exportOptions);

        try {
            await exportQrCode.download({ name: "qr-code", extension: "png" });
        } catch (e) {
            console.error('Download failed:', e);
        }
    });

    copyPngBtn.addEventListener('click', async () => {
        let copySize = parseInt(qrSizeInput.value) || 300;
        if (copySize < 50) copySize = 50;
        if (copySize > 3000) copySize = 3000;

        const hasFrame = addFrameCheckbox.checked;
        const targetMargin = hasFrame ? Math.floor(copySize * 0.08) : Math.floor(copySize * 0.04);
        
        const exportOptions = {
            ...lastGeneratedOptions,
            type: "canvas", 
            width: copySize,
            height: copySize,
            margin: targetMargin
        };

        const copyQrCode = new QRCodeStyling(exportOptions);

        try {
            const blob = await copyQrCode.getRawData("png");
            if (!blob) throw new Error("Could not extract PNG data");
            
            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
            ]);
            
            // Visual feedback
            const originalText = copyPngBtn.innerHTML;
            copyPngBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-green-600">Copied!</span>
            `;
            setTimeout(() => {
                copyPngBtn.innerHTML = originalText;
            }, 2000);
            
        } catch (e) {
            console.error('Copy failed:', e);
            alert("Could not copy image to clipboard. Please check browser permissions.");
        }
    });
});
