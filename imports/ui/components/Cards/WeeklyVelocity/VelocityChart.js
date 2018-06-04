import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { connect } from "react-redux";
import { GithubCircle } from 'mdi-material-ui'
import { Link } from 'react-router-dom';

//import { ResponsiveLine } from '@nivo/line'

import { cfgQueries } from '../../../data/Queries.js';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    table: {
        //width: 700,
    },
    row: {
        height: 24,
    },
});


class VelocityChart extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const { classes, queriesList } = this.props;
        const { columns, pageSize, pageSizes, currentPage, editingStateColumnExtensions } = this.state;



        return (
            <div className={classes.root}>
                <h3>Velocity Chart </h3>
            </div>
        );
    }
}

VelocityChart.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapDispatch = dispatch => ({

});


const mapState = state => ({

});


export default
    connect(mapState, mapDispatch)
    (
        withTracker(() => {return {queriesList: cfgQueries.find({}).fetch()}})
        (
            withStyles(styles)(VelocityChart)
        )
    );

