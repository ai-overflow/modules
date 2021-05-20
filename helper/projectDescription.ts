type Method = "GET" | "PUT" | "PATCH" | "POST" | "DELETE" | "HEAD" | "OPTIONS" | "LINK" | "UNLINK" | "PURGE";

type Protocol = "HTTP" | "HTTPS"

export interface ProjectDescription {
    body: any
    headers: any
    method: Method
    params: any
    path: string
    port: number
    protocol?: Protocol
}