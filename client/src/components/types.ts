export type Query = {
   id: string;
   question: string;
   img: File | null;
   answer: string;
   timestamp: Date;
   status: "pending" | "finished" | "error";
   sources?: string[];
}

export type Chat = {
   id: string;
   title: string;
   type: "question" | "report" | "unknown";
   createdAt: Date;
   queries: Query[];
}

export type FormState = {
   text: string;
   img: File | null;
}

export type ChatContextType = {
   chats: Chat[];
   currChatId: string | undefined;
   formState: FormState;
   imgPreview: string | null;
   handleAddQuery: () => Promise<void>;
   updateFormImage: (_: File | null) => void;
   updateFormText: (_: string) => void;
   deleteChat: (_: string) => void;
   coords: GeolocationCoordinates | undefined;
   isWaiting: boolean;
}

export type User = {
   id: number;
   email: string;
   userName: string;
}

export type LoginFields = {
   userName: string;
   password: string;
}

export type RegisterFields = {
   userName: string;
   email: string;
   password: string;
   confirmPassword: string
}