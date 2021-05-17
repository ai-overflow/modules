import axios from 'axios';
import {parseParams} from './paramParser';

function generateParams(params, vars) {
    if (!params)
        return "";

    let paramStr = "?";
    for (let [n, value] of Object.entries(params)) {
        paramStr += parseParams(n, vars) + "=" + parseParams(value, vars) + "&";
    }
    return paramStr;
}

function generateFormData(formData, vars) {
    if (!formData)
        return null;

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
    return bodyFormData;
}

function generateHeaders(headers, vars) {
    if (!headers)
        return {};

    let headerOutput = {};
    for (let [n, value] of Object.entries(headers)) {
        headerOutput[parseParams(n, vars)] = parseParams(value, vars);
    }
    return headerOutput;
}

export default async function doRequest(host, input, vars) {

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
    return axios({
        method: input.method,
        url: url,
        data: data,
        headers: {
            'Content-Type': contentType,
            ...generateHeaders(input.headers)
        }
    });
}