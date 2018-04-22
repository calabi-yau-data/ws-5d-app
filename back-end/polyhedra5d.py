import flask
import sqlalchemy

import config
from decoder import read_varint
import service

engine = sqlalchemy.create_engine(config.DB_URI)
app = flask.Flask(__name__)


def read_reflexive_ws(stream):
    return {
        "weights": [read_varint(stream) for _ in range(6)],
        "vertex_count": read_varint(stream),
        "facet_count": read_varint(stream),
        "point_count": read_varint(stream),
        "dual_point_count": read_varint(stream),
    }


def read_non_reflexive_ws(stream):
    return {
        "weights": [read_varint(stream) for _ in range(6)],
    }


def format_reflexive_ws(info):
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


def format_non_reflexive_ws(info):
    return "{} {} M:{} {} F:{}".format(
        sum(info["weights"]),
        " ".join(map(str, info["weights"])),
        info["point_count"],
        info["vertex_count"],
        info["facet_count"],
    )


service.service(app, engine, "reflexive", ["h11", "h12", "h13", "h22", "chi"],
                "reflexive5d", "reflexive5d_stats", read_reflexive_ws,
                format_reflexive_ws)

service.service(app, engine, "non_reflexive", ["vertex_count", "facet_count", "point_count"],
                "non_reflexive5d", "non_reflexive5d_stats", read_non_reflexive_ws,
                format_non_reflexive_ws)
