import { FgRestBuilder } from '#rsu/rest';

import {
    createUrlForProjectsOfUser,
    createParamsForGet,
} from '#rest';
import schema from '#schema';
import notify from '#notify';
import _ts from '#ts';

export default class UserProjectsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = userId => (response) => {
        try {
            schema.validate(response, 'projectsGetResponse');
            this.props.setUserProjects({
                userId,
                projects: response.results,
                extra: response.extra,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        notify.send({
            title: _ts('connector', 'projectsTitle'),
            type: notify.type.ERROR,
            message: response.error,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('connector', 'projectsTitle'),
            type: notify.type.ERROR,
            message: _ts('connector', 'projectsGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (userId) => {
        const projectsRequest = new FgRestBuilder()
            .url(createUrlForProjectsOfUser(userId))
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ projectDataLoading: true }); })
            .postLoad(() => { this.props.setState({ projectDataLoading: false }); })
            .success(() => this.success(userId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return projectsRequest;
    }
}
