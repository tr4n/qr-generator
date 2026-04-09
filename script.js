document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('data-input');
    const qrContainer = document.getElementById('qr-preview-container');
    const downloadPngBtn = document.getElementById('download-png');

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

    // Default configuration for QR Code Styling
    const defaultOptions = {
        type: "svg",
        width: parseInt(qrSizeInput.value) || 300,
        height: parseInt(qrSizeInput.value) || 300,
        data: dataInput.value || "https://example.com",
        margin: 0,
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
            type: "rounded"
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
        let size = parseInt(qrSizeInput.value) || 300;
        
        // Validation for reasonable sizes
        if (size < 100) size = 100;
        if (size > 3000) size = 3000;

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
        const marginPx = hasFrame ? Math.floor(size * 0.08) : 0; 
        
        const newOptions = {
            type: "svg",
            data: text,
            width: size,
            height: size,
            margin: marginPx,
            image: currentLogoImage,
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
        updateQRCode(); // Re-render
    });

    // Listeners for all inputs
    dataInput.addEventListener('input', updateQRCode);
    qrSizeInput.addEventListener('input', updateQRCode);
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

    logoSizeInput.addEventListener('input', (e) => {
        logoSizeValue.textContent = Math.round(e.target.value * 100) + '%';
        updateQRCode();
    });

    addFrameCheckbox.addEventListener('change', updateQRCode);
    hideBgDotsCheckbox.addEventListener('change', updateQRCode);

    downloadPngBtn.addEventListener('click', () => {
        qrCode.download({ name: "qr-code", extension: "png" });
    });
});
