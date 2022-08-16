# staycation-server

A server application for booking hotel
link deploy: https://travel-staycation.herokuapp.com/

## Tech Stack

**Server:** Node Js, Express Js

**Database:** MongoDB

**Testing:** Mocha, Chai

## Features

- Auth session storage
- CRUD Catagory, Item, Feature, Activity, etc

## Documentation

[Documentation](#)

## Run Locally

Clone the project

```bash
  git clone https://github.com/Jesicaahr/staycation-server.git
```

Go to the project directory

```bash
  cd staycation-server
```

Install dependencies

```bash
  npm install
```

Create .env file and add variables(DB_USER, DB_PASSWORD, DB_NAME)

```bash
  touc .env
```

Seed data

```bash
  node seed.js
```

Start the server

```bash
  npm run dev
```

For testing

```bash
  npm run test
```

Go to http://localhost:3000/ on your browser
