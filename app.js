const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const crypto = require('crypto');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let Sno=0;
const generateSmallId = (prefix) => {
    const id = crypto.randomBytes(3).toString('hex'); // Generates a 6-character hex string
    return `${prefix}-${id}`;
  };

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'indra@sql',
    database: 'SipsFinanceTrial'
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

app.get('/AddInvestement', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddInvestement.html'));
});

app.get('/AddOrder', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddOrder.html'));
});

app.get('/Investor/:ID', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Investor.html'));
});

app.get('/Client/:ID', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Client.html'));
});





app.post('/NewInvestor', (req, res) => {

    const InvestorID = generateSmallId('INV');
    const { InvestorName, StartDate, PhoneNumber, Image } = req.body;


    const sql = `INSERT INTO Investors (InvestorID, InvestorName,StartDate,AmountInvested, PhoneNumber, Image)
                 VALUES (?, ?, ?,0, ?,?)`;

    db.query(sql, [ InvestorID,InvestorName, StartDate, PhoneNumber, Image], (err, result) => {
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
    const ClientID = generateSmallId('CLI');
    const { ClientName,AddressAndOccupation, PhoneNumber, Aadhar, AadharCard, Pan, PanCard, Image, Comments} = req.body;


    const sql = `INSERT INTO Clients (
   ClientID, ClientName, TotalAmount, AddressAndOccupation, PhoneNumber, Aadhar, AadharCard, Pan, PanCard, Image, Comments)
                 VALUES (?, ?,0, ?, ?, ?, ?, ?, ?,?,?)`;

    // Execute the query, passing values from the request body
    db.query(sql, [ ClientID, ClientName,AddressAndOccupation, PhoneNumber, Aadhar, AadharCard, Pan, PanCard, Image, Comments], (err, result) => {
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

    const {LeadName,Amount,IssuedDate,Years,Months,Days} = req.body;

    const sql = `INSERT INTO Leads ( LeadName, Amount, IssuedDate, Duration)
                 VALUES (?,?,?,?)`;

Duration=Years*365+Months*30+Days;
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


app.post("/NewInvestment", (req, res) => {
    const InvestmentID = generateSmallId('INVE');
    const { Investor, Amount, InvestmentDate, InterestRate, Years = 0, Months = 0, Days = 0 } = req.body;

    // Calculate duration in days
    const Duration = Years * 365 + Months * 30 + Days;

    // Update Investor's total investment first
    const updateInvestorSql = `UPDATE Investors SET AmountInvested = AmountInvested + ? WHERE InvestorID = ?`;

    db.query(updateInvestorSql, [Amount, Investor], (updateErr, updateResult) => {
        if (updateErr) {
            console.error('Error updating AmountInvested:', updateErr);
            res.status(500).send('Error updating AmountInvested');
            return;
        }

        console.log('Investor AmountInvested updated');

        const insertInvestmentSql = `
            INSERT INTO Investments (InvestmentID, InvestorID, Amount, InvestmentDate, Duration, InterestRate)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(insertInvestmentSql, [InvestmentID, Investor, Amount, InvestmentDate, Duration, InterestRate], (insertErr, insertResult) => {
            if (insertErr) {
                console.error('Error inserting Investment:', insertErr);
                res.status(500).send('Error inserting Investment');
                return;
            }

            console.log('New Investment record inserted');
            res.send('New Investment Added Successfully');
        });
    });
});

app.post("/NewOrder", (req, res) => {
    const OrderID = generateSmallId('ORD');
    const { Client, Amount, InvestmentDate, InterestRate, Years = 0, Months = 0, Days = 0,RateOfInterest,StartDate,Documents } = req.body;
     
    const Duration = Years * 365 + Months * 30 + Days;

    // Update Investor's total investment first
    const updateInvestorSql = `UPDATE Clients SET TotalAmount = TotalAmount + ? WHERE ClientID = ?`;

    db.query(updateInvestorSql, [Amount, Client], (updateErr, updateResult) => {
        if (updateErr) {
            console.error('Error updating AmountInvested:', updateErr);
            res.status(500).send('Error updating AmountInvested');
            return;
        }

        console.log('Client Total Debt updated');

        const insertOrderSql = `
            INSERT INTO Orders (OrderID, ClientID, Amount, RateOfInterest, StartDate, Duration, Documents)
            VALUES (?, ?, ?, ?, ?, ?,?)
        `;

        db.query(insertOrderSql, [OrderID,Client, Amount, RateOfInterest, StartDate, Duration, Documents], (insertErr, insertResult) => {
            if (insertErr) {
                console.error('Error inserting Order:', insertErr);
                res.status(500).send('Error inserting Order');
                return;
            }

            console.log('New Order record inserted');
            res.send('New Order Added Successfully');
        });
    });
});



app.get("/InvestorsData", (req, res) => {
    db.query('SELECT * FROM Investors', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        res.json(results);
    });
});



app.get("/ClientsData",(req,res)=>{
    db.query('SELECT * FROM Clients', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        res.json(results);
    });
})


app.get("/LeadsData",(req,res)=>{
    db.query('SELECT * FROM Leads', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        res.json(results);
    });
})




app.get("/InvestorDetails/:ID", (req, res) => {
    const InvestorID = req.params.ID;
    db.query('SELECT * FROM Investors WHERE InvestorID = ?', [InvestorID], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Investor not found" });
        }

        res.status(200).json(results[0]); // Return the first matching result
    });
});

app.get("/ClientDetails/:ID", (req, res) => {
    const ClientID = req.params.ID;
    db.query('SELECT * FROM Clients WHERE ClientID = ?', [ClientID], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Investor not found" });
        }

        res.status(200).json(results[0]); // Return the first matching result
    });
});



app.get("/InvestmentDetails/:ID", (req, res) => {
    const InvestorID = req.params.ID;
    db.query('SELECT * FROM Investments WHERE InvestorID = ?', [InvestorID], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Investor not found" });
        }

        res.status(200).json(results); 
    });
});

app.get("/OrderDetails/:ID", (req, res) => {
    const ClientID = req.params.ID;
    db.query('SELECT * FROM Orders WHERE ClientID = ?', [ClientID], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Client not found" });
        }

        res.status(200).json(results); 
    });
});


app.get("/TodayInvestor", (req, res) => {
    // SQL query to check if today's date is exactly 1 month after the investment date
    const query = `
SELECT InvestorID, Amount 
FROM Investments 
WHERE DATE(InvestmentDate) = CURDATE() - INTERVAL 1 MONTH;
    `;
   
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching investor data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json(results);  // Send results if data found
    });
});

app.get("/TodayClient", (req, res) => {
    // SQL query to check if today's date is exactly 1 month after the start date
    const query = `
  SELECT ClientID, Amount 
FROM Orders 
WHERE DATE(StartDate) = CURDATE() - INTERVAL 1 MONTH;
    `;
   
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching client EMI data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

     
        res.status(200).json(results);  // Send results if data found
    });
});




app.listen(2001,()=>{

    console.log("SUCCESFUL")
}

)







// app.get("/InvestorData", (req, res) => {
//     db.query('SELECT * FROM Investors where InvestorId="INV-96885b"', (err, results) => {
//         if (err) {
//             console.error('Error fetching data:', err);
//             return res.status(500).json({ error: 'Error fetching data' });
//         }
//         res.json(results);
//     });
// });





// app.get("/ClientData", (req, res) => {
//     db.query('SELECT * FROM Clients', (err, results) => {
//         if (err) {
//             console.error('Error fetching data:', err);
//             return res.status(500).json({ error: 'Error fetching data' });
//         }
//         // ClientID, ClientName, TotalAmount, AddressAndOccupation, PhoneNumber, Aadhar, AadharCard, Pan, PanCard, Image, Comments
//         const clients = results.map(row => ({
//             ClientID: row.ClientID,
//             ClientName: row.ClientName,
//             TotalAmount: row.TotalAmount,
//             AddressAndOccupation: row.AddressAndOccupation,
//             PhoneNumber: row.PhoneNumber,
//             Aadhar: row.Aadhar,
//             AadharCard: row.AadharCard ? `data:image/jpeg;base64,${row.AadharCard.toString('base64')}` : null ,
//             Pan: row.Pan,
//             PanCard: row.PanCard ? `data:image/jpeg;base64,${row.PanCard.toString('base64')}` : null ,
//             Image: row.Image ? `data:image/jpeg;base64,${row.Image.toString('base64')}` : null ,
//             Comments: row.Comments,
//         }));

//         res.json(clients);
//     });
// });
