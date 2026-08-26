const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'viaitalia'
});

async function createTimeSlotTable() {
  try {
    // First check if table already exists
    const checkTableSQL = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'viaitalia' AND table_name = 'TimeSlot'
    `;
    
    const [result] = await new Promise((resolve, reject) => {
      connection.query(checkTableSQL, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    const tableExists = result[0][0].count > 0;
    
    if (tableExists) {
      console.log('TimeSlot table already exists');
      return;
    }
    
    const sql = `
      CREATE TABLE TimeSlot (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATETIME NOT NULL,
        startTime VARCHAR(10) NOT NULL,
        endTime VARCHAR(10) NOT NULL,
        maxBookings INT DEFAULT 1,
        currentBookings INT DEFAULT 0,
        isAvailable BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Creating TimeSlot table...');
    
    await new Promise((resolve, reject) => {
      connection.query(sql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          console.log('TimeSlot table created successfully!');
          resolve(results);
        }
      });
    });
    
  } catch (error) {
    console.error('Error creating TimeSlot table:', error);
  } finally {
    connection.end();
  }
}

createTimeSlotTable();
