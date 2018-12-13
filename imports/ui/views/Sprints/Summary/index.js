import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Moment from 'react-moment';
import ReactMarkdown from 'react-markdown';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import CustomCard from "../../../components/CustomCard/index.js";

import Edit from './Edit/index.js';
import CloseSprint from './CloseSprint.js';
import RefreshIssues from './RefreshIssues.js';
import AddRepositoryButton from './AddRepositoryButton.js';

import AddRepository from './AddRepository/index.js';


const styles = theme => ({
    root: {
    }
});

class Summary extends Component {
    constructor(props) {
        super(props);
    }

    openEditSprint = () => {
        console.log('openEditSprint');
        const {
            setEditSprint,
            setEditSprintTitle,
            setEditSprintDescription,
            setEditSprintDueDate,
            selectedSprintDescription,
            selectedSprintTitle,
            selectedSprintDueDate,
        } = this.props;

        setEditSprintTitle(selectedSprintTitle);
        setEditSprintDescription(selectedSprintDescription);
        setEditSprintDueDate(selectedSprintDueDate);
        setEditSprint(true);
    };

    render() {
        const {
            classes,
            selectedSprintDescription,
            selectedSprintTitle,
            selectedSprintDueDate,
            editSprint
        } = this.props;
        console.log(selectedSprintDescription);
        console.log(selectedSprintTitle);
        console.log(selectedSprintDueDate);
        console.log(editSprint);

        // More on moment/time:
        // https://maggiepint.com/2016/05/14/moment-js-shows-the-wrong-date/
        // https://momentjs.com/docs/#/parsing/string-format/
        return (
            <CustomCard
                headerTitle={selectedSprintTitle}
                headerFactTitle="Due date"
                headerFactValue={<Moment format="ddd MMM D, YYYY LLL">{selectedSprintDueDate}</Moment> }
            >
                <AddRepository />
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={8}
                >
                    <Grid item xs={12} sm container>
                        {editSprint ? (
                            <Edit />
                        ) : (
                            <ReactMarkdown source={selectedSprintDescription} />
                        )}
                    </Grid>
                    <Grid item >
                        <Grid
                            container
                            direction="column"
                            justify="flex-start"
                            alignItems="flex-start"
                            spacing={8}
                        >
                        {!editSprint &&
                            <Grid item >
                                <Button variant="raised" color="primary" onClick={this.openEditSprint} autoFocus>
                                    Edit Sprint
                                </Button>
                            </Grid>
                        }
                            <Grid item >
                                <CloseSprint />
                            </Grid>
                            <Grid item >
                                <RefreshIssues />
                            </Grid>
                            <Grid item >
                                <AddRepositoryButton />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CustomCard>
        );
    }
}

Summary.propTypes = {
    classes: PropTypes.object,
};

const mapDispatch = dispatch => ({
    setEditSprint: dispatch.sprintsView.setEditSprint,
    setEditSprintTitle: dispatch.sprintsView.setEditSprintTitle,
    setEditSprintDescription: dispatch.sprintsView.setEditSprintDescription,
    setEditSprintDueDate: dispatch.sprintsView.setEditSprintDueDate,
    saveSprint: dispatch.sprintsView.saveSprint,
});

const mapState = state => ({
    editSprint: state.sprintsView.editSprint,
    selectedSprintDescription: state.sprintsView.selectedSprintDescription,
    selectedSprintTitle: state.sprintsView.selectedSprintTitle,
    selectedSprintDueDate: state.sprintsView.selectedSprintDueDate,

    milestones: state.sprintsView.milestones,

});

export default connect(mapState, mapDispatch)(withStyles(styles)(Summary));