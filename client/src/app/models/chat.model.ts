export class Chat {
    constructor(
        public _id: string,
        public user: string,
        public title: string,
        public description: string,
        public image: string,
        public created_at: string
    ){}
}