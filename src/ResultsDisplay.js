import _ from "lodash";
import React from "react";

export default
function ResultsDisplay({ request, ranges, weightSystemCount, wsPath,
                          fullyDetermined }) {

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

    const formattedCount =
        String(weightSystemCount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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

    const formattedRanges = ranges.map(desc =>
        desc.count == 1 ? (
            <li key={desc.name}>
                <span dangerouslySetInnerHTML={{ __html: desc.label }}/>
                {" "}= {desc.min}
                <br/>
            </li>
        ) : (
            <li key={desc.name}>
                {desc.min} ≤{" "}
                <span dangerouslySetInnerHTML={{ __html: desc.label }}/>
                {" "}≤ {desc.max} ({desc.count} values)
                <br/>
            </li>
        )
    );

    const restrict = fullyDetermined ? "" :
        "To further restrict the query, choose values in the ranges given above.";

    const download = request.length == 0 ? (
        ""
    ) : wsPath != null ? (
        <span>
            The corresponding <a href={wsPath} download>weight systems text
            file</a> can be downloaded. {restrict}
        </span>
    ) : (
        <span>
            There are more weight systems matching the criteria than can be
            downloaded. {restrict}
        </span>
    );

    return (
        <div className="content">
            {info}
            <ul>{formattedRanges}</ul>
            {download}
        </div>
    );
}
