export const systempromptTemplates = {
    getTypeDecisionTemplate: (userprompt) => {
        return `Decide Type for ${userprompt}`
    },
    clarifyTypeDecisionTemplate: (userprompt) => {
        return `Ask the user follow up to clarify if this is a report or question`
    },
    getReportTemplate: (userprompt) => {
        return `Generate report and confidence for ${userprompt}`
    },
    clarifyReportTemplateLow: (userprompt) => {
        return `Ask for clarification for ${userprompt}`
    },
    clarifyReportTemplateMed: (userprompt) => {
        return `Summarise ${userprompt}, ask for clarification`
    },
    getQuestionTemplate: (userprompt) => {
        return `Respond to question ${userprompt}`
    },
    clarifyQuestionTemplateLow: (userprompt) => {
        return `Provide preliminary response and ask for clarification for ${userprompt}`
    },
    clarifyQuestionTemplateMed: (userprompt) => {
        return `Respond to ${userprompt}, ask for clarification`
    },
}