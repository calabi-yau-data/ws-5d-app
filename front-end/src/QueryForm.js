import React from "react";

function NumberInput({ value, valid, onChange, placeholder, rawHtmlLabel }) {
    const label =
        <div className="field-label is-normal">
            <label
                className="label"
                dangerouslySetInnerHTML={{ __html: rawHtmlLabel }}
            />
        </div>;

    const body =
        <div className="field-body">
            <div className="field">
                <div className="control">
                    <input
                        className={"input" + (valid ? "" : " is-danger")}
                        value={value}
                        onChange={event => onChange(event.target.value)}
                        placeholder={placeholder}
                    />
                </div>
            </div>
        </div>;

    return (
        <div className="field is-horizontal">
            {label}
            {body}
        </div>
    );
}

function RetrieveButton({ enabled, requestPending }) {
    const label = <div className="field-label is-normal"/>;

    const loading = requestPending ? " is-loading" : "";

    const body =
        <div className="field-body">
            <div className="field">
                <div className="control">
                    <button
                        className={"button is-dark" + loading}
                        disabled={!enabled}
                    >Retrieve</button>
                </div>
            </div>
        </div>;

    return (
        <div className="field is-horizontal">
            {label}
            {body}
        </div>
    );
}

export default
function QueryForm({ requestFields, inputValues, validInputs, canSubmit,
    onChange, onSubmit, requestPending }) {

    const inputs = requestFields.map(field =>
        <NumberInput
            placeholder={field.placeholder}
            rawHtmlLabel={field.label}
            valid={validInputs[field.name]}
            key={field.name}
            value={inputValues[field.name]}
            onChange={value => onChange(field.name, value)}
        />
    );

    return (
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
            {inputs}
            <RetrieveButton
                enabled={canSubmit}
                requestPending={requestPending}
            />
        </form>
    );
}
