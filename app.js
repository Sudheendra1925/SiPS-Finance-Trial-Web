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


app.get('/InvestementHistory', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/InvestementHistory.html'));
});

app.get('/OrderHistory', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/OrderHistory.html'));
});

app.get('/UpdateInvestorPage/:ID', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/UpdateInvestor.html'));
});
app.get('/UpdateClientPage/:ID', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/UpdateClient.html'));
});

app.get('/UpdateInvestementPage/:ID', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/UpdateInvestement.html'));
});
app.get('/UpdateOrderPage/:ID', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/UpdateOrder.html'));
});






app.post('/NewInvestor', (req, res) => {

    const InvestorID = generateSmallId('INV');
    const { InvestorName,PhoneNumber} = req.body;


    const sql = `INSERT INTO Investors (InvestorID, InvestorName,AmountInvested, PhoneNumber)
                 VALUES (?, ?,0,?)`;

    db.query(sql, [ InvestorID,InvestorName, PhoneNumber], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.sendFile(path.join(__dirname, 'public/AddInvestement.html'));
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
        res.sendFile(path.join(__dirname, 'public/AddOrder.html'));
    });
});

app.post("/NewLead",(req,res)=>{

    const {LeadName,Amount,PhoneNumber,Years,Months,Days,Collateral} = req.body;
    const Duration=parseInt(Years)*365+parseInt(Months)*30+parseInt(Days);

    const sql = `INSERT INTO Leads ( LeadName, Amount,Duration,PhoneNumber,Collateral)
                 VALUES (?,?,?,?,?)`;


    // Execute the query, passing values from the request body
    db.query(sql, [ LeadName,Amount,Duration,PhoneNumber,Collateral], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.sendFile(path.join(__dirname, 'public/Leads.html'));
    });
})


app.post("/NewInvestment", (req, res) => {
    const InvestmentID = generateSmallId('INVE');
    const { Investor, Amount, InvestmentDate,PayableInterest, InterestRate} = req.body;

    // Calculate duration in days

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
            INSERT INTO Investments (InvestmentID, InvestorID, Amount,PayableInterest, InvestmentDate, InterestRate)
            VALUES (?, ?, ?,?, ?, ?)
        `;

        db.query(insertInvestmentSql, [InvestmentID, Investor, Amount,PayableInterest, InvestmentDate, InterestRate], (insertErr, insertResult) => {
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
    const { Client, Amount,PayableInterest, Years = 0, Months = 0, Days = 0,RateOfInterest,StartDate,Documents } = req.body;
     
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
            INSERT INTO Orders (OrderID, ClientID, Amount,PayableInterest, RateOfInterest, StartDate, Duration, Documents)
            VALUES (?, ?,?, ?, ?, ?, ?,?)
        `;

        db.query(insertOrderSql, [OrderID,Client, Amount,PayableInterest, RateOfInterest, StartDate, Duration, Documents], (insertErr, insertResult) => {
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

app.get("/OrdersDetails/:ID", (req, res) => {
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
SELECT InvestorID, Amount,PayableInterest
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
  SELECT ClientID, Amount,PayableInterest
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


app.get("/TotalInvestements", (req, res) => {
    // SQL query to check if today's date is exactly 1 month after the investment date
    const query = `SELECT sum(Amount) AS TotalInvestement FROM Investments`;
   
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching investor data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.status(200).json(results[0] || 0);  // Send results if data found
    });
});

app.get("/TotalLendings", (req, res) => {
    // SQL query to check if today's date is exactly 1 month after the investment date
    const query = `
SELECT sum(Amount) AS TotalLeanding FROM Orders`;
   
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching investor data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json(results[0] || 0);  // Send results if data found
    });
});


app.get("/InvestmentHistoryData", (req, res) => {
    // SQL query to check if today's date is exactly 1 month after the investment date
    const query = `
SELECT  InvestorID,Amount,InvestmentDate,InterestRate FROM Investments`;
   
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching investor data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json(results|| 0);  // Send results if data found
    });
});

app.get("/OrderHistoryData", (req, res) => {
    // SQL query to check if today's date is exactly 1 month after the investment date
    const query = `
SELECT  ClientID,Amount,StartDate,RateOfInterest,Documents FROM Orders`;
   
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching Order data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json(results|| 0);  // Send results if data found
    });
});




app.get("/ClosingClients", (req, res) => {
    
    const query = `
SELECT
    orderid,
    clientID,
    amount,PayableInterest,
    startdate
FROM
    Orders
    where 
    DATE_ADD(startdate, INTERVAL duration DAY)=curdate()`;
   
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching Order data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json(results|| 0);  // Send results if data found
    });
});


app.post('/UpdateInvestor', (req, res) => {
    const { InvestorID,InvestorName, AmountInvested, PhoneNumber } = req.body;
    console.log(InvestorID,InvestorName, AmountInvested, PhoneNumber);
    
    const updateQuery = `
        UPDATE Investors SET
            InvestorName = ?,
            AmountInvested = ?,
            PhoneNumber = ?
        WHERE InvestorID = ?
    `;

    db.query(updateQuery, [InvestorName, AmountInvested, PhoneNumber, InvestorID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating investor details');
        }
        res.json({ message: 'Investor details updated successfully' });
    });
});



