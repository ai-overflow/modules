import { AxiosResponse } from "axios";
import { generateDataFromResponse } from "./connection";

interface Connection {
    success: boolean
    value: any
}

interface ConnectionRef {
    ref: string
    vars: Record<string, string>
}

class ParamParser {
    private _input?: Record<string, any>;
    private _connection?: Record<string, Connection>
    private _sendRequest?: (connectionName: string) => Promise<AxiosResponse<any>>
    private varsStorage = new Map<string, string>();
    private readonly commandRegex = /{{cmd\.([A-Za-z_]+)\((.*?)\)}}/

    public set input(input: Record<string, any>) {
        this._input = input;
    }

    public set connection(input: Record<string, Connection>) {
        this._connection = input;
    }

    public set sendRequest(fn: (connectionName: string) => Promise<AxiosResponse<any>>) {
        this._sendRequest = fn;
    }

    /**
     * TODO: Make this more generic (allow base string change...)
     * @param str iterator string (e.g. /etc/abc[]/def)
     * @returns Flat array from iterator string
     */
    public parseIterator(str: string, iterable: Record<string, any> | undefined = this._connection) {
        if (!iterable || !this._connection) return str;
        const results = str.split("/");
        const matchArray = /(.*?)\[(.*?)\]/;
        const matchNestedArray = /\[(.*?)\]/g;


        // if {{cmd.json(input.something/abc/def)}}
        let currentSelected;

        if (results[0].startsWith("connection.")) {
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
                return "TODO: REQUEST " + connName;
            }
        } else {
            currentSelected = iterable;
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
        const result = str.replace(/{{cmd\.json\((.*?)\)}}/, "$1");
        return this.parseIterator(result);
    }

    private parseConnectionData(str: string) {
        if (!this._connection) return;

        let currentSelected;
        const connName = str.replace(/{{connection\.(.*?)}}/, "$1");

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
    public parseParams(str: string, iterable?: Record<string, any>): any {
        if (!str) return "";

        // special case for vars:
        if (str.startsWith("{{input.") && str.endsWith("}}") && this._input) {
            const result = str.replace(/{{input.(.*?)}}/, "$1");
            if (result && this._input[result] !== undefined) {
                return this._input[result];
            }
            return str;
        } else if (str.startsWith("{{cmd.") && str.endsWith("}}") && this._connection) {
            const match = str.match(this.commandRegex);
            if (!match) return str;

            const command = match[1];
            const value = match[2];

            switch (command) {
                case 'json':
                    return this.parseIterator(value);
                case 'iterator':
                    return iterable !== undefined ? this.parseIterator(value, iterable) : "Using iterator without having an iterator enabled: " + str;
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
            } else if (b.startsWith("user.")) {
                b = b.replace("user.", "");
                switch (b.toLowerCase()) {
                    case 'agent':
                        return navigator.userAgent;
                    case 'language':
                        return navigator.language;
                    default:
                        return 'unknown user property: ' + b;
                }
            } else if (b.startsWith("vars.")) {
                b = b.replace("vars.", "");
                if (this.varsStorage.get(b) !== undefined) {
                    return this.varsStorage.get(b)
                }
                return "Missing Variable: " + b;
            }
            return a;
        });
    }

    public async asyncParseParams(connection: ConnectionRef, doRequest: boolean = true) {
        for (const [k, v] of Object.entries(connection.vars)) {
            this.varsStorage.set(k, this.parseParams(v));
        }


        if (this._sendRequest && doRequest) {
            return this._sendRequest(connection.ref).then(e => {
                if (!this._connection) return;
                this._connection[connection.ref] = { success: true, value: e };
                return generateDataFromResponse(e);
            });
        }
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