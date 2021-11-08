CREATE TABLE "users" (

"id" SERIAL PRIMARY KEY,

"name" text NOT NULL,

"email" text NOT NULL UNIQUE,

"phonenumber" text NOT NULL UNIQUE,

"password" varchar NOT NULL

);