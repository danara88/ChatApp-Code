export class Message {
    constructor(
        public user: string,
        public chat: string,
        public text: string,
        public created_at: string
    ){}
}