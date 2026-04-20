document.addEventListener('DOMContentLoaded', async () => {
    const dataInput = document.getElementById('data-input');
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Default input initialization for UI
    const queryData = urlParams.get('data') || urlParams.get('text') || urlParams.get('url') || urlParams.get('q');
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

    // Handle URL parameters for size and logo
    const sizeParam = urlParams.get('size');
    if (sizeParam) {
        if (sizeParam.includes('x')) {
            const parts = sizeParam.split('x');
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                qrSizeInput.value = Number(parts[0]);
            }
        } else if (!isNaN(sizeParam)) {
            qrSizeInput.value = Number(sizeParam);
        }
    }

    const logoParam = urlParams.get('logo');
    if (logoParam === 'dabeeo') {
        currentLogoImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIGZpbGw9Im5vbmUiPgogIDxwYXRoIGQ9Ik0xLjAxNTYyIDMuOTk3MjdWMTEuOTkxOEw3Ljk3NjEyIDE1Ljk4OTFMMTQuOTM2NiAxMS45OTE4VjMuOTk3MjdMNy45NzYxMiAwTDEuMDE1NjIgMy45OTcyN1oiIGZpbGw9IndoaXRlIi8+CiAgPHBhdGggZD0iTTMuMTg3NSAxMC43ODk0VjUuMzA1NDZMNy45NjI3NyAyLjU2MzQ4TDEyLjczOCA1LjMwNTQ2VjEwLjc4OTRMNy45NjI3NyAxMy41MzE0TDMuMTg3NSAxMC43ODk0WiIgZmlsbD0iIzRCNkNDQiIvPgogIDxwYXRoIGQ9Ik03Ljk2Mjc3IDEzLjUzMTNMMTIuNzM4IDEwLjc4OTNMNy45NjI3NyA4LjQwODA4TDMuMTg3NSAxMC43ODkzTDcuOTYyNzcgMTMuNTMxM1oiIGZpbGw9IiMxOTNGOEUiLz4KICA8cGF0aCBkPSJNMSAzLjk5NzI3TDMuMTg1MjIgNS4yNTI1Nkw3Ljk2MDUgMi41MTA2TDEyLjczNTggNS4yNTI1NkwxNC45MjEgMy45OTcyN0w3Ljk2MDUgMEwxIDMuOTk3MjdaIiBmaWxsPSIjRENFN0Y0Ii8+CiAgPHBhdGggZD0iTTcuOTc2NTYgMTMuNDg5NFYxNkwxNC45MzcgMTIuMDAyN1Y0LjAwODE4TDEyLjc1MTggNS4yNjM0N1YxMC43NDc0TDcuOTc2NTYgMTMuNDg5NFoiIGZpbGw9IiNDNUNDRDYiLz4KICA8cGF0aCBkPSJNMTIuNzM2MiAxMC43ODk0TDcuOTYwOTQgOC40MDgxNlYyLjU2MzQ4TDEyLjczNjIgNS4zMDU0NlYxMC43ODk0WiIgZmlsbD0iIzFFNTdEQyIvPgogIDxwYXRoIGQ9Ik0xMC4zOTExIDguNzQzM0MxMC4zOTExIDkuMzQwODkgOS45MDIwNyA5LjgyNzM1IDkuMzAxMjggOS44MjczNUM4LjcwMDQ3IDkuODI3MzUgOC4yMTE0IDkuMzQwODkgOC4yMTE0IDguNzQzM0M4LjIxMTQgOC4xNDU3MyA4LjcwMDQ3IDcuNjU5MjcgOS4zMDEyOCA3LjY1OTI3VjcuMDc2MjdDOS4yNjQ2MyA3LjA3NjI3IDkuMjI5ODQgNy4wNzk5IDkuMTk1MDMgNy4wODE3M0M5LjAxMDAyIDcuMDc5OSA4Ljg1OTg0IDYuOTMwNTIgOC44NTk4NCA2Ljc0NjVDOC44NTk4NCA2LjU2MjQ5IDkuMDEwMDIgNi40MTMxIDkuMTk1MDMgNi40MTMxQzkuMzgwMDQgNi40MTMxIDkuNTMwMjMgNi41NjI0OSA5LjUzMDIzIDYuNzQ2NUgxMC4xMTY0QzEwLjExNjQgNi4yNDAwMiA5LjcwMjQyIDUuODMwMDggOS4xOTUwMyA1LjgzMDA4QzguNjg3NjUgNS44MzAwOCA4LjI3MzY5IDYuMjQxODMgOC4yNzM2OSA2Ljc0NjVDOC4yNzM2OSA2Ljk1NjAxIDguMzQ1MTEgNy4xNDczMiA4LjQ2NDE4IDcuMzAyMTlDNy45NjQxMiA3LjU5MDA1IDcuNjI1MjcgOC4xMjkzNCA3LjYyNTI3IDguNzQ1MTNDNy42MjUyNyA5LjM2MDk0IDcuMTM2MiA5LjgyOTE4IDYuNTM1MzkgOS44MjkxOEM1LjkzNDU5IDkuODI5MTggNS40NDU1MiA5LjM0MjcyIDUuNDQ1NTIgOC43NDUxM0M1LjQ0NTUyIDguMTQ3NTYgNS45MzQ1OSA3LjY2MTEgNi41MzUzOSA3LjY2MTFWNy4wNzgwOUM2LjQ5ODc1IDcuMDc4MDkgNi40NjM5NSA3LjA4MTczIDYuNDI5MTYgNy4wODM1NkM2LjI0NDE1IDcuMDgxNzMgNi4wOTM5NCA2LjkzMjM1IDYuMDkzOTQgNi43NDgzM0M2LjA5Mzk0IDYuNTY0MzEgNi4yNDQxNSA2LjQxNDkxIDYuNDI5MTYgNi40MTQ5MUM2LjYxNDE1IDYuNDE0OTEgNi43NjQzNSA2LjU2NDMxIDYuNzY0MzUgNi43NDgzM0g3LjM1MDVDNy4zNTA1IDYuMjQxODQgNi45MzY1NCA1LjgzMTkxIDYuNDI5MTYgNS44MzE5MUM1LjkyMTc3IDUuODMxOTEgNS41MDc4IDYuMjQzNjUgNS41MDc4IDYuNzQ4MzNDNS41MDc4IDYuOTU3ODQgNS41NzkyNCA3LjE0OTE1IDUuNjk4MyA3LjMwNEM1LjE5ODI0IDcuNTkxODcgNC44NTkzOCA4LjEzMTE1IDQuODU5MzggOC43NDY5NkM0Ljg1OTM4IDkuNjY3MDIgNS42MTIyMiAxMC40MTQgNi41MzUzOSAxMC40MTRDNy4xMDg3MSAxMC40MTQgNy42MTYxIDEwLjEyNjEgNy45MTgzMyA5LjY4NzA3QzguMjIwNTcgMTAuMTI2MSA4LjcyNzk1IDEwLjQxNCA5LjMwMTI4IDEwLjQxNEMxMC4yMjYzIDEwLjQxNCAxMC45NzczIDkuNjY1MTkgMTAuOTc3MyA4Ljc0Njk2SDEwLjM5MTFWOC43NDMzWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==';
        logoFileName.textContent = 'dabeeo.svg';
        fileNameDisplay.classList.remove('hidden');
    } else if (logoParam) {
        const isValidImage = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = logoParam;
        });
        if (isValidImage) {
            currentLogoImage = logoParam;
            logoFileName.textContent = 'Custom Logo';
            fileNameDisplay.classList.remove('hidden');
        } else {
            console.warn("Provided logo image is invalid or inaccessible, ignoring logo.");
        }
    }

    // Default configuration for QR Code Styling
    const defaultOptions = {
        type: "svg", // Use svg for better cross-platform compatibility (e.g. Windows LG Gram scaling issues)
        width: 350,
        height: 350,
        data: dataInput.value || "https://tr4n.github.io/qr-generator/",
        margin: 10,
        image: currentLogoImage || "",
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

    downloadPngBtn.addEventListener('click', async () => {
        let downloadSize = parseInt(qrSizeInput.value) || 300;
        if (downloadSize < 50) downloadSize = 50;
        if (downloadSize > 3000) downloadSize = 3000;

        const hasFrame = addFrameCheckbox.checked;
        const targetMargin = hasFrame ? Math.floor(downloadSize * 0.08) : Math.floor(downloadSize * 0.04);
        
        // Use SVG type to ensure precise geometry generation and avoid Windows 2D Canvas bugs
        const exportOptions = {
            ...lastGeneratedOptions,
            type: "svg", 
            width: downloadSize,
            height: downloadSize,
            margin: targetMargin
        };

        if (exportOptions.image && !exportOptions.image.startsWith('data:')) {
            exportOptions.image = await getBase64ImageFromUrl(exportOptions.image);
        }

        const exportQrCode = new QRCodeStyling(exportOptions);

        try {
            // Convert SVG to PNG locally
            const svgBlob = await exportQrCode.getRawData("svg");
            if (!svgBlob) throw new Error("SVG generation failed");

            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error("Failed to load SVG into memory"));
                img.src = url;
            });
            
            const canvas = document.createElement("canvas");
            canvas.width = downloadSize;
            canvas.height = downloadSize;
            const ctx = canvas.getContext("2d");
            
            // Fill background color
            ctx.fillStyle = exportOptions.backgroundOptions?.color || "#ffffff";
            ctx.fillRect(0, 0, downloadSize, downloadSize);
            
            // Draw exact SVG vector to canvas directly mapping pixels
            ctx.drawImage(img, 0, 0, downloadSize, downloadSize);
            URL.revokeObjectURL(url);
            
            const pngDataUrl = canvas.toDataURL("image/png");
            
            // Trigger download manually
            const a = document.createElement("a");
            a.download = "qr-code.png";
            a.href = pngDataUrl;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (e) {
            console.error('Client-side SVG->PNG download failed, attempting fallback:', e);
            try {
                // Fallback to internal canvas PNG export
                exportOptions.type = "canvas";
                const fallbackQr = new QRCodeStyling(exportOptions);
                await fallbackQr.download({ name: "qr-code", extension: "png" });
            } catch (fallbackError) {
                console.error("Fallback failed:", fallbackError);
            }
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
            type: "svg", 
            width: copySize,
            height: copySize,
            margin: targetMargin
        };

        if (exportOptions.image && !exportOptions.image.startsWith('data:')) {
            exportOptions.image = await getBase64ImageFromUrl(exportOptions.image);
        }

        const copyQrCode = new QRCodeStyling(exportOptions);
        
        // Ensure Visual Feedback Function
        const showSuccessFeedback = () => {
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
        };

        try {
            const svgBlob = await copyQrCode.getRawData("svg");
            if (!svgBlob) throw new Error("SVG generation failed");

            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error("Failed to load SVG into memory"));
                img.src = url;
            });
            
            const canvas = document.createElement("canvas");
            canvas.width = copySize;
            canvas.height = copySize;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = exportOptions.backgroundOptions?.color || "#ffffff";
            ctx.fillRect(0, 0, copySize, copySize);
            ctx.drawImage(img, 0, 0, copySize, copySize);
            URL.revokeObjectURL(url);
            
            canvas.toBlob(async (blob) => {
                if (!blob) throw new Error("Could not extract PNG data");
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ "image/png": blob })
                    ]);
                    showSuccessFeedback();
                } catch(err) {
                    console.error('Clipboard write failed:', err);
                    alert("Could not copy image to clipboard. Please check browser permissions.");
                }
            }, "image/png");

        } catch (e) {
            console.error('Custom SVG->PNG copy failed, attempting fallback...', e);
            try {
                // Fallback to internal canvas processing
                exportOptions.type = "canvas";
                const fallbackQrCode = new QRCodeStyling(exportOptions);
                const blob = await fallbackQrCode.getRawData("png");
                if (!blob) throw new Error("Could not extract PNG data via fallback");
                
                await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob })
                ]);
                showSuccessFeedback();
            } catch (fallbackError) {
                console.error("Fallback Copy failed:", fallbackError);
                alert("Could not copy image to clipboard. Processing error.");
            }
        }
    });
});
