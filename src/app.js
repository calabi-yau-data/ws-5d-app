import _ from "lodash";
import React from "react";
import { render } from "react-dom";
import { applyMiddleware, createStore, compose } from "redux";
import { Provider, connect } from "react-redux";
import { createEpicMiddleware } from "redux-observable";
import { ajax } from "rxjs/observable/dom/ajax";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/takeUntil";
import { of as observableOf } from "rxjs/observable/of";

import QueryForm from "./QueryForm";
import ResultsDisplay from "./ResultsDisplay";

import "bulma/bulma.sass";

const REQUEST_FIELDS = [
    {
        name: "h11",
        label: "h<sup>1,1</sup>",
        placeholder: "Hodge number",
    },
    {
        name: "h12",
        label: "h<sup>1,2</sup>",
        placeholder: "Hodge number",
    },
    {
        name: "h13",
        label: "h<sup>1,3</sup>",
        placeholder: "Hodge number",
    },
    {
        name: "h22",
        label: "h<sup>2,2</sup>",
        placeholder: "Hodge number",
    },
    {
        name: "chi",
        label: "χ",
        placeholder: "Euler characteristic",
    },
];

const TOTAL_WEIGHT_SYSTEM_COUNT = 463217738;

const TOTAL_RANGES = {
    h11: {
        count: 187496,
        max: 303148,
        min: 1
    },
    h12: {
        count: 1467,
        max: 1989,
        min: 0
    },
    h13: {
        count: 81836,
        max: 156420,
        min: 1
    },
    h22: {
        count: 348673,
        max: 1213644,
        min: 180
    },
    chi: {
        count: 183919,
        max: 1820448,
        min: -144
    },
};

const SET_FORM_DATA = "SET_FORM_DATA";
const SUBMIT_FORM = "SUBMIT_FORM";
const SET_RESPONSE = "SET_RESPONSE";

const setFormData = (name, value) => ({ type: SET_FORM_DATA, name, value });
const submitForm = () => ({ type: SUBMIT_FORM });
const setResponse = (response) => ({ type: SET_RESPONSE, response });

const initialState = {
    formData: _.mapValues(_.keyBy(REQUEST_FIELDS, "name"), () => ""),
    requestPending: false,
    response: null,
};

function stats_request_url(request) {
    const qs = _.keys(request).map(key => key + "=" + request[key]).join("&");
    return "http://rgc.itp.tuwien.ac.at/fourfolds/db/reflexive/stats?" + qs;
}

function weight_systems_request_url(request) {
    const qs = _.keys(request).map(key => key + "=" + request[key]).join("_");
    return "http://rgc.itp.tuwien.ac.at/fourfolds/db/reflexive/ws_6d_reflexive_" + qs + ".txt";
}

function validNumberInput(value) {
    return value === "" || /^[+-]?\d+$/.test(value);
}

function validFormData(formData) {
    return _.every(_.map(formData, validNumberInput));
}

function stateToFormProps(state) {
    return {
        requestPending: state.requestPending,
        canSubmit: validFormData(state.formData),
        inputValues: state.formData,
        validInputs: _.mapValues(state.formData, validNumberInput),
    };
}

function dispatchToFormProps(dispatch) {
    return {
        onChange: (id, value) =>
            dispatch(setFormData(id, value)),
        onSubmit: () =>
            dispatch(submitForm()),
    };
}

const ConnectedQueryForm =
    connect(stateToFormProps, dispatchToFormProps)(QueryForm);

function stateToDisplayProps(state) {
    let request, ranges, weightSystemCount, wsPath;

    if (state.response != null) {
        request = state.response.request;
        ranges = state.response.ranges;
        weightSystemCount = state.response.ws_count;
        wsPath = state.response.can_download ?
            weight_systems_request_url(state.response.request) : null;
    } else {
        request = [];
        ranges = TOTAL_RANGES;
        weightSystemCount = TOTAL_WEIGHT_SYSTEM_COUNT;
        wsPath = null;
    }

    return {
        request: REQUEST_FIELDS.map(desc =>
            Object.assign({ value: request[desc.name] }, desc))
            .filter(x => x.value != null),

        ranges: REQUEST_FIELDS.map(desc =>
            Object.assign({}, ranges[desc.name], desc))
            .filter(x => x.count != null),

        weightSystemCount,
        wsPath,
    };
}

const ConnectedResultsDisplay =
    connect(stateToDisplayProps)(ResultsDisplay);

function reduce(state = initialState, action) {
    switch (action.type) {
    case SET_FORM_DATA:
        return Object.assign({}, state, {
            formData: Object.assign({}, state.formData, {
                [action.name]: action.value
            })
        });
    case SET_RESPONSE:
        return Object.assign({}, state, {
            response: action.response,
            requestPending: false,
        });
    case SUBMIT_FORM:
        return Object.assign({}, state, { requestPending: true });
    default:
        return state;
    }
}

const epic = (action, state) =>
    action.ofType(SUBMIT_FORM).switchMap(() => {
        let req = state.getState().formData;
        req = _.pickBy(req, x => x != "");

        if (_.size(req) == 0)
            return observableOf(setResponse(null));

        return ajax(stats_request_url(state.getState().formData))
            .map(r => setResponse(r.response))
            .catch(() => observableOf(setResponse(null)));
    });

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    reduce,
    composeEnhancers(applyMiddleware(createEpicMiddleware(epic)))
);

render(
    <Provider store={store}>
        <div className="columns">
            <div className="column is-5">
                <ConnectedQueryForm requestFields={REQUEST_FIELDS}/>
            </div>
            <div className="column">
                <ConnectedResultsDisplay/>
            </div>
        </div>
    </Provider>,
    document.getElementById("app")
);
