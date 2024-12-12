CREATE TABLE Investors (
    InvestorID VARCHAR(15) PRIMARY KEY,
    InvestorName VARCHAR(30) NOT NULL UNIQUE,
    StartDate DATE,
    AmountInvested BIGINT NOT NULL,
    PhoneNumber CHAR(10),
    Image Blob
);

select * from dueemi
CREATE TABLE Investments (
    InvestmentID VARCHAR(15) PRIMARY KEY,
    InvestorID VARCHAR(15) NOT NULL,
    Amount BIGINT NOT NULL,
    ActiveAmount BIGINT,
    PayableInterest BigInt,
    InvestmentDate DATE NOT NULL,
    InterestRate DECIMAL(5, 2),
    FOREIGN KEY (InvestorID) REFERENCES Investors(InvestorID) ON DELETE CASCADE
);

CREATE TABLE Clients (
    ClientID VARCHAR(20) PRIMARY KEY,
    ClientName VARCHAR(30) NOT NULL UNIQUE,
    TotalAmount BIGINT NOT NULL,
    AddressAndOccupation VARCHAR(100),
    PhoneNumber CHAR(10),
    Aadhar VARCHAR(12),
    AadharCard BLOB,
    Pan VARCHAR(10),
    PanCard BLOB,
    Image BLOB,
    Comments VARCHAR(100)
);

CREATE TABLE Orders (
    OrderID VARCHAR(15) PRIMARY KEY,
    ClientID VARCHAR(20),
    Amount BIGINT,
    ActiveAmount BIGINT,
    PayableInterest BigInt,
    RateOfInterest DECIMAL(5, 2),
    StartDate DATE,
    EndDate Date,
    Documents LONGBLOB,
    FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE
);
CREATE TABLE ClientLead (
    ClientName VARCHAR(30),
    Amount BIGINT,  
    Duration INT,
    PhoneNumber varchar(12),
    Collateral varchar(200)
);

CREATE TABLE InvestorLead (
    InvestorName VARCHAR(30),
    Amount BIGINT,
    PhoneNumber varchar(12)
);





create table OrderEMIHistory(
OrderId varchar(30),
ClientName varchar(20),
EMIDate date,
ActualEMI Bigint,
PaidEMI  int
)
select * from OrderEMIHistory

create table InvestmentEMIHistory(
InvestmentId varchar(30),
InvestorName varchar(30),
EMIDate date,
PaidEMI  Bigint
)
select * from InvestmentEMIHistory
drop table InvestmentEMIHistory

create table ClosedInvestments(
InvestmentID varchar(20),
InvestorName varchar(30),
Amount BigInt,
StartDate date,
ClosedDate date
)
drop table ClosedInvestments
select * from ClosedInvestments

create table ClosedOrders(
OrderID varchar(20),
ClientName varchar(30),
Amount BigInt,
StartDate date,
ClosedDate date
)

CREATE TABLE DueEMI (
    OrderID VARCHAR(10) ,
    IssuedDate DATE ,
    ClientName VARCHAR(30) ,
    OrderAmount BIGINT ,
    EMIDate DATE ,
    EMIAmount BIGINT ,
    PRIMARY KEY (OrderID, EMIDate,IssuedDate)
);
select * from DUEemi
create table ExtraExpenses(
reason varchar(100),
amount varchar(30),
Date date
)
select * from ExtraIncomes
create table ExtraIncomes(
reason varchar(100),
amount varchar(30),
Date date
)
SELECT SUM(CAST(Amount AS DECIMAL(20, 0))) AS total FROM ExtraExpenses

create table Users(
UserName varchar(20) Primary Key,
Password varchar(20),
PhoneNumber varchar(20),
Access int
)
select * from Users



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
            MONTH(EndDate) = MONTH(CURDATE()) 
            AND YEAR(EndDate) = YEAR(CURDATE());
    `;
select * from orders