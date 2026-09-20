-- init-dbs.sql
CREATE DATABASE user_db;
CREATE DATABASE company_db;

CREATE USER user_admin WITH PASSWORD 'user_pass';
GRANT ALL PRIVILEGES ON DATABASE user_db TO user_admin;
ALTER DATABASE user_db OWNER TO user_admin;

CREATE USER company_admin WITH PASSWORD 'company_pass';
GRANT ALL PRIVILEGES ON DATABASE company_db TO company_admin;
ALTER DATABASE company_db OWNER TO company_admin;
