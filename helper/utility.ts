export function zip(rows: Array<any>) {
    if (rows.length === 0) return [];
    return rows[0].map(
        (_: any, c: any) => rows.map(row => row[c])
    );
}

export function toBase64(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
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

export function defaultParamGenerator(input: any) {
    const output: Record<string, any> = {};
    for (const [key, value] of Object.entries<any>(input.input)) {
        switch (value.type.toLowerCase()) {
            case "select":
            case "checkbox":
            case "radio":
            case "multiselect":
                output[key] = value.values[0];
                break;
            case "input":
            case "textarea":
                output[key] = "";
                break;
            case "slider":
                output[key] = value.values.min;
        }
    }
    return output;
}

export async function resizeFile(file: File, maxSize: number, outputType: string = "image/jpeg") {
    let base64Data = await toBase64(file);

    var img = new Image();
    img.src = base64Data;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    const newSize = scaleToSize({width: img.width, height: img.height}, maxSize);
    canvas.width = newSize.width;
    canvas.height = newSize.height;
    ctx.drawImage(img, 0, 0, newSize.width, newSize.height);
    base64Data = canvas.toDataURL(outputType);

    return base64Data;
}