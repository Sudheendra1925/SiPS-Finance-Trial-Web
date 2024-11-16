const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'indra@sql',
    database: 'Trial'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Login.html'));
});

app.get('/Home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Home.html'));
});

app.get('/Investors', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Investors.html'));
});

app.get('/Clients', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Clients.html'));
});

app.get('/Leads', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Leads.html'));
});


app.get('/AddInvestor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddInvestor.html'));
});

app.get('/AddClient', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddClient.html'));
});

app.get('/AddLead', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddLead.html'));
});




app.post('/NewInvestor', (req, res) => {
    // Destructure request body to get input values
    const {InvestorName, AmountInvested, TotalDuration, RateOfInterest, PayableInterest, EMIDate, InvestedIn, Image } = req.body;

    // Define SQL query with placeholders
    const sql = `INSERT INTO Investors (OrderId, InvestorName, AmountInvested, TotalDuration, RateOFInterest, PayableInterest, EMIDate, InvestedIn, Image)
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [ InvestorName, AmountInvested, TotalDuration, RateOfInterest, PayableInterest, EMIDate, InvestedIn, Image], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.send('Inserted Successfully');
    });
});

app.post('/NewClient', (req, res) => {
    // Destructure request body to get input values
    const {
     ClientName, TotalAmount,
        AddressAndOccupation, PhoneNumber, Aadhar,AadharCard, Pan, PanCard,Image,Comments
      } = req.body;

    // Define SQL query with placeholders
    const sql = `INSERT INTO Clients (
    ClientId, ClientName, TotalAmount,
    AddressAndOccupation, PhoneNumber, Aadhar,AadharCard, Pan, PanCard,Comments, Image
)
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?,?,?,?)`;

    // Execute the query, passing values from the request body
    db.query(sql, [ ClientName, TotalAmount,
        AddressAndOccupation, PhoneNumber, Aadhar,AadharCard, Pan, PanCard,Comments, Image], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.send('Inserted Successfully');
    });
});




app.post("/NewLead",(req,res)=>{

    const {LeadName,Amount,IssuedDate,Duration} = req.body;

    // Define SQL query with placeholders
    const sql = `INSERT INTO Leads (LeadName,Amount,IssuedDate,Duration)
                 VALUES (?, ?, ?, ?)`;

    // Execute the query, passing values from the request body
    db.query(sql, [ LeadName,Amount,IssuedDate,Duration], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.send('Inserted Successfully');
    });
})

app.get("/InvestorData",(req,res)=>{
    db.query('SELECT * FROM Investors', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        res.json(results);
    });
})

app.get("/ClientData",(req,res)=>{
    db.query('SELECT * FROM Clients', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        res.json(results);
    });
})


app.get("/LeadData",(req,res)=>{
    db.query('SELECT * FROM Leads', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        res.json(results);
    });
})




app.listen(2001,()=>{

    console.log("SUCCESFUL")
}

)