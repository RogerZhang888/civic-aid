export type Message = {
   id: string;
   text: string;
   imgs: File[];
   sender: "user";
   timestamp: Date;
} | {
   id: string;
   text: string;
   imgs: File[];
   sender: "ai";
   status: "pending";
   timestamp?: Date;
} | {
   id: string;
   text: string;
   imgs: File[];
   sender: "ai";
   status: "finished";
   timestamp: Date;
}

export type FormState = {
   text: string;
   imgs: File[];
};