export type Message = {
   id: number;
   text: string;
   imgs: File[];
   sender: "user" | "ai";
   timestamp: Date;
}

export type FormState = {
   text: string;
   imgs: File[];
};