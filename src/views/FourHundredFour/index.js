import React from 'react';
import ReactSVG from 'react-svg';
import { Link } from 'react-router-dom';

import _ts from '#ts';
import { pathNames } from '#constants';
import logo from '#resources/img/deep-logo.svg';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class FourHundredFour extends React.PureComponent {
    render() {
        return (
            <div className={styles.fourHundredFour}>
                <ReactSVG
                    svgClassName={styles.deepLogo}
                    path={logo}
                />
                <h1 className={styles.heading}>
                    {_ts('fourHundredFour', 'errorFourHundredFour')}
                </h1>
                <p className={styles.message}>
                    {_ts('fourHundredFour', 'message1')}
                    <br />
                    {_ts('fourHundredFour', 'message2')}
                </p>
                <Link
                    to={pathNames.homeScreen}
                    className={styles.homeScreenLink}
                >
                    {_ts('fourHundredFour', 'goToDeep')}
                </Link>
            </div>
        );
    }
}
