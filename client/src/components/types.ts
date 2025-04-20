export type StatusTypes = "pending" | "finished" | "error";

export type Query = {
   id: string;
   question: string;
   img: File | null;
   answer: string;
   timestamp: Date;
   status: StatusTypes;
   sources?: string[];
}

export type Chat = {
   id: string;
   title: string;
   type: StatusTypes;
   createdAt: Date;
   queries: Query[];
}

export type AllowedAgencies = "MSO" | "NEA" | "LTA" | "HDB" | "NParks" | "SP Group" | "Town Councils" | "SPF" | "PUB";
export type ReportStatusTypes = "pending" | "resolved";

export type Report = {
   id: string;
   userId: string;
   chatId: string;
   title: string;
   description: string;
   mediaUrl: string[];
   incidentLocation: GeolocationCoordinates | null;
   agency: AllowedAgencies;
   recommended_steps: string;
   urgency: number;
   reportConfidence: number;
   status: ReportStatusTypes;
   createdAt: Date;
   resolvedAt: Date | null;
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
   updateFormImage: (x: File | null) => void;
   updateFormText: (x: string) => void;
   deleteChat: (x: string) => Promise<void>;
   renameChat: (x: string, y: string) => Promise<void>;
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