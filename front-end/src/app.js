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

export default
function app(settings) {
    const SAMPLE_SIZE = 100000;

    const SET_FORM_DATA = "SET_FORM_DATA";
    const SUBMIT_FORM = "SUBMIT_FORM";
    const SET_RESPONSE = "SET_RESPONSE";

    const setFormData = (name, value) => ({ type: SET_FORM_DATA, name, value });
    const submitForm = () => ({ type: SUBMIT_FORM });
    const setResponse = (response) => ({ type: SET_RESPONSE, response });

    const initialState = {
        formData: _.mapValues(_.keyBy(settings.request_fields, "name"), () => ""),
        requestPending: false,
        response: null,
    };

    function statsRequestUrl(request) {
        const qs = _.keys(request).map(key => key + "=" + request[key]).join("&");
        return settings.backend_url + "_stats?" + qs;
    }

    function weightSystemsRequestUrl(request) {
        const qs = _.keys(request).map(key => key + "=" + request[key]).join(",");
        return settings.backend_url + "," + qs + ".txt";
    }

    function fieldRequestUrl(targetField, request) {
        const qs = _.keys(request).map(key => key + "=" + request[key]).join(",");
        return settings.backend_url + "_" + targetField + "," + qs + ".txt";
    }

    function sampleRequestUrl(request) {
        const qs = _.keys(request)
            .map(key => key + "=" + request[key]);
        qs.push("limit=" + SAMPLE_SIZE);
        return settings.backend_url + "," + _.join(qs, ",") + ".txt";
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
        let request, ranges, weightSystemCount, wsPath, error, downloadableCount, samplePath;

        if (state.response != null && state.response.ok) {
            request = state.response.request;
            ranges = state.response.ranges;
            weightSystemCount = state.response.ws_count;
            wsPath = weightSystemsRequestUrl(state.response.request);
            samplePath = sampleRequestUrl(state.response.request);
            downloadableCount = state.response.downloadable_ws_count;
            error = null;

            _.each(ranges, (x, name) => {
                x.list_url = downloadableCount == weightSystemCount ?
                    fieldRequestUrl(name, state.response.request) : null;
            });
        } else {
            request = [];
            ranges = settings.total_ranges;
            weightSystemCount = settings.total_weight_system_count;
            wsPath = null;
            samplePath = sampleRequestUrl({});
            downloadableCount = 0;
            if (state.response != null)
                error = "Server error.";
            else
                error = null;
        }

        request = settings.request_fields.map(desc =>
            Object.assign({ value: request[desc.name] }, desc))
            .filter(x => x.value != null);

        ranges = settings.request_fields.map(desc =>
            Object.assign({}, ranges[desc.name], desc))
            .filter(x => x.count != null);

        return {
            fullyDetermined: request.length >= settings.fix_all_input_count,
            request,
            ranges,
            weightSystemCount,
            downloadableCount,
            wsPath,
            error,
            samplePath,
            sampleSize: SAMPLE_SIZE,
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

            return ajax(statsRequestUrl(state.getState().formData))
                .map(r => setResponse(Object.assign({}, r.response, { ok: true })))
                .catch(() => observableOf(setResponse({ ok: false })));
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
                    <ConnectedQueryForm requestFields={settings.request_fields}/>
                </div>
                <div className="column">
                    <ConnectedResultsDisplay/>
                </div>
            </div>
        </Provider>,
        document.getElementById(settings.container_id)
    );
}
