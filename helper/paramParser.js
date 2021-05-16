export function parseParams(str, input, connection = undefined) {
    // special case for vars:
    if (str.startsWith("{{input.") && str.endsWith("}}")) {
        const result = str.replace(/{{input.(.*?)}}/, "$1");
        return input[result];
    } else if (str.startsWith("{{cmd.") && str.endsWith("}}")) {
        if (str.startsWith("{{cmd.json")) {
            let result = str.replace(/{{cmd.json\((.*?)\)}}/, "$1");
            result = result.split("/");

            const matchArray = /(.*?)\[(.*?)\]/;
            let currentSelected = connection.value;
            for (let val of result) {
                if (!currentSelected)
                    return [];

                let arrayTest = val.match(matchArray);
                if (arrayTest) {
                    let splicedVal = arrayTest[1];
                    let index = arrayTest[2];

                    currentSelected = currentSelected[splicedVal];
                    if (index !== "") {
                        currentSelected = currentSelected[index];
                    }
                } else {
                    if (val.toLowerCase() === "root") continue;
                    if (Array.isArray(currentSelected)) {
                        currentSelected = currentSelected.map(e => e[val]);
                    } else {
                        currentSelected = currentSelected[val];
                    }
                }
            }
            // TODO: path split
            return currentSelected;
        }
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