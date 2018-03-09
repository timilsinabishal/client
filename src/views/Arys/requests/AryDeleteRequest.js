import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import {
    createUrlForAryDelete,
    createParamsForAryDelete,
    transformResponseErrorToFormError,
} from '../../../rest';

export default class AryDeleteRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { pullArys } = params;
        this.pullArys = pullArys;
    }

    create = (ary) => {
        const { id } = ary;
        const arysRequest = new FgRestBuilder()
            .url(createUrlForAryDelete(id))
            .params(() => createParamsForAryDelete())
            .preLoad(() => {
                this.setState({ loadingArys: true });
            })
            .success(() => {
                notify.send({
                    title: 'Arys', // FIXME: strings
                    type: notify.type.SUCCESS,
                    message: 'Ary Delete Success', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
                this.pullArys();
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: 'Arys', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Arys', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Ary Delete Failure', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return arysRequest;
    }
}