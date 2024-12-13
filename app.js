
//Declarations  
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const crypto = require('crypto');
const cors = require('cors');
const bcrypt = require('bcrypt'); 

/////////////////////////////Use////
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//////generate ID function ////////////////
const generateSmallId = (prefix) => {
    const id = crypto.randomBytes(3).toString('hex'); // Generates a 6-character hex string
    return `${prefix}-${id}`;
  };


 /////////DB connections///////////////////////////////
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
////////////// PAGE DECLARATIONS////////////////////////////////////
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

app.get('/Queue', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Queue.html'));
});


app.get('/AddInvestor', (req, res) => {
    
    res.sendFile(path.join(__dirname, 'public/AddInvestor.html'));
});

app.get('/AddClient', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddClient.html'));
});

app.get('/AddClientLead', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddClientLead.html'));
});

app.get('/AddInvestorLead', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddInvestorLead.html'));
});
app.get('/AddInvestment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddInvestment.html'));
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


app.get('/InvestmentHistory', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/InvestmentHistory.html'));
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

app.get('/UpdateInvestmentPage/:ID', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/UpdateInvestment.html'));
});
app.get('/UpdateOrderPage/:ID', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/UpdateOrder.html'));
});

app.get('/Company', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Company.html'));
});

app.get('/ClientEMIPage/:OrderID', (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/ClientEMIPage.html'));
});
app.get('/InvestmentEMIHistoryPage/:InvestmentID', (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/InvestmentEMIHistoryPage.html'));
});
app.get('/OrderEMIHistoryPage/:OrderID', (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/OrderEMIHistoryPage.html'));
});

app.get('/TotalInvestmentEMIHistoryPage', (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/TotalInvestmentEMIHistoryPage.html'));
});
app.get('/TotalOrderEMIHistoryPage', (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/TotalOrderEMIHistoryPage.html'));
});

app.get('/DueEMIPage', (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/DueEMIPage.html'));
});
app.get('/ChangeDueEMI/:OrderID', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ChangeDueEMI.html'));
});
app.get('/AddExtraExpensesPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddExtraExpensesPage.html'));
});
app.get('/AddExtraIncomesPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddExtraIncomesPage.html'));
});
app.get('/ExtraExpensesHistoryPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ExtraExpensesHistoryPage.html'));
});
app.get('/ExtraIncomesHistoryPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ExtraIncomesHistoryPage.html'));
});
app.get('/ClosedInvestmentsPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ClosedInvestmentsPage.html'));
});
app.get('/ClosedOrdersPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ClosedOrdersPage.html'));
});
app.get('/ForgetPasswordPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ForgetPasswordPage.html'));
});

app.get('/LoanRequestPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/LoanRequestPage.html'));
});

///////////////////////////////  ADDING INVESTOR CLIENTS LEADS 

app.post('/NewInvestor', (req, res) => {

    const InvestorID = generateSmallId('INV');
    const { InvestorName,PhoneNumber} = req.body;


    const sql = `INSERT INTO Investors (InvestorID, InvestorName,StartDate,AmountInvested, PhoneNumber)
                 VALUES (?, ?, curdate() + interval 1 day,0,?)`;

    db.query(sql, [ InvestorID,InvestorName, PhoneNumber], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.redirect('/AddInvestment')
    });
})



/////////////////////////////// CLIENT CODES 

///////////////////////////////

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
        res.redirect('/AddOrder')})
    });

