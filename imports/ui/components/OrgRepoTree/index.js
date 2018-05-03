import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import { connect } from "react-redux";
import { withTracker } from 'meteor/react-meteor-data';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { CircularProgress } from 'material-ui/Progress';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import {Treebeard, decorators} from 'react-treebeard';
import {Tree} from 'primereact/components/tree/Tree';
import primeClass from 'primereact/components/tree/Tree.css';

import Button from 'material-ui/Button';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/omega/theme.css';

import { CheckboxBlankOutline, CheckboxMarkedOutline } from 'mdi-material-ui';

import { cfgSources } from '../../data/Repositories.js';
import { cfgIssues } from '../../data/Issues.js';
import _ from 'lodash';

//https://github.com/primefaces/primereact/blob/75ebcc93a37918fee88578b77e70fa6d94207332/src/components/tree/Tree.css

const styles = {
    root: {
        flexGrow: 1,
    },
    progress: {
        margin: 10,
    },
};

decorators.Header = ({style, node}) => {
    const iconType = node.children ? 'folder' : 'file-text';
    const iconClass = `fa fa-${iconType}`;
    const iconStyle = {marginRight: '5px'};

    return (
        <div style={style.base} >
            {node.active ? (
                <CheckboxMarkedOutline />
            ) : (
                <CheckboxBlankOutline />
            )}
            {node.name}
        </div>
    );
};

function loadData() {
    console.log('loadData');
    console.log('loadData - Number of active repos: ' + cfgSources.find({'active': true}).count());
    let data = [];
    let orgIssuesCount = {};
    if (cfgSources !== undefined) {
        cfgSources.find({}).forEach((repo) => {
            let orgIdx = _.findIndex(data, { 'data': repo.org.id});
            if (orgIdx === -1 ) {
                data.push({
                    label: repo.org.name,
                    data: repo.org.id,
                    id: repo.org.id,
                    children: [],
                });
                orgIssuesCount[repo.org.id] = 0
                orgIdx = data.length -1;
            }
            data[orgIdx].children.push({
                label: repo.name + ' (' + repo.issues_count + ')',
                data: repo.id,
                id: repo.id,
                active: repo.active,
                partialSelected: false,
                _$visited: false,
            });
            orgIssuesCount[repo.org.id] = orgIssuesCount[repo.org.id] + repo.issues_count;
            data[orgIdx]['label'] = repo.org.name + " (" + orgIssuesCount[repo.org.id] + ")";
        });
    }
    return data;
}

class OrgRepoTree extends Component {
    constructor(props){
        super(props);
        this.state = { totalLoading: true, initLoad: true, selectedFile: null, selectedFiles1: [], selectedFiles2: [], selectedFile3: null, data: [] };
        this.onToggle = this.onToggle.bind(this);
        this.toggled = {};
    }

    save() {
        const { setLoadIssues } = this.props;

        cfgSources.find({}).map(node => {
            if (_.findIndex(this.state.selectedFiles2, { 'id': node.id})  === -1) {
                //Node is not in selected files, active => false
                cfgSources.update({id: node.id}, {$set:{'active':false}});
            } else {
                //Node is in selected files, active => true
                cfgSources.update({id: node.id}, {$set:{'active':true}});
            }
        })
        setLoadIssues(true);
        console.log('Save - Number of active repos: ' + cfgSources.find({'active': true}).count());
    }

    updateSelectedFromMongo() {
        console.log('updateSelectedFromMongo');
        let selectedFiles = [];
        this.state.data.map(rootNode => {
            let childCount = 0;
            rootNode.children.map(child => {
                if (child.active === true) {
                    child.parent = rootNode;
                    selectedFiles.push(child);
                    childCount++;
                }
            });
            if (childCount === rootNode.children.length) {
                selectedFiles.push(rootNode);
            }
        });
        console.log(selectedFiles);
        this.setState({ selectedFiles2: selectedFiles });
    }

    onToggle(node, toggled){
        console.log('onToggle');
        if(this.state.cursor){this.state.cursor.active = false;}
        node.active = true;
        if(node.children){ this.toggled[node.id] = toggled; }
        this.setState({ cursor: node });
    }

    onCheckboxSelectionChange(e) {
        console.log('onCheckboxSelectionChange');
        console.log(e.selection);
        this.setState({ selectedFiles2: e.selection });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('componentDidUpdate');
        if (this.state.initLoad === true && this.state.data.length > 0) {
            this.setState({ initLoad: false });
            this.updateSelectedFromMongo();
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        console.log('getDerivedStateFromProps');
        if (prevState.totalLoading === true && nextProps.totalLoading === false && cfgSources.find({}).count() > 0) {
            return { ...this.state, data: loadData() };
        } else {
            return null;
        }
    }

    render() {
        const { classes, totalLoading, totalOrgs, totalRepos, totalIssues } = this.props;
        if (totalLoading) {
            return (
                <Card className={classes.card}>
                    <CardContent>
                        <CircularProgress className={classes.progress} /> Loading ...
                    </CardContent>
                </Card>
            );
        } else {
            return (
                <Card className={classes.card}>
                    <CardContent>
                        <Button variant="raised" size="small" color="primary" onClick={() => this.save()}>Save</Button>
                        <Tree value={this.state.data} selectionMode="checkbox" selectionChange={this.onCheckboxSelectionChange.bind(this)} ></Tree>
                    </CardContent>
                </Card>
            );
        }
    }
}
/*
 ui-tree	Main container element
 ui-tree-horizontal	Main container element in horizontal mode
 ui-tree-container	Container of nodes
 ui-treenode	A treenode element
 ui-treenode-content	Content of a treenode
 ui-treenode-toggler	Toggle icon
 ui-treenode-icon	Icon of a treenode
 ui-treenode-label	Label of a treenode
 ui-treenode-children
 <Tree value={this.getData()} selectionMode="checkbox" selectionChange={this.onCheckboxSelectionChange.bind(this)} className={{uiTree: classes.uiTree,uiTreeContainer: classes.uiTreeContainer,uiTreenode: classes.uiTreenode,uiTreenodeContent: classes.uiTreenodeContent,uiTreenodeToggler: classes.uiTreenodeToggler,uiTreenodeIcon: classes.uiTreenodeIcon,uiTreenodeLabel: classes.uiTreenodLabel,uiTreenodeChildren: classes.uiTreenodeChildren}}></Tree>

 */


//classes={{paper: this.props.classes.paper, anchorLeft: this.props.classes.anchorLeft}}
// <DropdownTreeSelect data={this.getData()} onChange={onChange} className={classes.mdlDemo} />
//<Treebeard data={this.getData()} onToggle={this.onToggle} decorators={decorators} />
const mapState = state => ({
    totalLoading: state.github.totalLoading,
});

const mapDispatch = dispatch => ({
    setLoadIssues: dispatch.github.setLoadIssues,
});

export default connect(mapState, mapDispatch)(withStyles(styles)(OrgRepoTree));

