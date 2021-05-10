import axios from 'axios';

export default async function doRequest(host, input, vars) {
    console.log("Called!");
    console.log(host, input, vars);
    const tld = (input.protocol ? input.protocol.toLowerCase() : "http") + "://" + (host ? host : "localhost");
    const url = tld;

    let query = await axios({
        method: input.method,
        url: url
    });
    console.log(query);

    return query;
}