import axios from 'axios';

function parseParams(str, vars) {
    // special case for vars:
    if(str.startsWith("{{input.") && str.endsWith("}}")) {
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

export default async function doRequest(host, input, vars) {
    console.log(host, input, vars);

    const protocol = (input.protocol ? input.protocol.toLowerCase() : "http");
    const hostname = (host ? host : "localhost");
    const path = parseParams(input.path, vars);
    const url = protocol + "://" + hostname + ":" + input.port + path;

    console.log(url);
    let data = {};
    let contentType = "text/plain";

    switch(input.body.type) {
        case 'raw':
        case 'binary':
            data = parseParams(input.body.input, vars);
            contentType = data.type;
            break;
        case 'form':
        default:
            break;
    }

    let query = await axios({
        method: input.method,
        url: url,
        data: data,
        headers: {
            'Content-Type': contentType
        }
    });
    console.log(query);

    return query;
}