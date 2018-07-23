import _ from "lodash";
import React from "react";

function addThousandsSeparators(v) {
    v = String(v);
    if (v.length <= 4)
        return v;
    return v.replace(/\B(?=(\d{3})+(?!\d))/g,
                     String.fromCharCode(0x202F)); // NARROW NO-BREAK SPACE
}

export default
function ResultsDisplay({ request, ranges, weightSystemCount, downloadableCount,
    wsPath, sampleSize, samplePath, fullyDetermined, error }) {

    if (error !== null) {
        return (
            <div className="notification is-danger">{error}</div>
        );
    }

    const formattedRequest = request === null ? null : request
        .map(desc =>
            <span key={desc.name}>
                {desc !== request[0] ? ", " : ""}
                {desc !== request[0] && desc === _.last(request) ? "and " : ""}
                <span dangerouslySetInnerHTML={{ __html: desc.label }}/>
                {" "}=&nbsp;{desc.value}
            </span>
        );

    if (request.length != 0 && weightSystemCount == 0) {
        return (
            <div className="content">
                There are no weight sytems with {formattedRequest}.
            </div>
        );
    }

    const formattedCount = addThousandsSeparators(weightSystemCount);

    const info = request.length == 0 ? (
        <p>
            There are {formattedCount} weight systems in total.
            They have the following properties:
        </p>
    ) : weightSystemCount == 1 ? (
        <p>
            There is one weight system with {formattedRequest}.
            {ranges.length > 0 ?
                " It has the following further properties:" : ""}
        </p>
    ) : (
        <p>
            There are {formattedCount} weight systems
            with {formattedRequest}.
            {ranges.length > 0 ?
                " They have the following further properties:" : ""}
        </p>
    );

    const formattedRanges = ranges.map(desc => {
        const values = desc.list_url !== null ? (
            <span>
                <a href={desc.list_url} target="_blank">
                    {addThousandsSeparators(desc.count)} values
                </a>
            </span>
        ) : (
            <span>{desc.count} values</span>
        );

        return desc.count == 1 ? (
            <li key={desc.name}>
                <span dangerouslySetInnerHTML={{ __html: desc.label }}/>
                {" "}= {addThousandsSeparators(desc.min)}
                <br/>
            </li>
        ) : (
            <li key={desc.name}>
                {addThousandsSeparators(desc.min)} ≤{" "}
                <span dangerouslySetInnerHTML={{ __html: desc.label }}/>
                {" "}≤ {addThousandsSeparators(desc.max)} ({values})
                <br/>
            </li>
        );
    });

    const restrict = fullyDetermined ? "" :
        "To further restrict the query, choose values in the ranges given above.";

    const download = weightSystemCount == downloadableCount ? (
        <span>
            The corresponding <a href={wsPath} target="_blank">weight systems</a> can be downloaded. {restrict}
        </span>
    ) : (
        <span>
            There are more weight systems matching the criteria than can be downloaded. {restrict}
        </span>
    );

    const sampleDownload = weightSystemCount > sampleSize ? (
        <span>{" "}
            A <a href={samplePath} target="_blank">sample</a> of {addThousandsSeparators(sampleSize)} weight systems can be downloaded.
        </span>
    ) : "";

    return (
        <div className="content">
            {info}
            <ul>{formattedRanges}</ul>
            {download}
            {sampleDownload}
        </div>
    );
}
