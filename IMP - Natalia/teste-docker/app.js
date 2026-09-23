import express from 'express'

const app = express()
const porta = process.env.PORTA || 3000;

app.get('/', (req,res) =>{
    res.json({message: "Oi do Docker!!"})
});

app.listen(porta,() =>{
    console.log(`Servidor rodando na porta: ${porta}`)
});