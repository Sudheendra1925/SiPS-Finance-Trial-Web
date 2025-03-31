require('dotenv').config();
//Declarations  
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcrypt'); 
const cookieParser = require('cookie-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
const moment = require('moment');
/////////////////////////////Use/////////////////////////////////////////////////////////////////////////
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser( "4c8e9e8fb6e93f6456f3dc5f91794f27ba87ac63e09456119b8a792d4b172b5f"
));
app.use(
    session({
      secret: "4c8e9e8fb6e93f6456f3dc5f91794f27ba87ac63e09456119b8a792d4b172b5f", 
      resave: false,
      saveUninitialized: true,
    })
  );
//////////////////////////////////////////////////////////////////////

function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      return res.send(`
        <script>
          alert("Please log in to access this page!");
          window.location.href = "/";
        </script>
      `);
    }
  }
/////////////////////////////////////////////////////////////////////////////////////////////////
const ensureFolderExists = (folder) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true }); // Create folder if it doesn't exist
    }
};

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'public/uploads/others'; // Default folder
        
        if (file.fieldname === 'AadharCard') {
            folder = 'public/uploads/aadhar';
        } else if (file.fieldname === 'PanCard') {
            folder = 'public/uploads/pancard';
        } else if (file.fieldname === 'Image') {
            folder = 'public/uploads/images';
        } else if (file.fieldname === 'Collaterals') {
            folder = 'public/uploads/collaterals';
        }

        ensureFolderExists(folder); // Check and create folder if missing

        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// Allowed File Types (Including Excel)
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /\.(jpeg|jpg|png|pdf|xls|xlsx)$/i; // Regular Expression for extensions
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // .xlsx
        ];

        const extName = allowedExtensions.test(file.originalname.toLowerCase());
        const mimeType = allowedMimeTypes.includes(file.mimetype);

        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and Excel files (.xls, .xlsx) are allowed.'));
        }
    },
    limits: { fileSize: 20 * 1024 * 1024 }, // 5 MB file size limit
});



//////generate ID function ////////////////
const generateSmallId = (prefix) => {
    const id = crypto.randomBytes(3).toString('hex'); 
    return `${prefix}-${id}`;
  };
///////////////////////////////////////////////////////////////////


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

app.get('/check', async (req, res) => {
    const { username, password } = req.query;
  
    try {
      // Query the database for the user
      db.query('SELECT * FROM users WHERE UserName = ?', [username], async (err, result) => {
        if (err) {
          console.error('Error querying the database:', err);
          return res.status(500).send('Database error');
        }
  
        const user = result[0];
  
        if (!user) {
          // Invalid username
          return res.send(`
            <script>
              alert("Invalid username or password!");
              window.location.href = "/";
            </script>
          `);
        }
  
        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.Password);
  
        if (isMatch) {
          // Set session for user
          req.session.user = username;
  
          // Redirect to home
          return res.redirect("/Home");
        } else {
          // Invalid password
          return res.send(`
            <script>
              alert("Invalid username or password!");
              window.location.href = "/";
            </script>
          `);
        }
      });
    } catch (err) {
      console.error('Error during user authentication:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Send OTP endpoint
  let transporter = nodemailer.createTransport({
    service: 'gmail',
      auth: {
        user: 'chatrapathi12052005@gmail.com', // your email
        pass: 'ikrj obvn cxjr qmyb' // your app password
    }
});
  app.post("/sendOtp", (req, res) => {
    const { Email,Otp } = req.query;  // Email passed in request body
  
    if (!Email) {
      return res.status(400).send("Email is required");
    }
  
    // Setup email data
    const mailOptions = {
      from: "sips",  // sender address
      to: Email,                             // recipient's email
      subject: "Your OTP Code From  Sips",              // Subject line
      text: `${Otp}`,      // OTP in text body
    };
  
    // Send the OTP via email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send('Error sending email');
      }
      console.log('Message sent: %s', info.messageId);
      res.status(200).json({ status: "success", message: "OTP sent successfully" });

    });
  });

app.get("/getEmails",(req,res)=>{

    db.query('SELECT Email FROM Users', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        
        // Extract only email values into an array
        const emailArray = results.map(row => row.Email);
        
        res.json(emailArray); // Send only the array of emails
    }); 
})

app.get('/ResetPassword', async (req, res) => {
    const { Email, Password } = req.query;

    if (!Email || !Password) {
        return res.status(400).json({ message: 'Email and new password are required' });
    }

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Update the password in the database
        const query = 'UPDATE users SET Password = ? WHERE Email = ?';
        db.query(query, [hashedPassword, Email], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return  res.send(`
                    <script>
                      alert("Internal server error!");
                      window.location.href = "/";
                    </script>
                  `);
               
            }

            if (result.affectedRows === 0) {
                return   res.send(`
                    <script>
                      alert("No User Found With this Email!");
                      window.location.href = "/";
                    </script>
                  `);
                 
            }

           res.redirect("/");
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})



/////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          return res.send('Error logging out');
        }});
    res.sendFile(path.join(__dirname, 'public/Login.html'));
});

app.get('/Home', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Home.html'));
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/Investors',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Investors.html'));
});

app.get('/Clients',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Clients.html'));
});

app.get('/Queue',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Queue.html'));
});


app.get('/AddInvestor',isAuthenticated, (req, res) => {
    
    res.sendFile(path.join(__dirname, 'public/AddInvestor.html'));
});

app.get('/AddClient',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddClient.html'));
});

app.get('/AddClientLead',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddClientLead.html'));
});

app.get('/AddInvestorLead',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddInvestorLead.html'));
});
app.get('/AddInvestment',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddInvestment.html'));
});

app.get('/AddOrder',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddOrder.html'));
});

app.get('/Investor/:ID',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Investor.html'));
});

app.get('/Client/:ID',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Client.html'));
});


app.get('/InvestmentHistory',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/InvestmentHistory.html'));
});

app.get('/OrderHistory',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/OrderHistory.html'));
});

app.get('/UpdateInvestorPage/:ID',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/UpdateInvestor.html'));
});
app.get('/UpdateClientPage/:ID',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/UpdateClient.html'));
});

