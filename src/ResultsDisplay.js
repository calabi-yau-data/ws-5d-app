import _ from "lodash";
import React from "react";

export default
function ResultsDisplay({ request, ranges, weightSystemCount, wsPath }) {
    if (request === null)
        return <div/>;

    const formattedRequest = request
        .map(desc =>
            <span key={desc.name}>
                {desc !== request[0] ? ", " : ""}
                {desc !== request[0] && desc === _.last(request) ? "and " : ""}
                <span dangerouslySetInnerHTML={{ __html: desc.label }}/>
                {" "}=&nbsp;{desc.value}
            </span>
        );

    if (weightSystemCount == 0) {
        return (
            <div className="content">
                There are no weight sytems with {formattedRequest}.
            </div>
        );
    }

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

    const download = wsPath != null ? (
        <span>
            The corresponding <a href={wsPath} download>weight systems text
            file</a> can be downloaded.
        </span>
    ) : (
        <span>
            There are more weight systems matching the criteria than can be
            downloaded.
        </span>
    );

    const info = weightSystemCount == 1 ? (
        <p>
            There is one weight system with {formattedRequest}.
            {ranges.length > 0 ?
                " It has the following further properties:" : ""}
        </p>
    ) : (
        <p>
            There are {weightSystemCount} weight systems
            with {formattedRequest}.
            {ranges.length > 0 ?
                " They have the following further properties:" : ""}
        </p>
    );

    return (
        <div className="content">
            {info}
            <ul>
                {formattedRanges}
            </ul>
            <p>
                {download}{" "}
                To further restrict the query, choose values in the ranges given
                above.
            </p>
        </div>
    );
}
