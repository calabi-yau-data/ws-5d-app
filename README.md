# Five-dimensional Maximal Polyhedra Server

## Database

Populate the database:
```sh
./info-6-1-1 --pgcopy /dev/stdout \
             --reflexive-in data/combined-reflexive-ws |
psql -d polyhedra -c 'begin;
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
psql -d polyhedra -c 'begin;
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

Analyzed the tables to improve performance:
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
```sh
psql -d polyhedra < create-statistics.sql
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
