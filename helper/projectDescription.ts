enum Method {
    GET,PUT,PATCH,POST,DELETE,HEAD,COPY,OPTIONS,LINK,UNLINK,PURGE,LOCK,UNLOCK,PROPFIND,VIEW
}

enum Protocol {
    HTTP, HTTPS
}

export interface ProjectDescription {
    body: any
    headers: any
    method: Method
    params: any
    path: string
    port: number
    protocol?: Protocol
}