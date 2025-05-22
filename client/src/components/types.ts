export type QueryStatusTypes = "pending" | "finished";

export type Query = {
   question: string;
   media: string | null;
   answer: string | React.ReactNode;
   timestamp: Date;
   status: QueryStatusTypes;
   sources: string[];
}

export type ChatTypes = "unknown" | "question" | "report";

export type Chat = {
   id: string;
   title: string;
   type: ChatTypes;
   createdAt: Date;
   queries: Query[];
}

export type GetChatRes = {
   id: string,
   title: string,
   type: ChatTypes,
   created_at: string,
}

export type GetQueriesForChatRes = {
   // normal reply
   prompt: string,
   answer: string,
   sources: string[],
   media: string | undefined,
   valid: true,
   timestamp: string
} | {
   // report reply
   prompt: string,
   answer: string,
   sources: string[],
   media: string | undefined,
   summary: string, 
   urgency: number, 
   recommendedSteps: string, 
   agency: string,
   valid: true,
   timestamp: string,
   reportId: string
}

// export type AllowedAgencies = "MSO" | "NEA" | "LTA" | "HDB" | "NParks" | "SP Group" | "Town Councils" | "SPF" | "PUB" | "Others";
export type ReportStatusTypes = "pending" | "resolved" | "rejected" | "in progress";

export type Report = {
   id: string;
   userId: string;
   chatId: string;
   title: string;
   description: string;
   mediaUrl: string[];
   incidentAddress: string | null;
   agency: string;
   recommended_steps: string;
   urgency: number;
   reportConfidence: number;
   status: ReportStatusTypes;
   isPublic: boolean;
   createdAt: Date;
   resolvedAt: Date | null;
   remarks: string | null;
   upvoteCount: number;
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
   permissions: Array<string>;
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

export type Comment = {
   id: string;
   reportId: string;
   parentId: string;
   upvoteCount: number;
   text: string;
   createdAt: Date;
}