app.get('/UpdateInvestmentPage/:ID',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/UpdateInvestment.html'));
});
app.get('/UpdateOrderPage/:ID',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/UpdateOrder.html'));
});

app.get('/Company',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Company.html'));
});

app.get('/ClientEMIPage/:OrderID',isAuthenticated, (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/ClientEMIPage.html'));
});
app.get('/InvestmentEMIHistoryPage/:InvestmentID',isAuthenticated, (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/InvestmentEMIHistoryPage.html'));
});
app.get('/OrderEMIHistoryPage/:OrderID',isAuthenticated, (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/OrderEMIHistoryPage.html'));
});

app.get('/TotalInvestmentEMIHistoryPage',isAuthenticated,(req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/TotalInvestmentEMIHistoryPage.html'));
});
app.get('/TotalOrderEMIHistoryPage',isAuthenticated, (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/TotalOrderEMIHistoryPage.html'));
});

app.get('/DueEMIPage',isAuthenticated, (req, res) => {
    // Serve the HTML file
    res.sendFile(path.join(__dirname, 'public/DueEMIPage.html'));
});
app.get('/ChangeDueEMI/:OrderID',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ChangeDueEMI.html'));
});
app.get('/AddExtraExpensesPage',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddExtraExpensesPage.html'));
});
app.get('/AddExtraIncomePage',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddExtraIncomePage.html'));
});
app.get('/ExtraExpensesHistoryPage',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ExtraExpensesHistoryPage.html'));
});
app.get('/ExtraIncomeHistoryPage',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ExtraIncomeHistoryPage.html'));
});
app.get('/ClosedInvestmentsPage',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ClosedInvestmentsPage.html'));
});
app.get('/ClosedOrdersPage',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ClosedOrdersPage.html'));
});
app.get('/ForgetPasswordPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ForgetPasswordPage.html'));
});

app.get('/LoanRequestPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/LoanRequestPage.html'));
});
app.get('/ExcelExportPage',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ExcelExportPage.html'));
});
app.get('/ExcelImportPage',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ExcelImportPage.html'));
});
app.get('/RejectedInvestmentsPage',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/RejectedInvestmentsPage.html'));
});
app.get('/RejectedOrdersPage',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/RejectedOrdersPage.html'));
});


///////////////////////////////  ADDING INVESTOR CLIENTS LEADS //////////////////////////////////////////
app.post('/NewInvestor', upload.fields([
    { name: 'Image', maxCount: 1 },
]), (req, res) => {

    const InvestorID = generateSmallId('INV');
    const { InvestorName,PhoneNumber,BankDetails} = req.body;
    const ImageFile = req.files?.Image ? req.files.Image[0].filename : null;
console.log(ImageFile)
    const sql = `INSERT INTO Investors (InvestorID, InvestorName,AmountInvested, PhoneNumber,Image,BankDetails)
                 VALUES (?, ?,0,?,?,?)`;

    db.query(sql, [ InvestorID,InvestorName, PhoneNumber,ImageFile,BankDetails], (err) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            res.send(`
                <script>
                  alert(Error inserting record:', ${err});
                  window.location.href = "/AddInvestment";
                </script>
              `);
            return;
        }
        console.log('Record inserted');
        res.send(`
            <script>
              alert("Investor Added Succesfully!");
              window.location.href = "/AddInvestment";
            </script>
          `);

    });
})



//////////////////////////////////////////////////////////////////////////////////
app.post('/NewClient', upload.fields([
    { name: 'AadharCard', maxCount: 1 },
    { name: 'PanCard', maxCount: 1 },
    { name: 'Image', maxCount: 1 },
]), (req, res) => {
    const ClientID = generateSmallId('CLI');
    try {
        const { ClientName,AddressAndOccupation,PhoneNumber,Aadhar,Pan,Comments} = req.body;

        // Handle uploaded files
        const AadharCardFile = req.files?.AadharCard ? req.files.AadharCard[0].filename : null;
        const PanCardFile = req.files?.PanCard ? req.files.PanCard[0].filename : null;
        const ImageFile = req.files?.Image ? req.files.Image[0].filename : null;

        const sql = `INSERT INTO Clients (ClientID, ClientName, TotalAmount, AddressAndOccupation, PhoneNumber, Aadhar, AadharCard, Pan, PanCard, Image, Comments)
                     VALUES (?,?,0, ?, ?, ?, ?, ?,?,?,?)`;

        // Execute the query with form data and uploaded file names
        db.query(sql, [ClientID,ClientName,AddressAndOccupation,PhoneNumber,Aadhar,AadharCardFile,Pan,PanCardFile,ImageFile,Comments], (err) => {
            if (err) {
                console.error('Error inserting record:', err);
                res.status(500).send('Error inserting record');
                return;
            }
            console.log('Record inserted');
            res.send(`
                <script>
                  alert("Client Added Succesfully!");
                  window.location.href = "/AddOrder";
                </script>
              `);
        });
    } catch (error) {
        console.error('Error handling request:', error.message);
        res.status(500).send('An error occurred while processing the request');
    }
});

app.post("/NewClientLead",(req,res)=>{

    const {ClientName,Amount,PhoneNumber,Years,Months,Days,Collateral} = req.body;
    const Duration=parseInt(Years)*365+parseInt(Months)*30+parseInt(Days);

    const sql = `INSERT INTO ClientLead ( ClientName, Amount,Duration,PhoneNumber,Collateral)
                 VALUES (?,?,?,?,?)`;


    // Execute the query, passing values from the request body
    db.query(sql, [ ClientName,Amount,Duration,PhoneNumber,Collateral], (err) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.send(`
            <script>
              alert("Client Lead added Succesfully!");
              window.location.href = "/Queue";
            </script>
          `);
        
    });
})
app.post("/NewInvestorLead",(req,res)=>{

    const {InvestorName,Amount,PhoneNumber} = req.body;

    const sql = `INSERT INTO InvestorLead ( InvestorName, Amount,PhoneNumber)
                 VALUES (?,?,?)`;


    // Execute the query, passing values from the request body
    db.query(sql, [ InvestorName,Amount,PhoneNumber], (err) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.send(`
            <script>
              alert("Investor Lead added Succesfully!");
              window.location.href = "/Queue";
            </script>
          `);
    });
})


