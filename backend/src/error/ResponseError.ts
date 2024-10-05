export class ResponseError extends Error {
    constructor(public status: number, public message: string, public statusMessage: string = "invalid"){
        super(message);
        this.status = status
        this.statusMessage = statusMessage
    }
}