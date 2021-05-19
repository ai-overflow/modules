export function zip(rows) {
    return rows[0].map(
        (_, c) => rows.map(row => row[c])
    );
}

export function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


export function readSize(file) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = error => reject(error);
        img.src = file;
    });
}

export function scaleToSize(currentDimensions, expectedSize) {
    let scaleFactor;
    if (currentDimensions.width > currentDimensions.height) {
        scaleFactor = expectedSize / currentDimensions.width;
    } else {
        scaleFactor = expectedSize / currentDimensions.height;
    }

    return {
        width: currentDimensions.width * scaleFactor,
        height: currentDimensions.height * scaleFactor,
        scaleFactor: scaleFactor
    };
}

export function cutStringLength(part, maxLength = 200) {
    if (part.length > maxLength)
        return part.substr(0, maxLength) + "...";
    return part;
}