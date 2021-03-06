import { FgRestBuilder } from '#rsu/rest';
import {
    createUrlForProjectAryTemplate,
    createParamsForGet,
} from '#rest';
import schema from '#schema';

export default class AryTemplateRequest {
    constructor(params) {
        const {
            setState,
            setAryTemplate,
        } = params;

        this.setState = setState;
        this.setAryTemplate = setAryTemplate;
    }

    create = (projectId) => {
        const request = new FgRestBuilder()
            .url(createUrlForProjectAryTemplate(projectId))
            .params(createParamsForGet)
            .preLoad(() => { this.setState({ pendingAryTemplate: true, noTemplate: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'aryTemplateGetResponse');
                    this.setAryTemplate({ template: response, projectId });
                    this.setState({ pendingAryTemplate: false });
                } catch (er) {
                    console.error(er);
                    this.setState({ pendingAryTemplate: false });
                }
            })
            .failure((response) => {
                console.warn('Failure', response);
                this.setState({ noTemplate: true, pendingAryTemplate: true });
            })
            .fatal((response) => {
                console.warn('Fatal', response);
                this.setState({ pendingAryTemplate: false });
            })
            .build();
        return request;
    }
}