app.post("/NewInvestment", (req, res) => {
    const InvestmentID = generateSmallId('INVE');
    const { Investor, AmountSanctioned, InvestmentDate, PayableInterest, InterestRate,EndDate } = req.body;

    // Update Investor's Total Investment
    const updateInvestorSql = `UPDATE Investors SET AmountInvested = AmountInvested + ? WHERE InvestorID = ?`;

    db.query(updateInvestorSql, [AmountSanctioned, Investor], (updateErr) => {
        if (updateErr) {
            console.error('Error updating AmountInvested:', updateErr);
            return res.send(`
                <script>
                    alert("Error updating AmountInvested: ${updateErr.message}");
                    window.location.href = "/Home";
                </script>
            `);
        }

        console.log('Investor AmountInvested updated');

        // Insert Investment Record
        const insertInvestmentSql = `
            INSERT INTO Investments (InvestmentID, InvestorID, AmountSanctioned, ActiveAmount, PayableInterest, InvestmentDate, InterestRate,EndDate)
            VALUES (?, ?, ?, ?, ?, ?, ?,?)
        `;

        db.query(insertInvestmentSql, [InvestmentID, Investor, AmountSanctioned, AmountSanctioned, PayableInterest, InvestmentDate, InterestRate,EndDate], (insertErr) => {
            if (insertErr) {
                console.error('Error inserting Investment:', insertErr);
                return res.send(`
                    <script>
                        alert("Error inserting Investment: ${insertErr.message}");
                        window.location.href = "/Home";
                    </script>
                `);
            }

            console.log('New Investment record inserted');

            // Fetch InvestorName from Investors table
            const fetchInvestorNameSql = `SELECT InvestorName FROM Investors WHERE InvestorID = ?`;

            db.query(fetchInvestorNameSql, [Investor], (fetchErr, results) => {
                if (fetchErr) {
                    console.error('Error fetching InvestorName:', fetchErr);
                    return res.send(`
                        <script>
                            alert("Error fetching InvestorName: ${fetchErr.message}");
                            window.location.href = "/Home";
                        </script>
                    `);
                }

                if (results.length === 0) {
                    console.error('Investor not found');
                    return res.send(`
                        <script>
                            alert("Investor not found");
                            window.location.href = "/Home";
                        </script>
                    `);
                }

                const InvestorName = results[0].InvestorName;

                // Delete from InvestorLead where InvestorName and Amount match
                const deleteInvestorLeadSql = `DELETE FROM InvestorLead WHERE InvestorName = ? AND Amount = ?`;

                db.query(deleteInvestorLeadSql, [InvestorName, AmountSanctioned], (deleteErr) => {
                    if (deleteErr) {
                        console.error('Error deleting from InvestorLead:', deleteErr);
                        return res.send(`
                            <script>
                                alert("Error deleting from InvestorLead: ${deleteErr.message}");
                                window.location.href = "/Home";
                            </script>
                        `);
                    }

                    console.log('Investor Lead entry deleted');

                    // Success Message
                    res.send(`
                        <script>
                            alert("Investment Added Successfully!");
                            window.location.href = "/Home";
                        </script>
                    `);
                });
            });
        });
    });
});


