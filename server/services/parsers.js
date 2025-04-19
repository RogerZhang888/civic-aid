const keyMatcher = {
    "agencyresponsible": "agency",
    "recommendedstepsfortheagency": "recommendedSteps",
    "urgency":"urgency",
    "confidence":"confidence",
    "summary":"summary",
    "answer":"answer"
}

const extractJson = (raw) => {
    const jsonRegex = /\{\s*(?:"[^"]+"\s*:\s*[^,{}]+)(\s*,\s*"[^"]+"\s*:\s*[^,{}]+)*\s*\}/
    const sourceRegex = /[sS]ource[\s][0-9]+/
    let jsonSection = raw.match(jsonRegex)
    let obj = {}
    try {
        obj = JSON.parse(jsonSection)
    } catch {
        console.log("Invalid JSON parse", jsonSection)
        return {invalid:true}
    }
    let parsedobj = {}
    for (let key in obj) {
        if (key.match(sourceRegex)) {
            if (!("sources" in parsedobj)) parsedobj.sources = []
            parsedobj.sources.push(obj[key])
        }
        let convertedkey = key.replace(/\s/g, '').toLowerCase()
        if (convertedkey in keyMatcher) {
            parsedobj[keyMatcher[convertedkey]] = obj[key]
        }
    }
}

export const responseParsers = {
    typeDecisionParser: (res) => {
        // QUESTION, REPORT + CONFIDENCE, VALID
        let r = {type: undefined, valid: undefined, confidence: undefined}
        let parsed = extractJson(res)
        if (parsed.invalid) return {valid:false}

        if (!("type" in parsed) || !("confidence" in parsed)) r.valid = false
        else {
            r = {
                type: parsed.type,
                confidence: parsed.confidence,
                valid: true
            }
        }
        console.log("Type decision parser validty", r)
        return r
    },
    defaultParser: (res) => {
        // Just standard answer + confidence parser
        let r = {answer: undefined, valid: undefined, confidence: undefined, sources: undefined}
        let parsed = extractJson(res)
        if (parsed.invalid) return {valid:false}

        if (!("answer" in parsed) || !("confidence" in parsed) || !("sources" in parsed)) r.valid = false
        else {
            r = {
                answer: parsed.answer,
                confidence: parsed.confidence,
                sources: parsed.sources,
                valid: true
            }
        }

        return r
    },
    reportParser: (res) => {
        // For reports
        let r = {summary: undefined, agency: undefined, confidence: undefined, sources: undefined, urgency:undefined, recommendedSteps:undefined}
        let parsed = extractJson(res)
        if (parsed.invalid) return {valid:false}

        if (
            !("summary" in parsed) ||
            !("agency" in parsed) ||
            !("confidence" in parsed) ||
            !("sources" in parsed) ||
            !("urgency" in parsed) ||
            !("recommendedSteps" in parsed)
        ) r.valid = false
        else {
            r = parsed
            r.valid = true
        }
    }
}