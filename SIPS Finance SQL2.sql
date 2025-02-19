Share


You said:
CREATE TABLE Investors (
    InvestorID VARCHAR(15) PRIMARY KEY,
    InvestorName VARCHAR(30) NOT NULL ,
    AmountInvested BIGINT NOT NULL,
    PhoneNumber CHAR(10),
    Image varchar(225)
);
select * from investors
drop table investors
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
drop table investments
CREATE TABLE Clients (
    ClientID VARCHAR(20) PRIMARY KEY,
    ClientName VARCHAR(30) NOT NULL,
    TotalAmount BIGINT NOT NULL,
    AddressAndOccupation VARCHAR(100),
    PhoneNumber CHAR(10),
    Aadhar VARCHAR(12),
    AadharCard varchar(225),
    Pan VARCHAR(10),
    PanCard varchar(225),
    Image varchar(225),
    Comments VARCHAR(100)
);select * from clients
CREATE TABLE Orders (
    OrderID VARCHAR(15) PRIMARY KEY,
    ClientID VARCHAR(20),
    Amount BIGINT,
    ActiveAmount BIGINT,
    PayableInterest BigInt,
    RateOfInterest DECIMAL(5, 2),
    StartDate DATE,
    EndDate Date,
    Documents varchar(225),
    FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE
);
drop table orders
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
    RemainingEMI BigINT,
    PRIMARY KEY (OrderID, EMIDate,IssuedDate)
);
drop table DueEMI
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
Password varchar(220),
Email varchar(50),
PhoneNumber varchar(20),
Access int
)