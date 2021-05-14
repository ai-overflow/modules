import axios from 'axios';

function parseParams(str, vars) {
    // special case for vars:
    if (str.startsWith("{{input.") && str.endsWith("}}")) {
        const result = str.replace(/{{input.(.*?)}}/, "$1");
        return vars[result];
    }
    let re = /{{(.*?)}}/g;
    return str.replaceAll(re, (a, b) => {
        b = b.replace("input.", "");
        if (a && b && vars[b]) {
            return vars[b];
        } else if (!vars[b]) {
            return '';
        } else {
            return a;
        }
    });
}

function generateParams(params, vars) {
    let paramStr = "?";
    for (let [n, value] of Object.entries(params)) {
        paramStr += parseParams(n, vars) + "=" + parseParams(value, vars) + "&";
    }
    return paramStr;
}

function generateFormData(formData, vars) {
    var bodyFormData = new FormData();
    for (let [n, value] of Object.entries(formData)) {
        let data;
        if (value.type === "text") {
            data = parseParams(value.value, vars);
        } else {
            data = parseParams(value.value, vars);
        }
        bodyFormData.append(parseParams(n, vars), data);
    }
    console.log("called:", bodyFormData);
    return bodyFormData;
}

function generateHeaders(headers, vars) {
    let headerOutput = {};
    for (let [n, value] of Object.entries(headers)) {
        headerOutput[parseParams(n, vars)] = parseParams(value, vars);
    }
    return headerOutput;
}

export default async function doRequest(host, input, vars) {
    console.log(host, input, vars);

    const protocol = (input.protocol ? input.protocol.toLowerCase() : "http");
    const hostname = (host ? host : "localhost");
    const path = parseParams(input.path, vars);
    const params = generateParams(input.params, vars);
    const url = protocol + "://" + hostname + ":" + input.port + path + params;

    console.log(url);
    let data = {};
    let contentType = "text/plain";

    switch (input.body.type) {
        case 'raw':
        case 'binary':
            data = parseParams(input.body.input, vars);
            if (data) {
                contentType = data.type;
            }
            break;
        case 'form':
        case 'form-data':
            data = generateFormData(input.body.input, vars);
            break;
        default:
            break;
    }

    let query = await axios({
        method: input.method,
        url: url,
        data: data,
        headers: {
            'Content-Type': contentType,
            ...generateHeaders(input.headers)
        }
    });
    console.log(query);

    return query;
}