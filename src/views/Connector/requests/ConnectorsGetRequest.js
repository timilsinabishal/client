import { FgRestBuilder } from '#rsu/rest';
import {
    createParamsForGet,
    urlForConnectorsForAdmin,
} from '#rest';
import _ts from '#ts';
import schema from '#schema';
import notify from '#notify';

const emptyList = [];

export default class ConnectorsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            const { setUserConnectors } = this.props;
            schema.validate(response, 'connectors');
            const connectors = response.results || emptyList;
            const formattedConnectors = {};
            connectors.forEach((c) => {
                formattedConnectors[c.id] = {
                    id: c.id,
                    versionId: c.versionId,
                    source: c.source,
                    title: c.title,
                };
            });
            setUserConnectors({ connectors: formattedConnectors });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const message = response.$internal.join(' ');
        notify.send({
            title: _ts('connector', 'connectorTitle'),
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('connector', 'connectorTitle'),
            type: notify.type.ERROR,
            message: _ts('connector', 'connectorGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = () => {
        const connectorsRequest = new FgRestBuilder()
            .url(urlForConnectorsForAdmin)
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ dataLoading: true }); })
            .postLoad(() => { this.props.setState({ dataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorsRequest;
    }
}
