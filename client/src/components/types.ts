export type Message = {
   id: string;
   text: string;
   img: File | null;
   sender: "user";
   timestamp: Date;
} | {
   id: string;
   text: string;
   sender: "ai";
   status: "pending";
   timestamp?: Date;
} | {
   id: string;
   text: string;
   sender: "ai";
   status: "finished";
   timestamp: Date;
}

export type FormState = {
   text: string;
   img: File | null;
}

export type User = {
   id: number;
   email: string;
   userName: string;
}

export type LoginFields = {
   email: string;
   password: string;
}

export type RegisterFields = {
   userName: string;
   email: string;
   password: string;
   confirmPassword: string
}

export type UserContextType = {
   currUser: User | null;
   addUserState: (u: User) => void;
   removeUserState: () => void;
}