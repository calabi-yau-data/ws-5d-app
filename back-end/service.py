import flask
import io
import sqlalchemy
from sqlalchemy import Column, String, Integer, LargeBinary, func
import urllib

import config


def service(app, engine, root, all_fields, table, stats_table, read_ws, format_ws):
    metadata = sqlalchemy.MetaData(bind=engine)

    columns = [
        Column("ws_count", Integer, nullable=False),
        Column("ws_data", LargeBinary, nullable=False),
    ]
    columns += [Column(field, Integer, nullable=False) for field in all_fields]
    ws_table = sqlalchemy.Table(table, metadata, *columns)

    columns = [
        Column("selector", String, nullable=False),
        Column("ws_count", Integer, nullable=False),
    ]
    columns += [Column(field + "_min", Integer, nullable=False)
                for field in all_fields]
    columns += [Column(field + "_max", Integer, nullable=False)
                for field in all_fields]
    columns += [Column(field + "_count", Integer, nullable=False)
                for field in all_fields]
    stats_table = sqlalchemy.Table(stats_table, metadata, autoload=True)

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
                    for field in all_fields]
        columns += [func.max(ws_table.c[field]).label(field + "_max")
                    for field in all_fields]
        columns += [func.count(ws_table.c[field].distinct())
                    .label(field + "_count") for field in all_fields]

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
        for field in all_fields:
            try:
                request[field] = int(req[field])
            except:
                pass
        return request

    @app.route(root + "stats", endpoint=root + "stats")
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
            fields = filter(lambda field: field not in request, all_fields)

            reply = {
                "request": request,
                "ws_count": stats["ws_count"],
                "can_download": stats["ws_count"] <= config.WEIGHT_SYSTEM_DOWNLOAD_LIMIT,
                "ranges": {field: field_info(field) for field in fields},
            }

        return flask.json.jsonify(reply)

    @app.route(root + "ws_6d_reflexive_<request>.txt", endpoint=root + "data")
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

        def format(row):
            ws_data = io.BytesIO(row["ws_data"])

            return "".join([
                format_ws({**read_ws(ws_data), **row}) + "\n"
                for _ in range(row["ws_count"])
            ])

        try:
            return flask.Response(
                "".join([format(dict(row)) for row in result]),
                mimetype="text/plain",
            )
        finally:
            result.close()
