This is the backend server for the Project Management App. It's built using:

- Node.js + Express (for API)
- Prisma ORM (for database)
- SQLite (simple and file-based for easy sharing)
- TypeScript

------------------------------------------------------------

Getting Started

Follow these steps to set up and launch the backend:

1. Clone the repository (if you haven't yet)

    git clone https://github.com/...
    cd backend

2. Install dependencies

    npm install

3. Setup the database

We are using SQLite (no installation needed). Prisma will handle DB generation automatically.

    npx prisma migrate dev --name init

To access the db on the browser go to http://localhost:5555

This will:
- Create a local SQLite database (dev.db)
- Apply the database schema
- Generate Prisma Client

4. Run the development server

    npx nodemon

The backend will be running on port 5001

------------------------------------------------------------

Tips for Beginners

- Don't edit dev.db directly – Prisma will handle it.
- If you're stuck, try deleting dev.db and running npx prisma migrate dev again.
- For API testing, use tools like Postman or Thunder Client (VS Code extension).
- Always start the backend with "npx nodemon" (not node). This makes changes to
    be reflected automatically.

------------------------------------------------------------
5. Extra

In case the backend does not work add a ".env" file in the backend directory
and write DATABASE_URL="file:./dev.db" inside of it!

------------------------------------------------------------

Useful Commands

Command                          | What it does
----------------------------------|------------------------------------------
npx prisma migrate dev           | Applies DB schema and generates client
npx prisma studio                | Opens a visual DB editor in the browser
npx nodemon                      | Starts the backend in dev mode
"""