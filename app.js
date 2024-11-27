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

app.get('/Company', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Company.html'));
});

app.get('/ClientEMIPage/:OrderID', (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/ClientEMIPage.html'));
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
        res.sendFile(path.join(__dirname, 'public/Clients.html'));
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

            res.sendFile(path.join(__dirname, 'public/Home.html'));
        });
    });
});

app.post("/NewOrder", (req, res) => {
    const OrderID = generateSmallId('ORD');
    const { Client, Amount, PayableInterest, Years = 0, Months = 0, Days = 0, RateOfInterest, StartDate, Documents } = req.body;

    const Duration = parseInt(Years * 365) + parseInt(Months * 30) + parseInt(Days);
    console.log(Duration)
    // Calculate the EndDate
    const startDateObj = new Date(StartDate).toISOString().split('T')[0]; // Ensure StartDate is a valid date string or format
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + Duration); // Add duration in days
    const EndDate = endDateObj.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
console.log(EndDate)
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
            INSERT INTO Orders (OrderID, ClientID, Amount, PayableInterest, RateOfInterest, StartDate, EndDate, Documents)
            VALUES (?, ?, ?, ?, ?, ?,?, ?)
        `;

        db.query(insertOrderSql, [OrderID, Client, Amount, PayableInterest, RateOfInterest, StartDate,EndDate, Documents], (insertErr, insertResult) => {
            if (insertErr) {
                console.error('Error inserting Order:', insertErr);
                res.status(500).send('Error inserting Order');
                return;
            }

            console.log('New Order record inserted');
            res.sendFile(path.join(__dirname, 'public/Home.html'));
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
SELECT InvestmentID,InvestorID, Amount,PayableInterest
FROM Investments 
WHERE DAY(InvestmentDate) = DAY(CURDATE());
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
SELECT OrderID,ClientID, Amount, PayableInterest
FROM Orders
WHERE DAY(StartDate) = DAY(CURDATE());
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
    amount,
    PayableInterest,
    startdate
FROM
    Orders
WHERE 
    EndDate = CURDATE();
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
        res.sendFile(path.join(__dirname, 'public/Investors.html'));
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
            res.sendFile(path.join(__dirname, 'public/Clients.html'));
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
                res.sendFile(path.join(__dirname, 'public/Investors.html'));
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
    
            res.sendFile(path.join(__dirname, 'public/Clients.html'));
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

    res.sendFile(path.join(__dirname, 'public/Leads.html'));
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

    res.sendFile(path.join(__dirname, 'public/Investors.html'));
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

    res.sendFile(path.join(__dirname, 'public/Clients.html'));
});
});

app.get('/DeleteInvestement/:InvestmentID', (req, res) => {
    const { InvestmentID } = req.params;
    var { InvestorName, Amount, StartDate } = req.query;


    StartDate=StartDate.split('T')[0]
    // SQL queries
    const deleteQuery = `DELETE FROM Investments WHERE InvestmentID = ?`;
    const insertQuery = `
        INSERT INTO ClosedInvestments (InvestmentID, InvestorName, Amount, StartDate, ClosedDate)
        VALUES (?, ?, ?, ?, CURDATE())
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
            [InvestmentID, InvestorName, Amount, StartDate],
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
                        res.send('Investment closed successfully.');
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
        VALUES (?, ?, ?, ?, CURDATE())
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
                            res.sendFile(path.join(__dirname, 'public/Clients.html'));
                        });
                    });
                }
            );
        });
    });
});

app.get("/InvestorEMIPay/:investmentID", (req, res) => {
    const InvestmentID = req.params.investmentID;
    const payableInterest = parseFloat(req.query.payableInterest);

    // Validate parameters
    if (!InvestmentID || isNaN(payableInterest)) {
        console.error("Invalid parameters");
        return res.status(400).json({ error: "Invalid InvestmentID or PayableInterest" });
    }

    // SQL query to insert data
    const query = `
        INSERT INTO InvestorEMIHistory (InvestmentID, EMIDate, PaidEMI)
        VALUES (?, CURDATE(), ?)
    `;

    // Execute query
    db.query(query, [InvestmentID, payableInterest], (err, result) => {
        if (err) {
            console.error("Error inserting data into InvestorEMIHistory:", err);
            return res.status(500).json({ error: "Error processing EMI payment" });
        }

        console.log("EMI payment recorded successfully:", result);
        res.status(200).json({ message: "EMI payment recorded successfully" });
    });
});


app.post("/ClientEMIPayement", (req, res) => {

    const{OrderID,ActualEMI,PaidEMI}=req.body;
    // Query to insert data into InvestorEMIHistory with only the current date
    const query = `
        INSERT INTO ClientEMIHistory (OrderID,EMIDate,ActualEMI,PaidEMI)
        VALUES (?,CURDATE(),?,?)
    `;

    db.query(query, [OrderID, ActualEMI,PaidEMI], (err, result) => {
        if (err) {
            console.error("Error inserting data into InvestorEMIHistory:", err);
            res.status(500).send("Error processing EMI payment");
        } else {
            console.log("EMI payment recorded successfully:", result);
            res.sendFile(path.join(__dirname, 'public/Investors.html'))
        }
    });
});









////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/getInvestmentData', (req, res) => {
    const query = `SELECT InvestorID, CAST(SUM(Amount) AS SIGNED) AS TotalInvestment
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
    const query = `SELECT ClientID, CAST(SUM(Amount) AS SIGNED) AS TotalOrder
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







// Start the server
app.listen(2001,()=>{

    console.log("SUCCESFUL")
}

)






// app.get('/graph',(req,res)=>{
//     res.sendFile(path.join(__dirname, 't.html'))
// })

// app.get('/api/graph/:type', (req, res) => {
//     const graphType = req.params.type;

//     let query = '';

//     // Construct SQL query based on the selected graph type
//     if (graphType === 'InvestorsVsClients') {
//         query = 'SELECT ClientName, COUNT(ClientID) AS numInvestors FROM Clients GROUP BY InvestorName';
//     } else if (graphType === 'InvestementsVsOrders') {
//         query = 'SELECT InvestmentID, COUNT(OrderID) AS numOrders FROM Orders GROUP BY InvestmentID';
//     } else if (graphType === 'InvestementsSplit') {
//         query = 'SELECT InvestmentType, SUM(Amount) AS totalAmount FROM Investments GROUP BY InvestmentType';
//     } else if (graphType === 'OrdersSplit') {
//         query = 'SELECT OrderStatus, COUNT(OrderID) AS numOrders FROM Orders GROUP BY OrderStatus';
//     } else if (graphType === 'GrowthGraph') {
//         query = 'SELECT YEAR(OrderDate) AS year, COUNT(OrderID) AS totalOrders FROM Orders GROUP BY YEAR(OrderDate)';
//     }

//     // Execute the query
//     db.query(query, (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Error fetching data');
//         }
//         res.json(result);
//     });
// });


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
