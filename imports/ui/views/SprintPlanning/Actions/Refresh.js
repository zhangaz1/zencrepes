import _ from 'lodash';
import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import {connect} from "react-redux";

import Button from '@material-ui/core/Button';
import Snackbar from "@material-ui/core/Snackbar";

import {buildMongoSelector} from "../../../utils/mongo";
import {cfgIssues} from "../../../data/Minimongo";

const styles = theme => ({
    button: {
        marginLeft: '10px',
    },
});
class Refresh extends Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    refreshRepos = () => {
        console.log('refreshQuick');
        const { setLoadFlag, setLoadRepos, repositories, milestones } = this.props;
        //Get list of repositories for current query
        console.log(milestones);
        setLoadRepos(milestones.map(milestone => milestone.repo.id));
//        setLoadRepos(repositories.map(repository => repository.id));
        setLoadFlag(true);

    };

    render() {
        const { classes, loading, milestones } = this.props;

        if (milestones.length === 0 || loading === true) {
            return null;
        } else {
            return (
                <Button variant="raised" color="primary" className={classes.button} onClick={this.refreshRepos}>
                    Refresh Issues Repos
                </Button>
            )
        }
    };
}

Refresh.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapState = state => ({
    loading: state.issuesFetch.loading,
    milestones: state.sprintsView.milestones,
    repositories: state.sprintsView.repositories,
});

const mapDispatch = dispatch => ({
    setLoadFlag: dispatch.issuesFetch.setLoadFlag,
    setLoading: dispatch.issuesFetch.setLoading,

    setLoadRepos: dispatch.issuesFetch.setLoadRepos,
});


export default connect(mapState, mapDispatch)(withStyles(styles)(Refresh));
