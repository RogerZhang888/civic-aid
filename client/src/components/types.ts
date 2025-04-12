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

export type AuthContextType = {
   currUser: User | null;
   addUserState: (u: User) => void;
   removeUserState: () => void;
}