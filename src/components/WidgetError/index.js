import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';

import Cloak from '#components/Cloak';
import { handleException, handleReport } from '#config/sentry';
import _ts from '#ts';
import styles from './styles.scss';

export default class WidgetError extends React.PureComponent {
    static handleException = handleException;
    static shouldHideReport = ({ isDevMode }) => isDevMode;

    render() {
        const errorText = _ts('components.widgetError', 'problemText');
        const reportErrorTitle = _ts('components.widgetError', 'reportErrorTitle');

        return (
            <div className={styles.messageContainer}>
                { errorText }
                <Cloak
                    hide={WidgetError.shouldHideReport}
                    render={
                        <PrimaryButton
                            onClick={handleReport}
                            className={styles.button}
                        >
                            {reportErrorTitle}
                        </PrimaryButton>
                    }
                />
            </div>
        );
    }
}