app.post("/NewOrder", upload.fields([{ name: 'Collaterals', maxCount: 1 }]), (req, res) => {
    const OrderID = generateSmallId('ORD');
    const { Client, AmountSanctioned, PayableInterest, Years = 0, Months = 0, Days = 0, RateOfInterest, StartDate,CollateralType } = req.body;
    const CollateralsFile = req.files?.Collaterals ? req.files.Collaterals[0].filename : null;
    const Duration = parseInt(Years * 365) + parseInt(Months * 30) + parseInt(Days);

    // Calculate the EndDate
    const startDateObj = new Date(StartDate).toISOString().split('T')[0];
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + Duration);
    const EndDate = endDateObj.toISOString().split('T')[0];

    // Update Client's TotalAmount
    const updateInvestorSql = `UPDATE Clients SET TotalAmount = TotalAmount + ? WHERE ClientID = ?`;

    db.query(updateInvestorSql, [AmountSanctioned, Client], (updateErr) => {
        if (updateErr) {
            console.error('Error updating Client TotalAmount:', updateErr);
            return res.send(`
                <script>
                    alert("Error updating Client TotalAmount: ${updateErr.message}");
                    window.location.href = "/Home";
                </script>
            `);
        }

        console.log('Client TotalAmount updated');

        // Insert new order
        const insertOrderSql = `
            INSERT INTO Orders (OrderID, ClientID, AmountSanctioned, ActiveAmount, PayableInterest, RateOfInterest, StartDate, EndDate, Collaterals,CollateralType)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
        `;

        db.query(insertOrderSql, [OrderID, Client, AmountSanctioned, AmountSanctioned, PayableInterest, RateOfInterest, StartDate, EndDate, CollateralsFile,CollateralType], (insertErr) => {
            if (insertErr) {
                console.error('Error inserting Order:', insertErr);
                return res.send(`
                    <script>
                        alert("Error inserting Order: ${insertErr.message}");
                        window.location.href = "/Home";
                    </script>
                `);
            }

            console.log('New Order record inserted');

            // Fetch ClientName from Clients table
            const fetchClientNameSql = `SELECT ClientName FROM Clients WHERE ClientID = ?`;

            db.query(fetchClientNameSql, [Client], (fetchErr, results) => {
                if (fetchErr) {
                    console.error('Error fetching ClientName:', fetchErr);
                    return res.send(`
                        <script>
                            alert("Error fetching ClientName: ${fetchErr.message}");
                            window.location.href = "/Home";
                        </script>
                    `);
                }

                if (results.length === 0) {
                    console.error('Client not found');
                    return res.send(`
                        <script>
                            alert("Client not found");
                            window.location.href = "/Home";
                        </script>
                    `);
                }

                const ClientName = results[0].ClientName;

                // Delete from ClientLead where ClientName and Amount match
                const deleteClientLeadSql = `DELETE FROM ClientLead WHERE ClientName = ? AND Amount = ?`;

                db.query(deleteClientLeadSql, [ClientName, AmountSanctioned], (deleteErr) => {
                    if (deleteErr) {
                        console.error('Error deleting from ClientLead:', deleteErr);
                        return res.send(`
                            <script>
                                alert("Error deleting from ClientLead: ${deleteErr.message}");
                                window.location.href = "/Home";
                            </script>
                        `);
                    }

                    console.log('ClientLead entry deleted');

                    // Success Message
                    res.send(`
                        <script>
                            alert("Order Added Successfully!");
                            window.location.href = "/Home";
                        </script>
                    `);
                });
            });
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
    db.query('SELECT * FROM Investments WHERE InvestorID = ? ORDER BY InvestmentDate DESC', [InvestorID], (err, results) => {
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
    db.query('SELECT * FROM Orders WHERE ClientID = ? ORDER BY StartDate DESC', [ClientID], (err, results) => {
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
SELECT *
FROM Investments 
WHERE (
        DAY(InvestmentDate) = DAY(curdate())

     OR (
        DAY(curdate()) = DAY(LAST_DAY(curdate())) 
        AND DAY(InvestmentDate) IN (30, 31) 
        AND InvestmentDate < curdate()
    )
)
AND InvestmentDate < curdate();  

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
SELECT *
FROM Orders
WHERE (
    DAY(StartDate) = DAY(curdate())
    
     OR (
        DAY(curdate()) = DAY(LAST_DAY(curdate())) 
        AND DAY(StartDate) IN (30, 31) 
        AND StartDate < curdate()
    )
)
AND StartDate < curdate();
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
SELECT  * FROM Investments`;
   
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
  *
FROM
    Orders
WHERE 
    MONTH(EndDate) = MONTH( curdate() + interval 1 day) 
    AND YEAR(EndDate) = YEAR( curdate() );

`
   
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching Order data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json(results|| 0);  // Send results if data found
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/UpdateInvestor', upload.single('Image'), (req, res) => {
    const { InvestorID, InvestorName, AmountInvested, PhoneNumber,BankDetails } = req.body;
    const oldImagePath = req.body.oldImagePath;  // Get the old image path from the form if available
    let newImageFile = null;

    // If a new image is uploaded, store its path
    if (req.file) {
        newImageFile = req.file.filename;
    }

    // If there's a new image and the old image exists, delete the old image
    if (newImageFile && oldImagePath) {
        fs.unlink(path.join(__dirname, 'uploads/images', oldImagePath), (err) => {
            if (err) console.error('Error deleting old image:', err);
        });
    }

    // Update the investor details in the database, including the new image path if uploaded
    const updateQuery = `
        UPDATE Investors SET
            InvestorName = ?,
            AmountInvested = ?,
            PhoneNumber = ?,
            Image = ?,
            BankDetails=?
        WHERE InvestorID = ?
    `;

    const updatedImagePath = newImageFile || oldImagePath;  // Use the new image or the old image path if no new image is uploaded

    db.query(updateQuery, [InvestorName, AmountInvested, PhoneNumber, updatedImagePath,BankDetails, InvestorID], (err) => {
        if (err) {
            console.error('Error updating investor details:', err);
            return res.status(500).send('Error updating investor details');
        }
        console.log('Investor updated successfully');
        res.send(`
            <script>
              alert("Investor updated Succesfully!");
              window.location.href = "/Investors";
            </script>
          `);
    });
});



////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/UpdateClient', upload.fields([{ name: 'AadharCard' }, { name: 'PanCard' }, { name: 'Image' }]), (req, res) => {
    const { ClientID, ClientName, PhoneNumber,Aadhar,Pan, Comments, oldAadharPath, oldPanPath, oldImagePath } = req.body;
    // Extract file paths from multer
    const panFile = req.files['PanCard'] ? req.files['PanCard'][0].filename : null;
    const aadharFile = req.files['AadharCard'] ? req.files['AadharCard'][0].filename : null;
    const imageFile = req.files['Image'] ? req.files['Image'][0].filename : null;


    // Handle new Aadhar card update
    if (aadharFile && oldAadharPath) {
        fs.unlink(path.join(__dirname, oldAadharPath), (err) => {
            if (err) console.error('Error deleting old Aadhar card file:', err);
        });
    }
    if (panFile && oldPanPath) {
        fs.unlink(path.join(__dirname, oldPanPath), (err) => {
            if (err) console.error('Error deleting old PAN card file:', err);
        });
    }
    if (imageFile && oldImagePath) {
        fs.unlink(path.join(__dirname, oldImagePath), (err) => {
            if (err) console.error('Error deleting old image file:', err);
        });
    }


    const updateQuery = `
        UPDATE Clients SET
            ClientName = ?,
            PhoneNumber = ?,
            Aadhar=?,
            AadharCard=?,
            Pan=?,
            PanCard=?,
            Image=?,
            Comments = ?
        WHERE ClientID = ?
    `;
    const updatedAadharPath = aadharFile ?aadharFile : oldAadharPath;
    const updatedPanPath = panFile ? panFile : oldPanPath;
    const updatedImagePath = imageFile ? imageFile : oldImagePath;

    db.query(updateQuery, [ClientName,PhoneNumber,Aadhar,updatedAadharPath,Pan,updatedPanPath, updatedImagePath, Comments, ClientID], (err) => {
        if (err) {
            console.error('Error updating client details:', err);
            return res.status(500).send('Error updating client details');
        }
        console.log('Client updated successfully');
        res.send(`
            <script>
              alert("Client updated Succesfully!");
              window.location.href = "/Clients";
            </script>
          `);
    });
});
/////////////////////////////////////////////////////////////////////////////////



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
            (err) => {
                if(err){
                    console.log(err)
                    res.send("GONE WRONG");
                }
               else{
                res.send(`
                    <script>
                      alert("Investment updated Succesfully!");
                      window.location.href = "/Investors";
                    </script>
                  `);
                
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
    
    
    app.post('/UpdateOrder',upload.single('Collaterals'), (req, res) => {
        const {OrderID,ActiveAmount,PayableInterest,RateOfInterest,oldCollateralsPath,EndDate,CollateralType } = req.body;
        
        let newCollateralsPath = null;

        // If a new image is uploaded, store its path
        if (req.file) {
            newCollateralsPath = req.file.filename;
        }
    
        // If there's a new image and the old image exists, delete the old image
        if (newCollateralsPath && oldCollateralsPath) {
            fs.unlink(path.join(__dirname, 'uploads/images', oldCollateralsPath), (err) => {
                if (err) console.error('Error deleting old image:', err);
            });
        }

        const query = `
            UPDATE Orders
            SET ActiveAmount = ?,PayableInterest=?, RateOfInterest = ?,Collaterals=?,EndDate=?,CollateralType=?
            WHERE OrderID = ?
        `;
        const updatedCollateralsPath = newCollateralsPath ?newCollateralsPath : oldCollateralsPath;
        db.query(query, [ActiveAmount,PayableInterest,RateOfInterest,updatedCollateralsPath,EndDate,CollateralType, OrderID], (err, results) => {
            if (err) {
                console.error('Error deleting client:', err);
                return res.status(500).json({ message: 'Error deleting client' });
            }
    
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            res.send(`
                <script>
                  alert("Order updated Succesfully!");
                  window.location.href = "/Clients";
                </script>
              `);
        });
    });
    

app.get ('/RejectClientLead/:ClientName',(req,res)=>{
    
const ClientName = req.params.ClientName;
const {Amount,PhoneNumber,Reason}=req.query;




const sqlInsert = `INSERT INTO RejectedOrders ( ClientName,PhoneNumber,RequestedAmount,Reason)
VALUES (?,?,?,?)`;


// Execute the query, passing values from the request body
db.query(sqlInsert, [ ClientName,PhoneNumber,Amount,Reason], (err) => {
if (err) {
console.error('Error inserting record:', err);
res.status(500).send('Error inserting record');
return;
}

});

    const query = `
    DELETE FROM ClientLead WHERE ClientName = ? AND Amount = ?;
`;

db.query(query, [ClientName,Amount], (err) => {
    if (err) {
        console.error('Error updating client:', err);
        return res.status(500).json({ message: 'Error updating client' });
    }

    res.redirect('/Queue');
});
})

app.get ('/RejectInvestorLead/:InvestorName',(req,res)=>{
    
    const InvestorName = req.params.InvestorName;
    const {Amount,PhoneNumber,Reason}=req.query;




    const sqlInsert = `INSERT INTO RejectedInvestments ( InvestorName,PhoneNumber,AssuredAmount,Reason)
    VALUES (?,?,?,?)`;
    
    
    // Execute the query, passing values from the request body
    db.query(sqlInsert, [ InvestorName,PhoneNumber,Amount,Reason], (err) => {
    if (err) {
    console.error('Error inserting record:', err);
    res.status(500).send('Error inserting record');
    return;
    }
    
    });



        const query = `
       DELETE  FROM InvestorLead WHERE InvestorName=? And Amount=? ;
    `;
    
    db.query(query, [InvestorName,Amount], (err) => {
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

db.query(query, [InvestorID], (err) => {
    if (err) {
        console.error('Error updating order:', err);
        return res.send(`
            <script>
              alert("Error,${err}");
              window.location.href = "/Investors";
            </script>
          `);;
    }

    res.send(`
        <script>
          alert("Investor Deleted!");
          window.location.href = "/Investors";
        </script>
      `);
    
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
       return  res.send(`
            <script>
              window.location.href = "/Clients";
            </script>
          `);
    }
    res.send(`
        <script>
          alert("Client Deleted!");
          window.location.href = "/Clients";
        </script>
      `);
   
});
});

app.get('/DeleteInvestment/:InvestmentID', (req, res) => {
    const { InvestmentID } = req.params;
    var { InvestorName, Amount, InvestmentDate } = req.query;

    function formatDate(InvestmentDate) {
        const [day,month, year] = InvestmentDate.split('/'); // Assuming 'MM/DD/YYYY' format
        if (!month || !day || !year) {
            return null; // Invalid date format
        }
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // Convert to 'YYYY-MM-DD'
    }
    
    const investmentDate = formatDate(InvestmentDate);



   
    // SQL queries
    const deleteQuery = `DELETE FROM Investments WHERE InvestmentID = ?`;
    const insertQuery = `
        INSERT INTO ClosedInvestments (InvestmentID, InvestorName, Amount, StartDate, ClosedDate)
        VALUES (?, ?, ?, ?,  curdate() )
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
            [InvestmentID, InvestorName, Amount, investmentDate],
            (insertErr) => {
                if (insertErr) {
                    return db.rollback(() => {
                        console.error('Insert Error:', insertErr);
                        res.status(500).send('Failed to insert into ClosedInvestment.');
                    });
                }

                // Delete from InvestmentTable
                db.query(deleteQuery, [InvestmentID], (deleteErr) => {
                    if (deleteErr) {
                        return  res.send(`
                            <script>
                              alert("Error In Deletion,${deleteErr}");
                              window.location.href = "/Investors";
                            </script>
                          `);
                          
                    }

                    // Commit the transaction
                    db.commit((commitErr) => {
                        if (commitErr) {
                            return  res.send(`
                                <script>
                                  alert("Error In Deletion,${commitErr}");
                                  window.location.href = "/Investors";
                                </script>
                              `);
                              
                        }

                        console.log('Investment deleted and moved to ClosedInvestment successfully.');
                        res.send(`
                            <script>
                              alert("Investment Closed!");
                              window.location.href = "/Home";
                            </script>
                          `);
                        
                    });
                });
            }
        );
    });
});
app.get('/DeleteOrder/:OrderID', (req, res) => {
    const { OrderID } = req.params; // Extract OrderID from URL params
    const { ClientName, AmountSanctioned, StartDate } = req.query; // Extract query parameters
    // Validate inputs

    function formatDate(StartDate) {
        const [day,month, year] = StartDate.split('/'); // Assuming 'MM/DD/YYYY' format
        if (!month || !day || !year) {
            return null; // Invalid date format
        }
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // Convert to 'YYYY-MM-DD'
    }
    
    const startDate = formatDate(StartDate);

    
    if (!OrderID || !ClientName || !AmountSanctioned || !startDate) {
        return res.send(`
            <script>
            alert('Missing required parameters.')
            </script>
            `)
       
    }

    // SQL queries
    const deleteQuery = `DELETE FROM Orders WHERE OrderID = ?`;
    const insertQuery = `
        INSERT INTO ClosedOrders (OrderID, ClientName, Amount, StartDate, ClosedDate)
        VALUES (?, ?, ?, ?,  curdate() )
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
                return  res.send(`
                    <script>
                      alert("Failed to delete,${checkErr}");
                      window.location.href = "/clients";
                    </script>
                  `);
                
            }

            if (results.length > 0) {
                return res.send(`
                    <script>
                      alert("Order already closed!");
                      window.location.href = "/clients";
                    </script>
                  `);
            }

            // Step 2: Insert into ClosedOrders
            db.query(
                insertQuery,
                [OrderID, ClientName, AmountSanctioned, startDate],
                (insertErr) => {
                    if (insertErr) {
                        console.log(insertErr)
                        return  res.send(`
                            <script>
                              alert("Failed to insert,${insertErr}");
                              window.location.href = "/clients";
                            </script>
                          `);
                    }

                    // Step 3: Delete from Orders
                    db.query(deleteQuery, [OrderID], (deleteErr) => {
                        if (deleteErr) {
                            return  res.send(`
                                <script>
                                  alert("Failed to delete,${deleteErr}");
                                  window.location.href = "/clients";
                                </script>
                              `);
                        }

                        // Step 4: Commit the transaction
                        db.commit((commitErr) => {
                            if (commitErr) {
                                return  res.send(`
                                    <script>
                                      alert("Failed to delete2,${commitErr}");
                                      window.location.href = "/clients";
                                    </script>
                                  `);
                            }

                            console.log(
                                `Order ${OrderID} moved to ClosedOrders and deleted from Orders successfully.`
                            );
                            res.send(`
                                <script>
                                  alert("Order Closed!");
                                  window.location.href = "/Clients";
                                </script>
                              `);
                            
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
        VALUES (?,?,  curdate() , ?)
    `;

    // Execute query
    db.query(query, [InvestmentID,InvestorName, PayableInterest], (err, result) => {
        if (err) {
            console.error("Error inserting data into InvestorEMIHistory:", err);
            return res.status(500).json({ error: "Error processing EMI payment" });
        }

        console.log("EMI payment recorded successfully:", result);
        res.send(`
            <script>
              alert("EMI Paid Successfully!");
              window.location.href = "/Investors";
            </script>
          `);
        
    });
});


app.post("/ClientEMIPayement", (req, res) => {

    const{OrderID,ActualEMI,PaidEMI,ClientName}=req.body;
    // Query to insert data into InvestorEMIHistory with only the current date
    const query = `
        INSERT INTO OrderEMIHistory (OrderID,ClientName,EMIDate,ActualEMI,PaidEMI)
        VALUES (?,?, curdate() ,?,?)
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
  
            res.status(200).json(results);
        });
    
    })

    app.get('/TotalInvestmentEMIHistory',(req,res)=>{
        
            const query = `select * from InvestmentEMIHistory`
        
            db.query(query ,(err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to fetch investment data' });
                }
       
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
          const ExtraIncome = "SELECT SUM(CAST(Amount AS DECIMAL(20, 0))) AS total FROM ExtraIncome";
          
          // Execute Queries
          const [investmentsSum] = await db.promise().query(investmentsSumQuery);
          const [clientEmiSum] = await db.promise().query(clientEmiSumQuery);
          const [ordersSum] = await db.promise().query(ordersSumQuery);
          const [investorEmiSum] = await db.promise().query(investorEmiSumQuery);
          const [ExtraExpensesSum] = await db.promise().query(ExtraExpenses);
          const [ExtraIncomeum] = await db.promise().query(ExtraIncome);
          // Extract Results
          const totalInvestments = parseInt(investmentsSum[0].total) || 0;
          const totalClientEmi = parseInt(clientEmiSum[0].total) || 0;
          const totalOrders = parseInt(ordersSum[0].total) || 0;
          const totalInvestorEmi = parseInt(investorEmiSum[0].total) || 0;
            const totalExtraExpenses=parseInt(ExtraExpensesSum[0].total) || 0;
            const totalExtraIncome=parseInt(ExtraIncomeum[0].total) || 0;
           
          // Perform Calculation
          const totalSum = (totalInvestments + totalClientEmi+totalExtraIncome) - (totalOrders + totalInvestorEmi+totalExtraExpenses);
      
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
              totalExtraIncome
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
   console.log(EMIDate)
   function formatDate(EMIDate) {
    if (!EMIDate) return null;

    const parts = EMIDate.split('/'); 
    if (parts.length !== 3) return null; // Ensure it's a valid date format

    const [day, month, year] = parts; // Correct order for DD-MM-YYYY
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // Convert to YYYY-MM-DD
}
    
    const emiDate = formatDate(EMIDate);
    
    console.log(emiDate)
    // Query to insert data into InvestorEMIHistory with only the current date
    const query = `
        INSERT INTO DueEMI (OrderID,IssuedDate,ClientName,OrderAmount,EMIDate,EMIAmount,RemainingEMI)
        VALUES (?, curdate() ,?,?,?,?,?)
    `;

    db.query(query, [OrderID,ClientName,ActiveAmount,emiDate,EMIAmount,EMIAmount], (err, result) => {
        if (err) {
            console.error("Error inserting data into InvestorEMIHistory:", err);
            res.send(`
                <script>
                  alert("${err}");
                  window.location.href = "/DueEMIPage";
                </script>
              `);
           
        } else {
            console.log("EMI payment recorded successfully:", result);
            res.send(`
                <script>
                  alert("Added In Due Succesfully!");
                  window.location.href = "/DueEMIPage";
                </script>
              `);
           
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
    VALUES (?, ?,  curdate() , ?, ?)
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
                 VALUES (?, ?, curdate() )`;

    db.query(sql, [Reason,Amount], (err) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.redirect('/Company');
    });
});

app.post('/AddExtraIncome', (req, res) => {
    const {Reason,Amount}=req.body;
    const sql = `INSERT INTO ExtraIncome (Reason,Amount,Date)
                 VALUES (?, ?, curdate() )`;

    db.query(sql, [Reason,Amount], (err) => {
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
app.get('/ExtraIncomeHistory', async (req, res) => {
    try {
        // SQL Query to join Orders and Clients to get ClientName
        const query = `select * from ExtraIncome`;
        
        const [ExtraIncomeHistory] = await db.promise().query(query);
        
        res.json(ExtraIncomeHistory); 
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


    const {UserName,Password,Email}=req.query;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(Password, salt, function(err, hash) {
            const sql = `INSERT INTO Users (UserName,Password,Email,Access)
            VALUES (?, ?,?,1)`;

db.query(sql, [UserName,hash,Email], (err) => {
   if (err) {
       console.error('Error inserting record:', err);
       res.status(500).send('Error inserting record');
       return;
   } 
        });
    });

        console.log('Record inserted');
        res.redirect('/')
    });
})
  







    ///////////////////////////////CLIENT LOAN AN CLIENT SIDE/////////////////////
app.post("/SubmitLoanRequest",(req,res)=>{
    const {ClientName,Amount,PhoneNumber,Years,Months,Days,Collateral} = req.body;
    const Duration=parseInt(Years)*365+parseInt(Months)*30+parseInt(Days);

    const sql = `INSERT INTO ClientLead ( ClientName, Amount,Duration,PhoneNumber,Collateral)
                 VALUES (?,?,?,?,?)`;


    // Execute the query, passing values from the request body
    db.query(sql, [ ClientName,Amount,Duration,PhoneNumber,Collateral], (err) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
            return;
        }
        console.log('Record inserted');
        res.sendFile(path.join(__dirname, 'public/ClientThankyouPage.html'));
    });


})


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/getTables",(req,res)=>{

    db.query("SHOW TABLES", (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            const tables = results.map(row => Object.values(row)[0]);
            res.json(tables);
        }
    });

})





// Assuming db is your MySQL connection instance
app.get('/ExportExcel', async (req, res) => {
    const tableName = req.query.table;
    if (!tableName) {
        return res.status(400).send("Table name is required");
    }

    // Step 1: Get column names and types for the given table
    db.query(`SHOW COLUMNS FROM \`${tableName}\``, (err, columns) => {
        if (err) {
            return res.status(500).send("Error fetching table columns");
        }

        // Step 2: Identify date/time columns correctly
        const dateColumns = columns
            .filter(col => col.Type.toLowerCase().includes("datetime") || col.Type.toLowerCase().includes("timestamp"))
            .map(col => `CONVERT_TZ(\`${col.Field}\`, '+00:00', '+05:30') AS \`${col.Field}_Adjusted\``); // Adjust for IST

        // Step 3: Build query dynamically
        let extraColumns = "";

        if (tableName === "investments") {
            extraColumns = `
                (SELECT InvestorName FROM Investors WHERE Investors.InvestorId = ${tableName}.InvestorId) AS InvestorName
            `;
        } else if (tableName === "orders") {
            extraColumns = `
                (SELECT ClientName FROM Clients WHERE Clients.ClientId = ${tableName}.ClientId) AS ClientName
            `;
        }

        const selectFields = [
            "*",
            extraColumns,
            dateColumns.length > 0 ? dateColumns.join(", ") : ""
        ].filter(Boolean).join(", ");

        const query = `SELECT ${selectFields} FROM \`${tableName}\``;

        db.query(query, async (err, results) => {
            if (err) {
                return res.status(500).send("Error retrieving data");
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(tableName);

            if (results.length > 0) {
                // Get all column headers except those with file extensions
                const fileExtensions = /\.(pdf|jpeg|jpg|png|docx|xlsx)$/i;
                const validColumns = Object.keys(results[0]).filter(col =>
                    !results.some(row => typeof row[col] === "string" && fileExtensions.test(row[col]))
                );

                // Define worksheet columns
                worksheet.columns = validColumns.map(col => ({
                    header: col,
                    key: col,
                    width: 20
                }));

                // Step 4: Fix date offset issue manually in JavaScript
                results.forEach(row => {
                    let newRow = {};
                    validColumns.forEach(col => {
                        if (row[col] instanceof Date) {
                            newRow[col] = new Date(row[col].getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
                        } else {
                            newRow[col] = row[col];
                        }
                    });
                    worksheet.addRow(newRow);
                });
            }

            res.setHeader('Content-Disposition', `attachment; filename="${tableName}.xlsx"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            await workbook.xlsx.write(res);
            res.end();
        });
    });
});



//////////////////////////////////////////////////////////////////////////////////////////////////// 



// API to get columns of a specific table
app.get('/columns/:table', async (req, res) => {
    const tableName = req.params.table;
    try {
        const [columns] = await db.promise().query(`SHOW COLUMNS FROM \`${tableName}\``);
        const columnNames = columns.map(col => col.Field);
        res.json(columnNames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching columns" });
    }
});

// API to upload and import Excel file into an existing table
app.post('/ImportExcel', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Please upload a file" });
    }

    const filePath = req.file.path;
    const workbook = new ExcelJS.Workbook();
    const tableName = req.body.tableName;

    if (!tableName) {
        return res.status(400).json({ error: "Table name is required" });
    }

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0]; // Read first sheet
        let columns = [];
        let rows = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                columns = row.values.slice(1); // First row is column names
            } else {
                rows.push(row.values.slice(1)); // Extract data rows
            }
        });

        if (columns.length === 0 || rows.length === 0) {
            return res.status(400).json({ error: "Excel file is empty or invalid" });
        }

        // Validate if columns exist in the table
        const [tableColumns] = await db.promise().query(`SHOW COLUMNS FROM \`${tableName}\``);
        const validColumns = tableColumns.map(col => col.Field);
        const matchingColumns = columns.filter(col => validColumns.includes(col));

        if (matchingColumns.length !== columns.length) {
            return res.status(400).json({ error: "Excel columns do not match table columns" });
        }

        // Insert Data
        const placeholders = matchingColumns.map(() => '?').join(',');
        const insertSQL = `INSERT INTO \`${tableName}\` (${matchingColumns.map(col => `\`${col}\``).join(', ')}) VALUES (${placeholders})`;

        for (const row of rows) {
            await db.promise().query(insertSQL, row);
        }

        fs.unlinkSync(filePath); // Remove uploaded file
        res.json({ message: "Data imported successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error processing the file" });
    }
});



app.get("/RejectedInvestments",(req,res)=>{

    const query = `SELECT * FROM RejectedInvestments;`

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch investment data' });
        }

        res.status(200).json(results);
    });


})

app.get("/RejectedOrders",(req,res)=>{

    const query = `SELECT * FROM RejectedOrders;`

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch investment data' });
        }

        res.status(200).json(results);
    });


})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.get('/getMonthlyInvestmentOrders', async (req, res) => {
    try {
        const currentYear = req.query.currentYear; // Get current year
console.log(currentYear)
        // Fetch investments per month
        const [investmentsData] = await db.promise().query(`
            SELECT 
                MONTH(InvestmentDate) AS month, 
                SUM(AmountSanctioned) AS totalInvestments
            FROM Investments
            WHERE YEAR(InvestmentDate) = ?
            GROUP BY MONTH(InvestmentDate)
            ORDER BY MONTH(InvestmentDate);
        `, [currentYear]);

        // Fetch orders per month
        const [ordersData] = await db.promise().query(`
            SELECT 
                MONTH(StartDate) AS month, 
                SUM(AmountSanctioned) AS totalOrders
            FROM Orders
            WHERE YEAR(StartDate) = ?
            GROUP BY MONTH(StartDate)
            ORDER BY MONTH(StartDate);
        `, [currentYear]);

        // Initialize arrays for all months (Jan to Dec)
        let labels = Array.from({ length: 12 }, (_, i) => moment().month(i).format("MMM"));
        let investments = Array(12).fill(0);
        let orders = Array(12).fill(0);

        // Map investments data to corresponding months
        investmentsData.forEach(row => {
            investments[row.month - 1] = row.totalInvestments || 0;
        });

        // Map orders data to corresponding months
        ordersData.forEach(row => {
            orders[row.month - 1] = row.totalOrders || 0;
        });

        res.send({ status: "success", labels, investments, orders });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).send({ status: "error", message: "Failed to fetch monthly investments and orders" });
    }
});

app.get('/getYearlyInvestmentOrders', async (req, res) => {
    try {
        // Fetch total investments per year
        const [investmentsData] = await db.promise().query(`
            SELECT 
                YEAR(InvestmentDate) AS year, 
                SUM(AmountSanctioned) AS totalInvestments
            FROM Investments
            GROUP BY YEAR(InvestmentDate)
            ORDER BY YEAR(InvestmentDate);
        `);

        // Fetch total orders per year
        const [ordersData] = await db.promise().query(`
            SELECT 
                YEAR(StartDate) AS year, 
                SUM(AmountSanctioned) AS totalOrders
            FROM Orders
            GROUP BY YEAR(StartDate)
            ORDER BY YEAR(StartDate);
        `);

        // Extract unique years from both datasets
        const allYears = [
            ...new Set([...investmentsData.map(row => row.year), ...ordersData.map(row => row.year)])
        ].sort((a, b) => a - b); // Ensure years are sorted

        // Initialize data for all years
        let investments = Array(allYears.length).fill(0);
        let orders = Array(allYears.length).fill(0);

        // Map investments data
        investmentsData.forEach(row => {
            let index = allYears.indexOf(row.year);
            if (index !== -1) investments[index] = row.totalInvestments || 0;
        });

        // Map orders data
        ordersData.forEach(row => {
            let index = allYears.indexOf(row.year);
            if (index !== -1) orders[index] = row.totalOrders || 0;
        });

        res.send({ status: "success", labels: allYears, investments, orders });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).send({ status: "error", message: "Failed to fetch yearly investments and orders" });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/getQuarterlyInvestmentOrders', async (req, res) => {
    try {
        const { year } = req.query;
        if (!year) {
            return res.status(400).send({ status: "error", message: "Year parameter is required" });
        }

        // Fetch total investments per quarter for the given year
        const [investmentsData] = await db.promise().query(`
            SELECT 
                QUARTER(InvestmentDate) AS quarter,
                SUM(AmountSanctioned) AS totalInvestments
            FROM Investments
            WHERE YEAR(InvestmentDate) = ?
            GROUP BY QUARTER(InvestmentDate)
            ORDER BY QUARTER(InvestmentDate);
        `, [year]);

        // Fetch total orders per quarter for the given year
        const [ordersData] = await db.promise().query(`
            SELECT 
                QUARTER(StartDate) AS quarter,
                SUM(AmountSanctioned) AS totalOrders
            FROM Orders
            WHERE YEAR(StartDate) = ?
            GROUP BY QUARTER(StartDate)
            ORDER BY QUARTER(StartDate);
        `, [year]);

        // Ensure all four quarters are represented
        const allQuarters = ["Q1", "Q2", "Q3", "Q4"].map(q => `${year}-${q}`);
        let investments = [0, 0, 0, 0];
        let orders = [0, 0, 0, 0];

        // Map investments data
        investmentsData.forEach(row => {
            let index = row.quarter - 1;
            if (index >= 0 && index < 4) investments[index] = row.totalInvestments || 0;
        });

        // Map orders data
        ordersData.forEach(row => {
            let index = row.quarter - 1;
            if (index >= 0 && index < 4) orders[index] = row.totalOrders || 0;
        });

        res.send({ status: "success", labels: allQuarters, investments, orders });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).send({ status: "error", message: "Failed to fetch quarterly investments and orders" });
    }
});




////////////////////////////////////////////////////////////////////////////////////////////////////////
const PORT=process.env.PORT||2001;
app.listen(PORT,()=>{

    console.log("SUCCESFUL")
})

