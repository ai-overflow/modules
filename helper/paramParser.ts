interface Connection {
    success: boolean
    value: any
}

class ParamParser {
    private paramCache = new Map<string, any>();
    private _input?: Record<string, any>;
    private _connection?: Record<string, Connection>

    public set input(input: Record<string, any>) {
        this._input = input;
    }

    public set connection(input: Record<string, Connection>) {
        this._connection = input;
    }

    /**
     * TODO: Make this more generic (allow base string change...)
     * @param str iterator string (e.g. /etc/abc[]/def)
     * @returns Flat array from iterator string
     */
    public parseIterator(str: string) {
        if (!this._connection) return str;
        const results = str.split("/");
        const matchArray = /(.*?)\[(.*?)\]/;
        const matchNestedArray = /\[(.*?)\]/g;


        // if {{cmd.json(input.something/abc/def)}}
        let currentSelected;

        if (results[0].startsWith("connection")) {
            if (Object.keys(this._connection).length < 1) return str;

            let connName = results[0].split(".")[1];

            const arrayTest = connName.match(matchArray);
            if (arrayTest) {
                connName = arrayTest[1];
            }

            if (this._connection[connName]) {
                if (!this._connection[connName]?.success) {
                    return "FAILED REQUEST";
                }
                currentSelected = this._connection[connName]?.value;

                if (typeof currentSelected === "string") {
                    currentSelected = JSON.parse(currentSelected);
                }
            } else {
                console.log("TODO: request", connName);
                return "TODO: REQUEST " + connName;
            }
        }

        if (results[0].startsWith("input")) {
            currentSelected = results[0].split(".")[1];
        }

        for (const val of results) {
            if (currentSelected === undefined)
                return "Out of Bounds: " + str;

            const arrayTest = val.match(matchArray);
            if (arrayTest) {
                const splicedVal = arrayTest[1];
                const indexArray = [...val.matchAll(matchNestedArray)];

                if (currentSelected[splicedVal] !== undefined) {
                    currentSelected = currentSelected[splicedVal];
                }
                for (const el of indexArray) {
                    if (el[1] !== undefined && el[1].trim().length > 0 && currentSelected) {
                        currentSelected = currentSelected[el[1]];
                    } else {
                        break;
                    }
                }
            } else {
                if (val.toLowerCase() === results[0]) continue;
                if (Array.isArray(currentSelected)) {
                    currentSelected = currentSelected.map(e => e[val]);
                    if (currentSelected.every((e) => e === undefined)) currentSelected = undefined;
                } else {
                    currentSelected = currentSelected[val];
                }
            }
        }
        // TODO: path split
        return currentSelected === undefined ? "Index error at: " + str : currentSelected;
    }

    private parseCMD(str: string) {
        if (!this._connection) return str;
        const result = str.replace(/{{cmd.json\((.*?)\)}}/, "$1");
        return this.parseIterator(result);
    }

    private parseConnectionData(str: string) {
        if (!this._connection) return;

        let currentSelected;
        const connName = str.replace(/{{connection.(.*?)}}/, "$1");

        if (connName.trim().length === 0) return str;
        if (this._connection[connName]) {
            if (!this._connection[connName]?.success) {
                return "FAILED REQUEST";
            }
            currentSelected = this._connection[connName]?.value;
        }

        return currentSelected;
    }

    /**
     * Parses an Variable String
     * @param str Variable String (e.g. {{cmd.json(abc/def[]/ghi)}})
     * @returns Variable Output
     */
    public parseParams(str: string): any {
        if (!str) return "";

        // special case for vars:
        if (str.startsWith("{{input.") && str.endsWith("}}") && this._input) {
            const result = str.replace(/{{input.(.*?)}}/, "$1");
            if (result && this._input[result] !== undefined) {
                return this._input[result];
            }
            return str;
        } else if (str.startsWith("{{cmd.") && str.endsWith("}}") && this._connection) {
            if (str.startsWith("{{cmd.json")) {
                return this.parseCMD(str);
            }
        } else if (str.startsWith("{{connection.") && str.endsWith("}}") && this._connection) {
            return this.parseConnectionData(str);
        }

        const re = /{{(.*?)}}/g;
        return str.replace(re, (a, b) => {
            if (b.startsWith("input.")) {
                b = b.replace("input.", "");
                if (a && b && this._input && this._input[b] !== undefined) {
                    return this._input[b];
                }
            } else if (b.startsWith("connection.")) {
                b = b.replace("connection.", "");
                if (a && b &&
                    this._connection &&
                    this._connection[b] !== undefined &&
                    this._connection[b].success) {
                    return this._connection[b].value;
                }
            } else if(b.startsWith("user.")) {
                b = b.replace("user.", "");
                switch(b.toLowerCase()) {
                    case 'agent':
                        return navigator.userAgent;
                    case 'language':
                        return navigator.language;
                    default:
                        return 'unknown user property: ' + b;
                }
            }
            return a;
        });
    }
}

export const paramParser = new ParamParser();

export function parseOrigin(str: string, input_vars: Record<string, any>, output_vars: Record<string, any>) {
    if (!str) return str;
    const val = str.split(".");
    if (val[0].toLowerCase() === "input")
        return input_vars[val[1]];
    else if (val[0].toLowerCase() === "output")
        return output_vars[val[1]];
    else
        return str;
}