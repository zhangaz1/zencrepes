import _ from 'lodash';

import { cfgIssues, cfgQueries } from '../../../data/Minimongo.js';

import { refreshBurndown } from '../../../utils/burndown/index.js';
import { buildFacets } from '../../../utils/facets/index.js';
import { refreshVelocity } from '../../../utils/velocity/index.js';

export default {
    state: {
        issues: [],
        facets: [],
        queries: [],

        selectedTab: 0, // Selected tab to be displayed

        query: {},

        defaultPoints: true,    // Default display to points, otherwise issues count

        burndown: {},
        shouldBurndownDataReload: false,  // We don't want to reload the burndown data automatically when issues are changed

        velocity: {},
        shouldVelocityDataReload: false,  // We don't want to reload the velocity data automatically when issues are changed

        remainingWorkRepos: [],                  // List repos with open issues
        remainingWorkPoints: 0,
        remainingWorkCount: 0,
        shouldSummaryDataReload: false,

    },
    reducers: {
        setIssues(state, payload) {return { ...state, issues: payload };},
        setFacets(state, payload) {return { ...state, facets: payload };},
        setQueries(state, payload) {return { ...state, queries: payload };},
        setSelectedTab(state, payload) {return { ...state, selectedTab: payload };},

        setQuery(state, payload) {return { ...state, query: JSON.parse(JSON.stringify(payload)) };},

        setDefaultPoints(state, payload) {return { ...state, defaultPoints: payload };},

        setShouldBurndownDataReload(state, payload) {return { ...state, shouldBurndownDataReload: payload };},
        setBurndown(state, payload) {return { ...state, burndown: JSON.parse(JSON.stringify(payload)) };},

        setShouldVelocityDataReload(state, payload) {return { ...state, shouldVelocityDataReload: payload };},
        setVelocity(state, payload) {return { ...state, velocity: JSON.parse(JSON.stringify(payload)) };},

        setShouldSummaryDataReload(state, payload) {return { ...state, shouldSummaryDataReload: payload };},
        setRemainingWorkRepos(state, payload) {return { ...state, remainingWorkRepos: payload };},
        setRemainingWorkPoints(state, payload) {return { ...state, remainingWorkPoints: payload };},
        setRemainingWorkCount(state, payload) {return { ...state, remainingWorkCount: payload };},
    },
    effects: {
        async initIssues(payload, rootState) {
            this.refreshFacets();
            this.refreshIssues();
            this.refreshQueries();

            this.setShouldBurndownDataReload(true);
            this.refreshSummary();
            this.refreshVelocity();
        },

        async updateQuery(query, rootState) {
            this.setQuery(query);

            this.setShouldBurndownDataReload(true);
            this.refreshFacets();
            this.refreshIssues();
            this.refreshSummary();
            this.refreshVelocity();
        },

        async addRemoveQuery(value, rootState, facet) {
            console.log('addRemoveQuery');
            let query = rootState.issuesView.query;

            //1- Mutate the query to the corresponding state
            let facetKey = facet.key;
            if (facet.nested === false) {
                if (query[facetKey] === undefined) {
                    query[facetKey] = {"$in": [value.name]};
                } else if (query[facetKey]['$in'].includes(value.name)) {
                    // Remove element from array
                    query[facetKey]['$in'] = query[facetKey]['$in'].filter(i => i !== value.name);
                    if (query[facetKey]['$in'].length === 0) {
                        delete query[facetKey];
                    }
                } else {
                    query[facetKey]['$in'].push(value.name);
                }
            } else {
                facetKey = facetKey + '.edges';
                let nestedKey = 'node.' + facet.nestedKey;
                if (query[facetKey] === undefined) {
                    query[facetKey] = {'$elemMatch': {}};
                    query[facetKey]['$elemMatch'][nestedKey] = {"$in": [value.name]};
                } else if (query[facetKey]['$elemMatch'][nestedKey]['$in'].includes(value.name)) {
                    query[facetKey]['$elemMatch'][nestedKey]['$in'] = query[facetKey]['$elemMatch'][nestedKey]['$in'].filter(i => i !== value.name);
                    if (query[facetKey]['$elemMatch'][nestedKey]['$in'].length === 0) {
                        delete query[facetKey];
                    }
                } else {
                    query[facetKey]['$elemMatch'][nestedKey]['$in'].push(value.name);
                }
            }
            /*
            {
            "assignees.edges":{"$elemMatch":{"node.login":{"$in":["lepsalex","hlminh2000"]}}}
            ,"milestone.state":{"$in":["OPEN"]}
            ,"org.name":{"$in":["Human Cancer Models Initiative - Catalog","Kids First Data Resource Center"]}}
            */
            this.updateQuery(query);
        },

        async refreshQueries(payload, rootState) {
            console.log(cfgQueries.find({}).fetch());
            this.setQueries(cfgQueries.find({}).fetch());
        },

        async saveQuery(queryName, rootState) {
            if (cfgQueries.find({filters: JSON.stringify(rootState.issuesView.query)}).count() === 0) {
                await cfgQueries.insert({
                    name: queryName,
                    filters: JSON.stringify(rootState.issuesView.query),
                });

            }
            this.refreshQueries();
        },

        async refreshIssues(payload, rootState) {
            let issues = cfgIssues.find(rootState.issuesView.query).fetch();
            this.setIssues(issues);
        },

        async refreshSummary(payload, rootState) {
            let t0 = performance.now();

            let query = rootState.issuesView.query;
            let openedIssuesFilter = {...query, ...{'state':{$in:['OPEN']}}};
            let openedIssues = cfgIssues.find(openedIssuesFilter).fetch();

            let repos = [];
            statesGroup = _.groupBy(openedIssues, 'repo.name');
            Object.keys(statesGroup).forEach(function(key) {
                repos.push({
                    count: statesGroup[key].length,
                    name: key,
                    issues: statesGroup[key],
                    points: statesGroup[key].map(i => i.points).reduce((acc, points) => acc + points, 0)
                });
            });
            this.setRemainingWorkRepos(repos);
            this.setRemainingWorkPoints(repos.map(r => r.points).reduce((acc, points) => acc + points, 0));
            this.setRemainingWorkCount(repos.map(r => r.issues.length).reduce((acc, count) => acc + count, 0));

            var t1 = performance.now();
            console.log("refreshSummary - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshFacets(payload, rootState) {
            let t0 = performance.now();

            let query = rootState.issuesView.query;
            let updatedFacets = buildFacets(query, cfgIssues);
            this.setFacets(updatedFacets);

            var t1 = performance.now();
            console.log("refreshFacets - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshBurndown(payload, rootState) {
            let t0 = performance.now();

            this.setShouldBurndownDataReload(false);

            let mongoFilter = rootState.issuesView.query;
            let burndownData = await refreshBurndown(mongoFilter, cfgIssues);

            this.setBurndown(burndownData);

            var t1 = performance.now();
            console.log("refreshBurndown - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshVelocity(payload, rootState) {
            let t0 = performance.now();

            this.setShouldVelocityDataReload(false);

            let mongoFilter = rootState.issuesView.query;
            let velocityData = await refreshVelocity(mongoFilter, cfgIssues);

            this.setVelocity(velocityData);

            var t1 = performance.now();
            console.log("refreshVelocity - took " + (t1 - t0) + " milliseconds.");
        },
    }
};

