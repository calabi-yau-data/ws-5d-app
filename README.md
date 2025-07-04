# Five-dimensional Maximal Polyhedra Server

## Database

Populate the database:
```sh
./info-6-1-1 --pgcopy /dev/stdout \
             --reflexive-in /mnt/data-b/combined-reflexive-ws |
sudo -u postgres psql -d polyhedra -c 'begin;
create table reflexive5d (
    h11 int4 not null,
    h12 int4 not null,
    h13 int4 not null,
    h22 int4 not null,
    chi int4 not null,
    ws_count int4 not null,
    ws_data bytea not null
) tablespace reflexive5d;
copy reflexive5d from stdin binary;
end;'

./info-6-1-1 --pgcopy /dev/stdout \
             --non-reflexive-in /mnt/data-b/combined-non-reflexive-ws |
sudo -u postgres psql -d polyhedra -c 'begin;
create table non_reflexive5d (
    vertex_count int4 not null,
    facet_count int4 not null,
    point_count int4 not null,
    ws_count int4 not null,
    ws_data bytea not null
) tablespace reflexive5d;
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
sudo -u postgres psql -d polyhedra < create-statistics.sql
```

Create user:
```sql
create user polyhedra_reader password 'not_so_secret';
grant connect on database polyhedra to polyhedra_reader;
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
apt-get install python3 python3-flask python3-sqlalchemy python3-psycopg2 gunicorn3 supervisor postgresql nginx
... or ...
dnf install python3 python3-flask python3-sqlalchemy python3-psycopg2 python3-gunicorn supervisor postgresql nginx
```

Generate attribute lists
```
for x in h11 h12 h13 h22 chi; do
sudo -u postgres psql -d polyhedra -c "copy (
    select $x, count(*) as hodge_triple_count, sum(ws_count) as ws_count
    from reflexive5d group by $x order by $x
) to stdout with csv header" > data/5d_reflexive_$x.txt
done

for x in vertex_count facet_count point_count; do
sudo -u postgres psql -d polyhedra -c "copy (
    select $x, count(*) as hodge_triple_count, sum(ws_count) as ws_count
    from non_reflexive5d group by $x order by $x
) to stdout with csv header" > data/5d_non_reflexive_$x.txt
done
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
supervisorctl update
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

### Create list of Hodge numbers

```sql
sudo -u postgres psql -d polyhedra -c "copy (
    select h11, h12, h13, sum(ws_count) as weight_system_count
    from reflexive5d
    group by h11, h12, h13
) to stdout with csv header" > hodge-numbers.csv
```

```sh
sudo zip /var/www/html/fourfolds/hodge-numbers.zip hodge-numbers.csv
xz hodge-numbers.csv
sudo mv hodge-numbers.csv.xz /var/www/html/fourfolds/hodge-numbers.csv.xz
```
