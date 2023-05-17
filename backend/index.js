/* Inhämtar alla "paket" */

//import of dotenv to hide sensitive keys
import * as dotenv from 'dotenv'
//implement dotenv
dotenv.config()
//Hämtar express
import express from 'express'
//Retrieves CORS, handles various request http packets
import cors from 'cors'
//downloads the client package so communication between server and database works
import pkg from 'pg'
const { Client } = pkg
//Download body-parser (A middleware that can handle different request methods supports several formats)
import bodyParser from 'body-parser'
//Imports path that allows us to use static files anywhere in our project
import path from 'path'
/* Implementerar express tillsammans med "app" */
const app = express()

/* Lägger in middlewares */
//Bodyparser
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true
    })
)
//Cors
app.use(cors())
//Express ska användas med json formatet
app.use(express.json())
//Förbättrar cors kommunikation
app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
})
//Använder path för att komma åt våra statiska filer, i detta fallet i vår kommande public mapp i vår frontend
app.use(express.static(path.join(path.resolve(), 'public')))

//Implementar min databas
const db = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

//Errorfunktion
db.connect(function (err) {
    if (err) throw err
    console.log('Database Connected')
})

//Routes
//Get anrop
app.get('/', (req, res) => {
    res.json('Hejsan svejsan')
})

//Get alla böcker
app.get('/books', async (req, res) => {
    try {
        const allBooks = await db.query('SELECT * FROM books')
        res.json(allBooks.rows)
    } catch (err) {
        console.log(err.message)
    }
})

//POST , så att vi kan skapa böcker
app.post('/books', async (req, res) => {
    const { title, cover, price, about } = req.body
    const values = [title, cover, price, about]
    await db.query(
        'INSERT INTO books(title, cover, price, about) VALUES($1, $2, $3, $4)',
        values
    )
    res.send('Book added')
})

//Delete, då behöver vi id
app.delete('/books/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deleteBook = await db.query('DELETE FROM books WHERE id = $1', [
            id
        ])
        res.json({ message: 'Book Deleted' })
    } catch (err) {
        console.log(err.message)
    }
})

//PUT ändra boken
app.put('/books/:id', async (req, res) => {
    const id = req.params.id
    const { title, cover, price, about } = req.body
    const values = [title, cover, price, about, id]
    await db.query(
        'UPDATE books SET title = $1, cover = $2, price = $3, about = $4 WHERE id = $5',
        values
    )
    res.send('Book is changed')
})

//Gör så att servern dras igång och lyssnar
app.listen(8800, () => {
    console.log('Server is running')
})