app.post("/NewClientLead",(req,res)=>{

    const {ClientName,Amount,PhoneNumber,Years,Months,Days,Collateral} = req.body;
    const Duration=parseInt(Years)*365+parseInt(Months)*30+parseInt(Days);

    const sql = `INSERT INTO ClientLead ( ClientName, Amount,Duration,PhoneNumber,Collateral)
                 VALUES (?,?,?,?,?)`;


    // Execute the query, passing values from the request body
    db.query(sql, [ ClientName,Amount,Duration,PhoneNumber,Collateral], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.redirect('/Queue');
    });
})
app.post("/NewInvestorLead",(req,res)=>{

    const {InvestorName,Amount,PhoneNumber} = req.body;

    const sql = `INSERT INTO InvestorLead ( InvestorName, Amount,PhoneNumber)
                 VALUES (?,?,?)`;


    // Execute the query, passing values from the request body
    db.query(sql, [ InvestorName,Amount,PhoneNumber], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.redirect('/Queue');
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
            INSERT INTO Investments (InvestmentID, InvestorID, Amount,ActiveAmount,PayableInterest, InvestmentDate, InterestRate)
            VALUES (?, ?, ?,?,?, ?, ?)
        `;

        db.query(insertInvestmentSql, [InvestmentID, Investor, Amount,Amount,PayableInterest, InvestmentDate, InterestRate], (insertErr, insertResult) => {
            if (insertErr) {
                console.error('Error inserting Investment:', insertErr);
                res.status(500).send('Error inserting Investment');
                return;
            }

            console.log('New Investment record inserted');

            res.redirect('/Home');
        });
    });
});

app.post("/NewOrder", (req, res) => {
    const OrderID = generateSmallId('ORD');
    const { Client, Amount, PayableInterest, Years = 0, Months = 0, Days = 0, RateOfInterest, StartDate, Documents } = req.body;

    const Duration = parseInt(Years * 365) + parseInt(Months * 30) + parseInt(Days);
    // Calculate the EndDate
    const startDateObj = new Date(StartDate).toISOString().split('T')[0]; // Ensure StartDate is a valid date string or format
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + Duration); // Add duration in days
    const EndDate = endDateObj.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
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
            INSERT INTO Orders (OrderID, ClientID, Amount,ActiveAmount, PayableInterest, RateOfInterest, StartDate, EndDate, Documents)
            VALUES (?, ?, ?,?, ?, ?, ?,?, ?)
        `;

        db.query(insertOrderSql, [OrderID, Client, Amount,Amount, PayableInterest, RateOfInterest, StartDate,EndDate, Documents], (insertErr, insertResult) => {
            if (insertErr) {
                console.error('Error inserting Order:', insertErr);
                res.status(500).send('Error inserting Order');
                return;
            }

            console.log('New Order record inserted');
            res.redirect('/Home');
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


app.get("/ClientLeadData",(req,res)=>{
    db.query('SELECT * FROM ClientLead', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        res.json(results);
    });
})

app.get("/InvestorLeadData",(req,res)=>{
    db.query('SELECT * FROM InvestorLead', (err, results) => {
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



app.get("/InvestmentsDetails/:ID", (req, res) => {
    const InvestorID = req.params.ID;
    db.query('SELECT * FROM Investments WHERE InvestorID = ?', [InvestorID], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Investments not found" });
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
SELECT InvestmentID,InvestorID, ActiveAmount,PayableInterest
FROM Investments 
WHERE DAY(InvestmentDate) = DAY( curdate() + interval 1 day);
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
SELECT OrderID,ClientID, ActiveAmount, PayableInterest,StartDate
FROM Orders
WHERE DAY(StartDate) = DAY( curdate() + interval 1 day);
    `;
   
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching client EMI data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

     
        res.status(200).json(results);  // Send results if data found
    });
});


app.get("/TotalInvestments", (req, res) => {
    // SQL query to check if today's date is exactly 1 month after the investment date
    const query = `SELECT sum(Amount) AS TotalInvestment,sum(ActiveAmount) as ActiveAmount FROM Investments`;
   
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
SELECT sum(Amount) AS TotalLeanding,sum(ActiveAmount) as ActiveAmount FROM Orders`;
   
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
SELECT  * FROM Orders`;
   
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
    amount,
    ActiveAmount,
    PayableInterest,
    Startdate,
    EndDate
FROM
    Orders
WHERE 
    MONTH(EndDate) = MONTH( curdate() + interval 1 day) 
    AND YEAR(EndDate) = YEAR( curdate() + interval 1 day);

`
   
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
        res.redirect('/Investors');
    });
});



app.post('/UpdateClient', (req, res) => {
    const { ClientID,ClientName, TotalAmount, PhoneNumber,Comments} = req.body;

    const query = `
        UPDATE Clients 
        SET ClientName = ?, TotalAmount = ?, PhoneNumber = ?,Comments=?
        WHERE ClientID = ?`;

    db.query(
        query,
        [ClientName,  TotalAmount, PhoneNumber,Comments, ClientID],
        (err, results) => {
            if(err){
                console.log(err)
                res.send("GONE WRONG");
            }
           else{
            res.redirect('/Clients');
            }
        }
    );
});




// Route to update investment details
app.post('/UpdateInvestment', (req, res) => {
   const{InvestmentID,ActiveAmount,PayableInterest,InterestRate}=req.body;

    const query = `
        UPDATE Investments SET
         ActiveAmount = ?, PayableInterest = ?, InterestRate = ?
        WHERE InvestmentID = ?`;

        db.query(
            query,
            [ActiveAmount,PayableInterest,InterestRate,InvestmentID],
            (err, results) => {
                if(err){
                    console.log(err)
                    res.send("GONE WRONG");
                }
               else{
                res.redirect('/Investors');
                }
            }
        );
    });
    app.get('/InvestmentDetails/:investmentID', (req, res) => {
        const investmentID = req.params.investmentID;
        const query = 'SELECT * FROM investments WHERE investmentID = ?';
        
        db.query(query, [investmentID], (err, results) => {
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
        const {OrderID,ActiveAmount,PayableInterest,RateOfInterest } = req.body;
        
        const query = `
            UPDATE Orders
            SET ActiveAmount = ?,PayableInterest=?, RateOfInterest = ?
            WHERE OrderID = ?
        `;
    
        db.query(query, [ActiveAmount,PayableInterest,RateOfInterest, OrderID], (err, results) => {
            if (err) {
                console.error('Error updating order:', err);
                return res.status(500).json({ message: 'Error updating order' });
            }
    
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            res.redirect('/Clients');
        });
    });
    

app.get ('/RejectClientLead/:ClientName',(req,res)=>{
    
const ClientName = req.params.ClientName;
const {Amount}=req.query;
console.log(ClientName,Amount)
    const query = `
    DELETE FROM ClientLead WHERE ClientName = ? AND Amount = ?;
`;

db.query(query, [ClientName,Amount], (err, results) => {
    if (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ message: 'Error updating order' });
    }

    res.redirect('/Queue');
});
})

app.get ('/RejectInvestorLead/:InvestorName',(req,res)=>{
    
    const InvestorName = req.params.InvestorName;
    const {Amount}=req.query;
        const query = `
       DELETE  FROM InvestorLead WHERE InvestorName=? And Amount=? ;
    `;
    
    db.query(query, [InvestorName,Amount], (err, results) => {
        if (err) {
            console.error('Error updating order:', err);
            return res.status(500).json({ message: 'Error updating order' });
        }
    
    
        res.redirect('/Queue');
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


    res.redirect('/Investors');
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

    res.redirect('/Clients');
});
});

app.get('/DeleteInvestment/:InvestmentID', (req, res) => {
    const { InvestmentID } = req.params;
    var { InvestorName, Amount, InvestmentDate } = req.query;


    InvestmentDate=InvestmentDate.split('T')[0]
    // SQL queries
    const deleteQuery = `DELETE FROM Investments WHERE InvestmentID = ?`;
    const insertQuery = `
        INSERT INTO ClosedInvestments (InvestmentID, InvestorName, Amount, StartDate, ClosedDate)
        VALUES (?, ?, ?, ?,  curdate() + interval 1 day)
    `;

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error('Transaction Error:', err);
            return res.status(500).send('Transaction failed.');
        }

        // Insert into ClosedInvestment table
        db.query(
            insertQuery,
            [InvestmentID, InvestorName, Amount, InvestmentDate],
            (insertErr, insertResult) => {
                if (insertErr) {
                    return db.rollback(() => {
                        console.error('Insert Error:', insertErr);
                        res.status(500).send('Failed to insert into ClosedInvestment.');
                    });
                }

                // Delete from InvestmentTable
                db.query(deleteQuery, [InvestmentID], (deleteErr, deleteResult) => {
                    if (deleteErr) {
                        return db.rollback(() => {
                            console.error('Delete Error:', deleteErr);
                            res.status(500).send('Failed to delete from InvestmentTable.');
                        });
                    }

                    // Commit the transaction
                    db.commit((commitErr) => {
                        if (commitErr) {
                            return db.rollback(() => {
                                console.error('Commit Error:', commitErr);
                                res.status(500).send('Transaction commit failed.');
                            });
                        }

                        console.log('Investment deleted and moved to ClosedInvestment successfully.');
                        res.redirect('/Home');
                    });
                });
            }
        );
    });
});
app.get('/DeleteOrder/:OrderID', (req, res) => {
    const { OrderID } = req.params; // Extract OrderID from URL params
    const { ClientName, Amount, StartDate } = req.query; // Extract query parameters

    // Validate inputs
    if (!OrderID || !ClientName || !Amount || !StartDate) {
        return res.status(400).send('Missing required parameters.');
    }

    // SQL queries
    const deleteQuery = `DELETE FROM Orders WHERE OrderID = ?`;
    const insertQuery = `
        INSERT INTO ClosedOrders (OrderID, ClientName, Amount, StartDate, ClosedDate)
        VALUES (?, ?, ?, ?,  curdate() + interval 1 day)
    `;
    const checkDuplicateQuery = `SELECT 1 FROM ClosedOrders WHERE OrderID = ?`;

    db.beginTransaction((err) => {
        if (err) {
            console.error('Transaction Error:', err);
            return res.status(500).send('Transaction initialization failed.');
        }

        // Step 1: Check for duplicate entry in ClosedOrders
        db.query(checkDuplicateQuery, [OrderID], (checkErr, results) => {
            if (checkErr) {
                return db.rollback(() => {
                    console.error('Duplicate Check Error:', checkErr);
                    res.status(500).send('Failed to verify duplicate entry.');
                });
            }

            if (results.length > 0) {
                return db.rollback(() => {
                    console.warn(`Duplicate entry detected for OrderID: ${OrderID}`);
                    res.status(400).send('Order has already been closed.');
                });
            }

            // Step 2: Insert into ClosedOrders
            db.query(
                insertQuery,
                [OrderID, ClientName, Amount, StartDate],
                (insertErr, insertResult) => {
                    if (insertErr) {
                        return db.rollback(() => {
                            console.error('Insert Error:', insertErr);
                            res.status(500).send('Failed to insert into ClosedOrders.');
                        });
                    }

                    // Step 3: Delete from Orders
                    db.query(deleteQuery, [OrderID], (deleteErr, deleteResult) => {
                        if (deleteErr) {
                            return db.rollback(() => {
                                console.error('Delete Error:', deleteErr);
                                res.status(500).send('Failed to delete from Orders.');
                            });
                        }

                        // Step 4: Commit the transaction
                        db.commit((commitErr) => {
                            if (commitErr) {
                                return db.rollback(() => {
                                    console.error('Commit Error:', commitErr);
                                    res.status(500).send('Transaction commit failed.');
                                });
                            }

                            console.log(
                                `Order ${OrderID} moved to ClosedOrders and deleted from Orders successfully.`
                            );
                            res.redirect('/Clients');
                        });
                    });
                }
            );
        });
    });
});

app.get("/InvestorEMIPay/:investmentID", (req, res) => {
    const InvestmentID = req.params.investmentID;
    const PayableInterest = parseFloat(req.query.PayableInterest);
const InvestorName=req.query.InvestorName
    // Validate parameters
    if (!InvestmentID || isNaN(PayableInterest)) {
        console.error("Invalid parameters");
        return res.status(400).json({ error: "Invalid InvestmentID or PayableInterest" });
    }

    // SQL query to insert data
    const query = `
        INSERT INTO InvestmentEMIHistory (InvestmentID,InvestorName, EMIDate, PaidEMI)
        VALUES (?,?,  curdate() + interval 1 day, ?)
    `;

    // Execute query
    db.query(query, [InvestmentID,InvestorName, PayableInterest], (err, result) => {
        if (err) {
            console.error("Error inserting data into InvestorEMIHistory:", err);
            return res.status(500).json({ error: "Error processing EMI payment" });
        }

        console.log("EMI payment recorded successfully:", result);
        res.redirect('/Investors');
    });
});


app.post("/ClientEMIPayement", (req, res) => {

    const{OrderID,ActualEMI,PaidEMI,ClientName}=req.body;
    // Query to insert data into InvestorEMIHistory with only the current date
    const query = `
        INSERT INTO OrderEMIHistory (OrderID,ClientName,EMIDate,ActualEMI,PaidEMI)
        VALUES (?,?, curdate() + interval 1 day,?,?)
    `;

    db.query(query, [OrderID,ClientName, ActualEMI,PaidEMI], (err, result) => {
        if (err) {
            console.error("Error inserting data into InvestorEMIHistory:", err);
            res.status(500).send("Error processing EMI payment");
        } else {
            console.log("EMI payment recorded successfully:", result);
            res.redirect('/Clients')
        }
    });
});

app.get('/getInvestmentData', (req, res) => {
    const query = `SELECT InvestorID, CAST(SUM(ActiveAmount) AS SIGNED) AS TotalInvestment
    FROM investments
    GROUP BY InvestorID;`

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch investment data' });
        }
console.log(results)
        res.status(200).json(results);
    });
});

app.get('/getOrderData', (req, res) => {
    const query = `SELECT ClientID, CAST(SUM(ActiveAmount) AS SIGNED) AS TotalOrder
    FROM Orders
    GROUP BY ClientID;`

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch investment data' });
        }
console.log(results)
        res.status(200).json(results);
    });
});



