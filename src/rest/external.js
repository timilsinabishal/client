import {
    POST,
    commonHeaderForPostExternal,
    p,
} from '../config/rest';

export const urlForNer = 'https://deepl.togglecorp.com/api/ner/';
export const urlForFeedback = 'https://deepl.togglecorp.com/api/v2/recommendation/';

export const createParamsForNer = text => ({
    method: POST,
    headers: commonHeaderForPostExternal,
    body: JSON.stringify({
        text,
    }),
});

export const urlForLeadClassify =
    'https://deepl.togglecorp.com/api/v2/classify/';

export const urlForLeadTopicModeling =
    'https://deepl.togglecorp.com/api/topic-modeling/';

export const urlForLeadTopicCorrelation =
    'https://deepl.togglecorp.com/api/subtopics/correlation/';

export const urlForLeadNerDocsId =
    'https://deepl.togglecorp.com/api/ner-docs/';

export const createParamsForLeadClassify = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createParamsForFeedback = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createParamsForLeadTopicModeling = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createParamsForLeadTopicCorrelation = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createParamsForLeadNer = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

export const createUrlForGoogleViewer = docUrl =>
    `https://drive.google.com/viewerng/viewer?${p({
        url: docUrl,
        pid: 'explorer',
        efh: false,
        a: 'v',
        chrome: false,
        embedded: true,
    })}`;