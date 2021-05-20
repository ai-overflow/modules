interface Connection {
    success: boolean
    value: any
}

function parseCMD(str: string, connection: Map<string, Connection>) {
    const result = str.replace(/{{cmd.json\((.*?)\)}}/, "$1");
    const results = result.split("/");


    // if {{cmd.json(input.something/abc/def)}}
    let currentSelected;

    if (results[0].startsWith("connection")) {
        if (connection.size < 1) return str;

        const connName = results[0].split(".")[1];
        if (connection.get(connName)) {
            if (!connection.get(connName)?.success) {
                return "FAILED REQUEST";
            }
            currentSelected = connection.get(connName)?.value;
        } else {
            console.log("TODO: request", connName);
            return "TODO: REQUEST " + connName;
        }
    }

    if (results[0].startsWith("input")) {
        currentSelected = results[0].split(".")[1];
    }

    const matchArray = /(.*?)\[(.*?)\]/;
    for (const val of results) {
        if (!currentSelected)
            return str;

        const arrayTest = val.match(matchArray);
        if (arrayTest) {
            const splicedVal = arrayTest[1];
            const index = arrayTest[2];

            currentSelected = currentSelected[splicedVal];
            if (index !== "") {
                currentSelected = currentSelected[index];
            }
        } else {
            if (val.toLowerCase() === results[0]) continue;
            if (Array.isArray(currentSelected)) {
                currentSelected = currentSelected.map(e => e[val]);
            } else {
                currentSelected = currentSelected[val];
            }
        }
    }
    // TODO: path split
    return currentSelected || str;
}

export function parseParams(str: string, input, connection?: Map<string, Connection>): any {
    if (!str) return "";

    // special case for vars:
    if (str.startsWith("{{input.") && str.endsWith("}}")) {
        const result = str.replace(/{{input.(.*?)}}/, "$1");
        return input[result];
    } else if (str.startsWith("{{cmd.") && str.endsWith("}}") && connection) {
        if (str.startsWith("{{cmd.json")) {
            return parseCMD(str, connection);
        }
    }
    const re = /{{(.*?)}}/g;
    return str.replaceAll(re, (a, b) => {
        b = b.replace("input.", "");
        if (a && b && input[b]) {
            return input[b];
        } else if (!input[b]) {
            return '';
        } else {
            return a;
        }
    });
}

export function parseOrigin(str, vars) {
    if (!str) return str;
    let val = str.split(".");
    val = val[1];
    return vars[val];
}