export type QueryStatusTypes = "pending" | "finished" | "error";

export type Query = {
   id: string;
   question: string;
   img: File | null;
   answer: string | React.ReactNode;
   timestamp: Date;
   status: QueryStatusTypes;
   sources: string[];
}

// export type ChatTypes = "unknown" | "question" | "report";

export type Chat = {
   id: string;
   title: string;
   // type: ChatTypes;
   createdAt: Date;
   queries: Query[];
}

export type AllowedAgencies = "MSO" | "NEA" | "LTA" | "HDB" | "NParks" | "SP Group" | "Town Councils" | "SPF" | "PUB" | "Others";
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
   isFetchingAChat: boolean;
}

export type User = {
   id: number;
   email: string;
   username: string;
}

export type LoginFields = {
   username: string;
   password: string;
}

export type RegisterFields = {
   username: string;
   email: string;
   password: string;
   confirmPassword: string
}

export type SiteLanguages = "en" | "zh" | "ms" | "ta";

export const Languages: { display: string, code: SiteLanguages }[] = [
   { display: "English", code: "en" },
   { display: "中文", code: "zh" },
   { display: "Bahasa Melayu", code: "ms" },
   { display: "தமிழ்", code: "ta" },
];

export type LanguageContextType = {
   language: SiteLanguages;
   toggleLanguage: (x: SiteLanguages) => void;
}