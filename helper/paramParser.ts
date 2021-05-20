interface Connection {
    success: boolean
}

interface ConnectionList {
    connections: Array<Connection>
}

function parseCMD(str: String, connection: ConnectionList = undefined) {
    let result = str.replace(/{{cmd.json\((.*?)\)}}/, "$1");
    let results = result.split("/");


    // if {{cmd.json(input.something/abc/def)}}
    let currentSelected;

    if (results[0].startsWith("connection")) {
        if (Object.keys(connection).length < 1) return str;

        let connName = results[0].split(".")[1];
        if (connection[connName]) {
            if (!connection[connName].success) {
                return "FAILED REQUEST";
            }
            currentSelected = connection[connName].value;
        } else {
            console.log("TODO: request", connName);
            return "TODO: REQUEST " + connName;
        }
    }

    if (results[0].startsWith("input")) {
        currentSelected = results[0].split(".")[1];
    }

    const matchArray = /(.*?)\[(.*?)\]/;
    for (let val of results) {
        if (!currentSelected)
            return str;

        let arrayTest = val.match(matchArray);
        if (arrayTest) {
            let splicedVal = arrayTest[1];
            let index = arrayTest[2];

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

export function parseParams(str, input, connection = undefined) {
    if (!str) return "";

    // special case for vars:
    if (str.startsWith("{{input.") && str.endsWith("}}")) {
        const result = str.replace(/{{input.(.*?)}}/, "$1");
        return input[result];
    } else if (str.startsWith("{{cmd.") && str.endsWith("}}") && connection) {
        if (str.startsWith("{{cmd.json")) {
            parseCMD(str, connection);
        }
        let re = /{{(.*?)}}/g;
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
}

export function parseOrigin(str, vars) {
    if (!str) return str;
    let val = str.split(".");
    val = val[1];
    return vars[val];
}