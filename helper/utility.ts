export function zip(rows: Array<any>) {
    return rows[0].map(
        (_: any, c: any) => rows.map(row => row[c])
    );
}

export function toBase64(file: Blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


export function readSize(file: string) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = error => reject(error);
        img.src = file;
    });
}

export function scaleToSize(currentDimensions: { width: number; height: number; }, expectedSize: number) {
    const scaleFactor = expectedSize / Math.max(currentDimensions.width, currentDimensions.height)

    return {
        width: currentDimensions.width * scaleFactor,
        height: currentDimensions.height * scaleFactor,
        scaleFactor: scaleFactor
    };
}

export function cutStringLength(part: string, maxLength = 200) {
    if (part.length > maxLength)
        return part.substr(0, maxLength) + "...";
    return part;
}