create type reflexive5d_stats_selector
    as enum ('h11', 'h12', 'h13', 'h22', 'chi');

create type non_reflexive5d_stats_selector
    as enum ('vertex_count', 'facet_count', 'point_count');

create unlogged table reflexive5d_stats (
    selector reflexive5d_stats_selector not null,
    h11_min int4 not null,
    h11_max int4 not null,
    h11_count int4 not null,
    h12_min int4 not null,
    h12_max int4 not null,
    h12_count int4 not null,
    h13_min int4 not null,
    h13_max int4 not null,
    h13_count int4 not null,
    h22_min int4 not null,
    h22_max int4 not null,
    h22_count int4 not null,
    chi_min int4 not null,
    chi_max int4 not null,
    chi_count int4 not null,
    ws_count int8 not null
);

create unlogged table non_reflexive5d_stats (
    selector non_reflexive5d_stats_selector not null,
    vertex_count_min int4 not null,
    vertex_count_max int4 not null,
    vertex_count_count int4 not null,
    facet_count_min int4 not null,
    facet_count_max int4 not null,
    facet_count_count int4 not null,
    point_count_min int4 not null,
    point_count_max int4 not null,
    point_count_count int4 not null,
    ws_count int8 not null
);

insert into reflexive5d_stats
select
    'h11' as selector,
    min(h11) as h11_min, max(h11) as h11_max,
    count(distinct h11) as h11_count,
    min(h12) as h12_min, max(h12) as h12_max,
    count(distinct h12) as h12_count,
    min(h13) as h13_min, max(h13) as h13_max,
    count(distinct h13) as h13_count,
    min(h22) as h22_min, max(h22) as h22_max,
    count(distinct h22) as h22_count,
    min(chi) as chi_min, max(chi) as chi_max,
    count(distinct chi) as chi_count,
    sum(ws_count)
from reflexive5d
group by h11;

insert into reflexive5d_stats
select
    'h12' as selector,
    min(h11) as h11_min, max(h11) as h11_max,
    count(distinct h11) as h11_count,
    min(h12) as h12_min, max(h12) as h12_max,
    count(distinct h12) as h12_count,
    min(h13) as h13_min, max(h13) as h13_max,
    count(distinct h13) as h13_count,
    min(h22) as h22_min, max(h22) as h22_max,
    count(distinct h22) as h22_count,
    min(chi) as chi_min, max(chi) as chi_max,
    count(distinct chi) as chi_count,
    sum(ws_count)
from reflexive5d
group by h12;

insert into reflexive5d_stats
select
    'h13' as selector,
    min(h11) as h11_min, max(h11) as h11_max,
    count(distinct h11) as h11_count,
    min(h12) as h12_min, max(h12) as h12_max,
    count(distinct h12) as h12_count,
    min(h13) as h13_min, max(h13) as h13_max,
    count(distinct h13) as h13_count,
    min(h22) as h22_min, max(h22) as h22_max,
    count(distinct h22) as h22_count,
    min(chi) as chi_min, max(chi) as chi_max,
    count(distinct chi) as chi_count,
    sum(ws_count)
from reflexive5d
group by h13;

insert into reflexive5d_stats
select
    'h22' as selector,
    min(h11) as h11_min, max(h11) as h11_max,
    count(distinct h11) as h11_count,
    min(h12) as h12_min, max(h12) as h12_max,
    count(distinct h12) as h12_count,
    min(h13) as h13_min, max(h13) as h13_max,
    count(distinct h13) as h13_count,
    min(h22) as h22_min, max(h22) as h22_max,
    count(distinct h22) as h22_count,
    min(chi) as chi_min, max(chi) as chi_max,
    count(distinct chi) as chi_count,
    sum(ws_count)
from reflexive5d
group by h22;

insert into reflexive5d_stats
select
    'chi' as selector,
    min(h11) as h11_min, max(h11) as h11_max,
    count(distinct h11) as h11_count,
    min(h12) as h12_min, max(h12) as h12_max,
    count(distinct h12) as h12_count,
    min(h13) as h13_min, max(h13) as h13_max,
    count(distinct h13) as h13_count,
    min(h22) as h22_min, max(h22) as h22_max,
    count(distinct h22) as h22_count,
    min(chi) as chi_min, max(chi) as chi_max,
    count(distinct chi) as chi_count,
    sum(ws_count)
from reflexive5d
group by chi;

insert into non_reflexive5d_stats
select
    'vertex_count' as selector,
    min(vertex_count) as vertex_count_min,
    max(vertex_count) as vertex_count_max,
    count(distinct vertex_count) as vertex_count_count,
    min(facet_count) as facet_count_min,
    max(facet_count) as facet_count_max,
    count(distinct facet_count) as facet_count_count,
    min(point_count) as point_count_min,
    max(point_count) as point_count_max,
    count(distinct point_count) as point_count_count,
    sum(ws_count)
from non_reflexive5d
group by vertex_count;

insert into non_reflexive5d_stats
select
    'facet_count' as selector,
    min(vertex_count) as vertex_count_min,
    max(vertex_count) as vertex_count_max,
    count(distinct vertex_count) as vertex_count_count,
    min(facet_count) as facet_count_min,
    max(facet_count) as facet_count_max,
    count(distinct facet_count) as facet_count_count,
    min(point_count) as point_count_min,
    max(point_count) as point_count_max,
    count(distinct point_count) as point_count_count,
    sum(ws_count)
from non_reflexive5d
group by facet_count;

insert into non_reflexive5d_stats
select
    'point_count' as selector,
    min(vertex_count) as vertex_count_min,
    max(vertex_count) as vertex_count_max,
    count(distinct vertex_count) as vertex_count_count,
    min(facet_count) as facet_count_min,
    max(facet_count) as facet_count_max,
    count(distinct facet_count) as facet_count_count,
    min(point_count) as point_count_min,
    max(point_count) as point_count_max,
    count(distinct point_count) as point_count_count,
    sum(ws_count)
from non_reflexive5d
group by point_count;

analyze reflexive5d_stats;
analyze non_reflexive5d_stats;
