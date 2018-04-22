# Five-dimensional Maximal Polyhedra Server

## Database

Populate the database:
```sh
./info-6-1-1 --pgcopy /dev/stdout \
             --reflexive-in data/combined-reflexive-ws |
psql -c 'begin;
create table reflexive5d (
    h11 int4 not null,
    h12 int4 not null,
    h13 int4 not null,
    h22 int4 not null,
    chi int4 not null,
    ws_count int4 not null,
    ws_data bytea not null
);
copy reflexive5d from stdin binary;
end;'
```

```sh
./info-6-1-1 --pgcopy /dev/stdout \
             --non-reflexive-in data/combined-non-reflexive-ws |
psql -c 'begin;
create table non_reflexive5d (
    vertex_count int4 not null,
    facet_count int4 not null,
    point_count int4 not null,
    ws_count int4 not null,
    ws_data bytea not null
);
copy non_reflexive5d from stdin binary;
end;'
```

After populating the database the tables should be analyzed to improve performance:
```sql
analyze reflexive5d;
analyze non_reflexive5d;
```

Create indices:
```sql
create index on reflexive5d (h11, h12);
create index on reflexive5d (h11, h13);
create index on reflexive5d (h11, h22);
create index on reflexive5d (h11, chi);
create index on reflexive5d (h12, h11);
create index on reflexive5d (h12, h13);
create index on reflexive5d (h12, h22);
create index on reflexive5d (h12, chi);
create index on reflexive5d (h13, h11);
create index on reflexive5d (h13, h12);
create index on reflexive5d (h13, h22);
create index on reflexive5d (h13, chi);
create index on reflexive5d (h22, h11);
create index on reflexive5d (h22, h12);
create index on reflexive5d (h22, h13);
create index on reflexive5d (h22, chi);
create index on reflexive5d (chi, h11);
create index on reflexive5d (chi, h12);
create index on reflexive5d (chi, h13);
create index on reflexive5d (chi, h22);

create index on non_reflexive5d (vertex_count, facet_count);
create index on non_reflexive5d (vertex_count, point_count);
create index on non_reflexive5d (facet_count, point_count);
create index on non_reflexive5d (facet_count, vertex_count);
create index on non_reflexive5d (point_count, vertex_count);
create index on non_reflexive5d (point_count, facet_count);
```

Create statistics tables:
```
create type reflexive5d_stats_selector
    as enum ('h11', 'h12', 'h13', 'h22', 'chi');

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
    ws_count int4 not null
);

create type non_reflexive5d_stats_selector
    as enum ('vertex_count', 'facet_count', 'point_count');

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
```

```sql
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
```

```sql
analyze reflexive5d_stats;
analyze non_reflexive5d_stats;
```

Create user:
```sql
create user polyhedra_reader password 'not_so_secret';
grant connect on polyhedra to polyhedra_reader;
grant select on reflexive5d, reflexive5d_stats, non_reflexive5d, non_reflexive5d_stats to polyhedra_reader;
```

## Back-end

### Development

```sh
apt-get install python3
cd back-end
virtualenv -p python3 python
source python/bin/activate
pip install -r requirements.txt
DB=postgresql://polyhedra_reader:not_so_secret@127.0.0.1/polyhedra FLASK_APP=polyhedra5d.py flask run --port=64823
```

### Deployment

Install the dependencies
```sh
apt-get install python3 python3-flask python3-sqlalchemy python3-psycopg2 gunicorn3 supervisor
... or ...
dnf install python3 python3-flask python3-sqlalchemy python3-psycopg2 python3-gunicorn supervisor
```

/etc/supervisor/conf.d/polyhedra5d.conf:
```ini
[program:polyhedra5d]
command=/usr/bin/gunicorn3 -b 127.0.0.1:64823 polyhedra5d:app
directory=/path/to/back-end
environment=DB="postgresql://polyhedra_reader:not_so_secret@127.0.0.1/polyhedra"
user=nobody
autorestart=true
redirect_stderr=true
```

```sh
supervisorctl reread
supervisorctl start polyhedra5d
```

```nginx
location /fourfolds/db/ {
    gzip on;
    gzip_types text/plain;
    proxy_pass http://localhost:64823/;
}
```

## Front-end

### Development

```
cd front-end
npm install
npm run start
```

### Deployment

```
cd front-end
npm install
npm run build
```
