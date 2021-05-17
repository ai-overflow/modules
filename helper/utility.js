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
