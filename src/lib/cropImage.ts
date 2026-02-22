export const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    fileName: string = 'cropped-image.jpg'
): Promise<File> => {
    const image = new window.Image();
    // Only set crossOrigin for remote URLs. Blob URLs don't need it and can fail with it.
    if (imageSrc.startsWith('http')) {
        image.setAttribute('crossOrigin', 'anonymous');
    }
    image.src = imageSrc;

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            resolve(file);
        }, 'image/jpeg');
    });
};

