import app from "./app";

const URL_PREFIX = "http://rgc.itp.tuwien.ac.at/fourfolds/";

const REFLEXIVE_SETTINGS = {
    backend_url: URL_PREFIX + "db/5d_reflexive",
    request_fields: [
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
            label: "chi",
            placeholder: "Euler characteristic",
        },
    ],
    fix_all_input_count: 3,
    total_weight_system_count: 185269499015,
    total_ranges: {
        h11: {
            count: 190201,
            max: 303148,
            min: 1,
            list_url: URL_PREFIX + "data/5d_reflexive_h11.txt",
        },
        h12: {
            count: 1689,
            max: 2010,
            min: 0,
            list_url: URL_PREFIX + "data/5d_reflexive_h12.txt",
        },
        h13: {
            count: 145848,
            max: 303148,
            min: 1,
            list_url: URL_PREFIX + "data/5d_reflexive_h13.txt",
        },
        h22: {
            count: 361426,
            max: 1213644,
            min: 82,
            list_url: URL_PREFIX + "data/5d_reflexive_h22.txt",
        },
        chi: {
            count: 188804,
            max: 1820448,
            min: -252,
            list_url: URL_PREFIX + "data/5d_reflexive_chi.txt",
        },
    },
    container_id: "reflexive-app"
};

const NON_REFLEXIVE_SETTINGS = {
    backend_url: URL_PREFIX + "db/5d_non_reflexive",
    request_fields: [
        {
            name: "vertex_count",
            label: "n<sub>v</sub>",
            placeholder: "Vertex count",
        },
        {
            name: "facet_count",
            label: "n<sub>f</sub>",
            placeholder: "Facet count",
        },
        {
            name: "point_count",
            label: "n<sub>p</sub>",
            placeholder: "Point count",
        },
    ],

    fix_all_input_count: 3,
    total_weight_system_count: 137114261915,
    total_ranges: {
        vertex_count: {
            count: 44,
            max: 49,
            min: 6,
            list_url: URL_PREFIX + "data/5d_non_reflexive_vertex_count.txt",
        },
        facet_count: {
            count: 58,
            max: 63,
            min: 6,
            list_url: URL_PREFIX + "data/5d_non_reflexive_facet_count.txt",
        },
        point_count: {
            count: 179370,
            max: 222426,
            min: 7,
            list_url: URL_PREFIX + "data/5d_non_reflexive_point_count.txt",
        },
    },
    container_id: "non-reflexive-app"
};

app(REFLEXIVE_SETTINGS);
app(NON_REFLEXIVE_SETTINGS);
