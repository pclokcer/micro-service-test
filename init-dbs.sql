-- init-dbs.sql
CREATE DATABASE user_db;
CREATE DATABASE company_db;

CREATE USER user_admin WITH PASSWORD 'user_pass';
GRANT ALL PRIVILEGES ON DATABASE user_db TO user_admin;
ALTER DATABASE user_db OWNER TO user_admin;

CREATE USER company_admin WITH PASSWORD 'company_pass';
GRANT ALL PRIVILEGES ON DATABASE company_db TO company_admin;
ALTER DATABASE company_db OWNER TO company_admin;

CREATE DATABASE order_db;
CREATE USER order_admin WITH PASSWORD 'order_pass';
GRANT ALL PRIVILEGES ON DATABASE order_db TO order_admin;
ALTER DATABASE order_db OWNER TO order_admin;

CREATE DATABASE transfer_db;
CREATE USER transfer_admin WITH PASSWORD 'transfer_pass';
GRANT ALL PRIVILEGES ON DATABASE transfer_db TO transfer_admin;
ALTER DATABASE transfer_db OWNER TO transfer_admin;

CREATE DATABASE wallet_db;
CREATE USER wallet_admin WITH PASSWORD 'wallet_pass';
GRANT ALL PRIVILEGES ON DATABASE wallet_db TO wallet_admin;
ALTER DATABASE wallet_db OWNER TO wallet_admin;
