import React from 'react';

import {
    TextArea,
} from '../../../../../public/components/Input';


export default class ExcerptTextList extends React.PureComponent {
    constructor(props) {
        super(props);
        console.log(props);
    }

    render() {
        return (
            <TextArea
                showLabel={false}
                showHintAndError={false}
            />
        );
    }
}