Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": MySQL database "viaitalia" at "localhost:3306"

Error: P3006

Migration `20260212141616_init` failed to apply cleanly to the shadow database. 
Error code: P3018
Error:
A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20260212141616_init

Database error code: 1005

Database error:
Can't create table `prisma_migrate_shadow_db_336df3e4-08f3-496e-a767-3fd4fcee0880`.`admissionwindow` (errno: 150 "Foreign key constraint is incorrectly formed")

Please check the query number 1 from the migration file.


