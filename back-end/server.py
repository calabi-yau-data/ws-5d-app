FIELDS = ["h11", "h12", "h13", "h22", "chi"]

import io
import flask
import urllib
import sqlalchemy
from sqlalchemy import Column, String, Integer, LargeBinary, func

import config
import decoder

engine = sqlalchemy.create_engine(config.DB_URL)
metadata = sqlalchemy.MetaData(bind=engine)

columns = [
    Column("ws_count", Integer, nullable=False),
    Column("ws_data", LargeBinary, nullable=False),
]
columns += [Column(field, Integer, nullable=False) for field in FIELDS]
ws_table = sqlalchemy.Table("reflexive5d", metadata, *columns)

columns = [
    Column("selector", String, nullable=False),
    Column("ws_count", Integer, nullable=False),
]
columns += [Column(field + "_min", Integer, nullable=False)
            for field in FIELDS]
columns += [Column(field + "_max", Integer, nullable=False)
            for field in FIELDS]
columns += [Column(field + "_count", Integer, nullable=False)
            for field in FIELDS]
stats_table = sqlalchemy.Table("reflexive5d_stats", metadata, autoload=True)


def get_stats_single(field, value):
    query = sqlalchemy.sql.select([stats_table]) \
        .where(stats_table.c.selector == field) \
        .where(stats_table.c[field + "_min"] == value)

    result = engine.execute(query)
    try:
        row = result.first()
        if row is None:
            return None

        return dict(row)
    finally:
        result.close()


def get_stats_multi(request):
    columns = [func.sum(ws_table.c.ws_count).label("ws_count")]
    columns += [func.min(ws_table.c[field]).label(field + "_min")
                for field in FIELDS]
    columns += [func.max(ws_table.c[field]).label(field + "_max")
                for field in FIELDS]
    columns += [func.count(ws_table.c[field].distinct())
                .label(field + "_count") for field in FIELDS]

    query = sqlalchemy.sql.select(columns)

    for field in request:
        query = query.where(ws_table.c[field] == request[field])

    result = engine.execute(query)
    try:
        row = result.first()

        if row is None or row.ws_count is None:
            return None

        return dict(row)
    finally:
        result.close()


def get_stats(request):
    if len(request) == 0:
        return None

    if len(request) == 1:
        field = next(iter(request.keys()))
        return get_stats_single(field, request[field])
    else:
        return get_stats_multi(request)


def parse_request(req):
    request = {}
    for field in FIELDS:
        try:
            request[field] = int(req[field])
        except:
            pass
    return request


app = flask.Flask(__name__)


@app.route("/reflexive/stats")
def stats_handler():
    request = parse_request(flask.request.args)
    stats = get_stats(request)

    def field_info(field):
        return {
            "min": stats[field + "_min"],
            "max": stats[field + "_max"],
            "count": stats[field + "_count"],
        }

    if stats is None:
        reply = {
            "request": request,
            "ws_count": 0,
            "can_download": True,
            "ranges": {},
        }
    else:
        fields = filter(lambda field: field not in request, FIELDS)

        reply = {
            "request": request,
            "ws_count": stats["ws_count"],
            "can_download": stats["ws_count"] <= config.WEIGHT_SYSTEM_DOWNLOAD_LIMIT,
            "ranges": {field: field_info(field) for field in fields},
        }

    return flask.json.jsonify(reply)


@app.route("/reflexive/ws_6d_reflexive_<request>.txt")
def ws_handler(request):
    request = urllib.parse.parse_qs(request.replace("_", "&"))
    request = parse_request({k: v[0] for k, v in request.items()})
    stats = get_stats(request)

    if stats is None:
        return ""

    if stats["ws_count"] > config.WEIGHT_SYSTEM_DOWNLOAD_LIMIT:
        flask.abort(403)  # forbidden

    query = sqlalchemy.sql.select([ws_table])

    for field in request:
        query = query.where(ws_table.c[field] == request[field])

    result = engine.execute(query)

    def format_ws_entry(info):
        return "{} {} M:{} {} N:{} {} H:{},{},{} [{}]".format(
            sum(info["weights"]),
            " ".join(map(str, info["weights"])),
            info["point_count"],
            info["vertex_count"],
            info["dual_point_count"],
            info["facet_count"],
            info["h11"],
            info["h12"],
            info["h13"],
            info["chi"],
        )

    def format(row):
        ws_data = io.BytesIO(row["ws_data"])

        return "".join([
            format_ws_entry({**decoder.read_ws_entry(ws_data), **row}) + "\n"
            for _ in range(row["ws_count"])
        ])

    try:
        return flask.Response(
            "".join([format(dict(row)) for row in result]),
            mimetype="text/plain",
        )
    finally:
        result.close()
