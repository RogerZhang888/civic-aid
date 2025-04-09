export type Message = {
   id: number;
   text: string;
   imgs: File[];
   sender: "user" | "ai";
   timestamp: Date;
}

export type Input = {
   text: string;
   imgs: File[];
};