app.get('/InvestmentEMIHistoryData/:ID',(req,res)=>{
const id=req.params.ID;
    const query = `SELECT * FROM InvestmentEMIHistory where InvestmentId=?;`

    db.query(query,[id] ,(err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch investment data' });
        }
console.log(results)
        res.status(200).json(results);
    });

})


app.get('/OrderEMIHistoryData/:ID',(req,res)=>{
    const id=req.params.ID;
        const query = `SELECT * FROM OrderEMIHistory where OrderId=?;`
    
        db.query(query,[id] ,(err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch investment data' });
            }
    console.log(results)
            res.status(200).json(results);
        });
    
    })

    app.get('/TotalInvestmentEMIHistory',(req,res)=>{
        
            const query = `select * from InvestmentEMIHistory`
        
            db.query(query ,(err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to fetch investment data' });
                }
        console.log(results)
                res.status(200).json(results);
            });
        
        })
    
        app.get('/TotalOrderEMIHistory', async (req, res) => {
            try {
                // SQL Query to join Orders and Clients to get ClientName
                const query = `
                select * from OrderEMIHistory
                `;
                
                const [orderEMIHistory] = await db.promise().query(query);
                
                res.json(orderEMIHistory); // Return data with ClientName
            } catch (error) {
                console.error('Error fetching order EMI history:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
        



    app.get("/TotalCompanyAccount", async (req, res) => {
        try {
          // SQL Queries
          const investmentsSumQuery = "SELECT SUM(ActiveAmount) AS total FROM Investments";
          const clientEmiSumQuery = "SELECT SUM(PaidEMI) AS total FROM OrderEMIHistory";
          const ordersSumQuery = "SELECT SUM(ActiveAmount) AS total FROM Orders";
          const investorEmiSumQuery = "SELECT SUM(PaidEMI) AS total FROM InvestmentEMIHistory";
          const ExtraExpenses = "SELECT SUM(CAST(Amount AS DECIMAL(20, 0))) AS total FROM ExtraExpenses";
          const ExtraIncomes = "SELECT SUM(CAST(Amount AS DECIMAL(20, 0))) AS total FROM ExtraIncomes";
          
          // Execute Queries
          const [investmentsSum] = await db.promise().query(investmentsSumQuery);
          const [clientEmiSum] = await db.promise().query(clientEmiSumQuery);
          const [ordersSum] = await db.promise().query(ordersSumQuery);
          const [investorEmiSum] = await db.promise().query(investorEmiSumQuery);
          const [ExtraExpensesSum] = await db.promise().query(ExtraExpenses);
          const [ExtraIncomesSum] = await db.promise().query(ExtraIncomes);
          // Extract Results
          const totalInvestments = parseInt(investmentsSum[0].total) || 0;
          const totalClientEmi = parseInt(clientEmiSum[0].total) || 0;
          const totalOrders = parseInt(ordersSum[0].total) || 0;
          const totalInvestorEmi = parseInt(investorEmiSum[0].total) || 0;
            const totalExtraExpenses=parseInt(ExtraExpensesSum[0].total) || 0;
            const totalExtraIncomes=parseInt(ExtraIncomesSum[0].total) || 0;
            console.log(totalExtraIncomes)
            console.log(totalExtraExpenses)
          // Perform Calculation
          const totalSum = (totalInvestments + totalClientEmi+totalExtraIncomes) - (totalOrders + totalInvestorEmi+totalExtraExpenses);
      
          // Send Response
          res.json({
            status: "success",
            totalSum: totalSum,
            breakdown: {
              totalInvestments,
              totalClientEmi,
              totalOrders,
              totalInvestorEmi,
              totalExtraExpenses,
              totalExtraIncomes
            }
          });
        } catch (error) {
          console.error("Error in calculation:", error);
          res.status(500).json({ status: "error", message: "Internal Server Error" });
        }
      });
      

// Start the server





app.get("/AddDueEMI/:ID", (req, res) => {
    const OrderID=req.params.ID
    const{ClientName,ActiveAmount,EMIDate,EMIAmount}=req.query;
   
    // Query to insert data into InvestorEMIHistory with only the current date
    const query = `
        INSERT INTO DueEMI (OrderID,IssuedDate,ClientName,OrderAmount,EMIDate,EMIAmount,RemainingEMI)
        VALUES (?, curdate() + interval 1 day,?,?,?,?,?)
    `;

    db.query(query, [OrderID,ClientName,ActiveAmount,EMIDate,EMIAmount,EMIAmount], (err, result) => {
        if (err) {
            console.error("Error inserting data into InvestorEMIHistory:", err);
            res.status(500).send("We Have Already Added It in Pending");
        } else {
            console.log("EMI payment recorded successfully:", result);
            res.redirect('/Clients')
        }
    });
});

app.get('/DueEMIs', async (req, res) => {
    try {
        // SQL Query to join Orders and Clients to get ClientName
        const query = `select * from DueEMI`;
        
        const [DueEMIHistory] = await db.promise().query(query);
        
        res.json(DueEMIHistory); // Return data with ClientName
    } catch (error) {
        console.error('Error fetching order EMI history:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/UpdateDueEMI', async (req, res) => {
    const { OrderID, DueEMI, PaidEMI } = req.body; // Assuming the data is passed in the body
    let RemainingEMI=DueEMI-PaidEMI;
    if (!OrderID || !DueEMI || !PaidEMI) {
        return res.status(400).json({ message: 'Missing required parameters: OrderID, EMIAmount, oldEMIAmount' });
    }

    try {
        // SQL Query to update the EMIAmount for the given OrderID and old EMIAmount
        const query = `UPDATE DueEMI SET RemainingEMI = ? WHERE OrderID = ? AND RemainingEMI = ?`;

        // Execute the query with the parameters passed
        const [result] = await db.promise().query(query, [RemainingEMI, OrderID, DueEMI]);
        // Send a success response with the result
        res.redirect('/DueEMIPage')
    } catch (error) {
        console.error('Error updating EMIAmount:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



app.get('/DeleteDueEMI/:OrderID', async (req, res) => {
   // Insert EMI Payment into OrderEMIHistory
const { OrderID } = req.params;
const { ClientName, EMIAmount, RemainingEMI } = req.query;

if (!EMIAmount || !RemainingEMI) {
    return res.status(400).json({ message: 'EMIAmount and RemainingEMI are required' });
}

// Ensure EMIAmount and RemainingEMI are valid numbers
const EMIAmountFloat = parseFloat(EMIAmount);
const RemainingEMIFloat = parseFloat(RemainingEMI);

if (isNaN(EMIAmountFloat) || isNaN(RemainingEMIFloat)) {
    return res.status(400).json({ message: 'EMIAmount and RemainingEMI must be valid numbers' });
}

const PaidEMI = EMIAmountFloat - RemainingEMIFloat;

const Insertquery = `
    INSERT INTO OrderEMIHistory (OrderID, ClientName, EMIDate, ActualEMI, PaidEMI)
    VALUES (?, ?,  curdate() + interval 1 day, ?, ?)
`;

db.query(Insertquery, [OrderID, ClientName, EMIAmountFloat, PaidEMI], (err, result) => {
    if (err) {
        console.error("Error inserting data into OrderEMIHistory:", err);
        return res.status(500).send("Error processing EMI payment");
    } else {
        console.log("EMI payment recorded successfully:", result);
    }
});

// Delete EMI Record and Insert into OrderEMIHistory
if (!EMIAmount) {
    return res.status(400).json({ message: 'EMIAmount is required to delete the record' });
}

try {
    // SQL Query to delete the record from DueEMI for the given OrderID and EMIAmount
    const deleteQuery = `DELETE FROM DueEMI WHERE OrderID = ? AND EMIAmount = ?`;

    // Execute the query with the parameters passed
    const [deleteResult] = await db.promise().query(deleteQuery, [OrderID, EMIAmount]);

    // Check if the record was deleted successfully
    if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: 'No record found to delete' });
    }

    res.redirect('/DueEMIPage');
} catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
}

});


app.post('/AddExtraExpenses', (req, res) => {
    const {Reason,Amount}=req.body;
    const sql = `INSERT INTO ExtraExpenses (Reason,Amount,Date)
                 VALUES (?, ?, curdate() + interval 1 day)`;

    db.query(sql, [Reason,Amount], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.redirect('/Company');
    });
});

app.post('/AddExtraIncomes', (req, res) => {
    const {Reason,Amount}=req.body;
    const sql = `INSERT INTO ExtraIncomes (Reason,Amount,Date)
                 VALUES (?, ?, curdate() + interval 1 day)`;

    db.query(sql, [Reason,Amount], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.redirect('/Company');
    });
});

app.get('/ExtraExpensesHistory', async (req, res) => {
    try {
        // SQL Query to join Orders and Clients to get ClientName
        const query = `select * from ExtraExpenses`;
        
        const [ExtraExpensesHistory] = await db.promise().query(query);
        
        res.json(ExtraExpensesHistory); // Return data with ClientName
    } catch (error) {
        console.error('Error fetching order EMI history:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/ExtraIncomesHistory', async (req, res) => {
    try {
        // SQL Query to join Orders and Clients to get ClientName
        const query = `select * from ExtraIncomes`;
        
        const [ExtraIncomesHistory] = await db.promise().query(query);
        
        res.json(ExtraIncomesHistory); 
    } catch (error) {
        console.error('Error fetching order EMI history:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





app.get('/ClosedInvestments', async (req, res) => {
    try {
        // SQL Query to join Orders and Clients to get ClientName
        const query = `select * from ClosedInvestments`;
        
        const [ClosedInvestments] = await db.promise().query(query);
        
        res.json(ClosedInvestments); // Return data with ClientName
    } catch (error) {
        console.error('Error fetching Closed Investments:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/ClosedOrders', async (req, res) => {
    try {
        // SQL Query to join Orders and Clients to get ClientName
        const query = `select * from ClosedOrders`;
        
        const [ClosedOrders] = await db.promise().query(query);
        
        res.json(ClosedOrders); // Return data with ClientName
    } catch (error) {
        console.error('Error fetching Closed order :', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/UserData', async (req, res) => {
    try {
        // SQL Query to join Orders and Clients to get ClientName
        const query = `select * from Users`;
        
        const [Users] = await db.promise().query(query);
        
        res.json(Users); // Return data with ClientName
    } catch (error) {
        console.error('Error fetching order EMI history:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




app.get('/signup',(req,res)=>{


    const {UserName,PhoneNumber,Password}=req.query;
    const sql = `INSERT INTO Users (UserName,Password,PhoneNumber,Access)
                 VALUES (?, ?,?,1)`;

    db.query(sql, [UserName,Password,PhoneNumber,], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.redirect('/')
    });
})
  

app.get('/login',(req,res)=>{

res.redirect('/home')

})

app.get('/ForgetPassword',(req,res)=>{

    
    
    })



    ///////////////////////////////CLIENT LOAN AN CLIENT SIDE/////////////////////
app.post("/SubmitLoanRequest",(req,res)=>{
    const {ClientName,Amount,PhoneNumber,Years,Months,Days,Collateral} = req.body;
    const Duration=parseInt(Years)*365+parseInt(Months)*30+parseInt(Days);

    const sql = `INSERT INTO ClientLead ( ClientName, Amount,Duration,PhoneNumber,Collateral)
                 VALUES (?,?,?,?,?)`;


    // Execute the query, passing values from the request body
    db.query(sql, [ ClientName,Amount,Duration,PhoneNumber,Collateral], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.sendFile(path.join(__dirname, 'public/ClientThankyouPage.html'));
    });


})
  

app.listen(2001,()=>{

    console.log("SUCCESFUL")
})





