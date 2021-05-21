import axios from 'axios';
import { paramParser } from './paramParser';
import { ProjectDescription } from "./projectDescription";

function generateParams(params: Record<string, string>) {
    if (!params)
        return "";

    let paramStr = "?";
    for (const [n, value] of Object.entries(params)) {
        paramStr += paramParser.parseParams(n) + "=" + paramParser.parseParams(value) + "&";
    }
    return paramStr;
}

function generateFormData(formData: Record<string, any>) {
    if (!formData)
        return null;

    const bodyFormData = new FormData();
    for (const [n, value] of Object.entries(formData)) {
        let data;
        if (value.type === "text") {
            data = paramParser.parseParams(value.value);
        } else {
            data = paramParser.parseParams(value.value);
        }
        bodyFormData.append(paramParser.parseParams(n), data);
    }
    return bodyFormData;
}

function generateHeaders(headers: Record<string, string>) {
    if (!headers)
        return {};

    const headerOutput: Record<string, any> = {};
    for (const [n, value] of Object.entries(headers)) {
        headerOutput[paramParser.parseParams(n)] = paramParser.parseParams(value);
    }
    return headerOutput;
}

export default async function doRequest(host: string, input: ProjectDescription) {
    const protocol = (input.protocol ? input.protocol.toLowerCase() : "http");
    const hostname = (host ? host : "localhost");
    const path = paramParser.parseParams(input.path);
    const params = generateParams(input.params);
    const url = protocol + "://" + hostname + ":" + input.port + path + params;

    console.log(url);
    let data: any = {};
    let contentType = "text/plain";

    switch (input.body.type) {
        case 'raw':
        case 'binary':
            data = paramParser.parseParams(input.body.input);
            if (data) {
                contentType = data.type;
            }
            break;
        case 'form':
        case 'form-data':
            data = generateFormData(input.body.input);
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