app.post('/UpdateClient', (req, res) => {
    const { ClientID,ClientName, TotalAmount, PhoneNumber} = req.body;

    const query = `
        UPDATE Clients 
        SET ClientName = ?, TotalAmount = ?, PhoneNumber = ?
        WHERE ClientID = ?`;

    db.query(
        query,
        [ClientName,  TotalAmount, PhoneNumber, ClientID],
        (err, results) => {
            if(err){
                console.log(err)
                res.send("GONE WRONG");
            }
           else{
                res.status(200).json({ message: 'Client details updated successfully' });
            }
        }
    );
});



app.get('/InvestementDetails/:investmentID', (req, res) => {
    const investmentID = req.params.investmentID;
    const query = 'SELECT * FROM Investments WHERE InvestmentID = ?';
    
    db.execute(query, [investmentID], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch investment details' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Investment not found' });
        }
        res.json(results[0]);
    });
});

// Route to update investment details
app.post('/UpdateInvestement', (req, res) => {
   const{InvestementID,Amount,PayableInterest,InterestRate}=req.body;

    const query = `
        UPDATE Investments SET
         Amount = ?, PayableInterest = ?, InterestRate = ?
        WHERE InvestmentID = ?`;

        db.query(
            query,
            [Amount,PayableInterest,InterestRate,InvestementID],
            (err, results) => {
                if(err){
                    console.log(err)
                    res.send("GONE WRONG");
                }
               else{
                    res.status(200).json({ message: 'Investement details updated successfully' });
                }
            }
        );
    });



    app.get('/OrderDetails/:orderID', (req, res) => {
        const orderID = req.params.orderID;
        const query = 'SELECT * FROM Orders WHERE OrderID = ?';
        
        db.query(query, [orderID], (err, results) => {
            if (err) {
                console.error('Error fetching order:', err);
                return res.status(500).json({ message: 'Error fetching order details' });
            }
    
            if (results.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            // Send the order data as JSON
            res.json(results[0]);
        });
    });
    
    
    app.post('/UpdateOrder', (req, res) => {
        const {OrderID,Amount,PayableInterest,RateOfInterest } = req.body;
        
        const query = `
            UPDATE Orders
            SET Amount = ?,PayableInterest=?, RateOfInterest = ?
            WHERE OrderID = ?
        `;
    
        db.query(query, [Amount,PayableInterest,RateOfInterest, OrderID], (err, results) => {
            if (err) {
                console.error('Error updating order:', err);
                return res.status(500).json({ message: 'Error updating order' });
            }
    
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            res.json({ message: 'Order updated successfully' });
        });
    });
    

app.get ('/RejectLead/:LeadName',(req,res)=>{
    
const LeadName = req.params.LeadName;

    const query = `
   DELETE  FROM Leads WHERE LeadName=? ;
`;

db.query(query, [LeadName], (err, results) => {
    if (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ message: 'Error updating order' });
    }

    if (results.affectedRows === 0) {
        return res.send("WHYYy");
    }

    res.json({ message: 'Deleted successfully' });
});
})






app.get('/DeleteInvestor/:ID', (req, res) => {
    
    const InvestorID = req.params.ID;

    const query = `
   DELETE  FROM Investors WHERE InvestorID=? ;
`;

db.query(query, [InvestorID], (err, results) => {
    if (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ message: 'Error updating order' });
    }

    if (results.affectedRows === 0) {
        return res.send("WHYYy");
    }

    res.json({ message: 'Deleted successfully' });
});
});

app.get('/DeleteClient/:ID', (req, res) => {
    const ClientID = req.params.ID;

    const query = `
   DELETE  FROM Clients WHERE ClientID=? ;
`;

db.query(query, [ClientID], (err, results) => {
    if (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ message: 'Error updating order' });
    }

    if (results.affectedRows === 0) {
        return res.send("WHYYy");
    }

    res.json({ message: 'Deleted successfully' });
});
});

app.get('/DeleteInvestement/:ID', (req, res) => {
    const InvestementID = req.params.ID;

    const query = `
   DELETE  FROM Investments WHERE InvestmentID=? ;
`;

db.query(query, [InvestementID], (err, results) => {
    if (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ message: 'Error updating order' });
    }

    if (results.affectedRows === 0) {
        return res.send("WHYYy");
    }

    res.json({ message: 'Deleted successfully' });
});
});

app.get('/DeleteOrder/:ID', (req, res) => {
    const OrderID = req.params.ID;

    const query = `
   DELETE  FROM Orders WHERE OrderID=? ;
`;

db.query(query, [OrderID], (err, results) => {
    if (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ message: 'Error updating order' });
    }

    if (results.affectedRows === 0) {
        return res.send("WHYYy");
    }

    res.json({ message: 'Deleted successfully' });
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
