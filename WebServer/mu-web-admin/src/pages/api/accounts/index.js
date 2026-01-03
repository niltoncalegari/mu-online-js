import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'mysql',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'muonline'
};

// Generate a random 14-digit sno__numb
function generateSnoNumb() {
  return Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // List all accounts
    try {
      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        'SELECT memb_guid, memb___id, bloc_code FROM MEMB_INFO ORDER BY memb_guid'
      );
      await connection.end();
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'Error fetching accounts', error: error.message });
    }
  } else if (req.method === 'POST') {
    // Create new account
    try {
      const { memb___id, memb__pwd } = req.body;
      
      if (!memb___id || !memb__pwd) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      if (memb___id.length > 11 || memb__pwd.length > 11) {
        return res.status(400).json({ message: 'Username and password must be 11 characters or less' });
      }

      const connection = await mysql.createConnection(dbConfig);
      const sno__numb = generateSnoNumb();
      
      await connection.execute(
        'INSERT INTO MEMB_INFO (memb___id, memb__pwd, sno__numb, bloc_code) VALUES (?, ?, ?, 0)',
        [memb___id, memb__pwd, sno__numb]
      );
      
      await connection.end();
      return res.status(201).json({ message: 'Account created successfully' });
    } catch (error) {
      console.error('Database error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Username already exists' });
      }
      return res.status(500).json({ message: 'Error creating account', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    // Delete account
    try {
      const { memb_guid } = req.body;
      
      if (!memb_guid) {
        return res.status(400).json({ message: 'Account ID is required' });
      }

      const connection = await mysql.createConnection(dbConfig);
      await connection.execute('DELETE FROM MEMB_INFO WHERE memb_guid = ?', [memb_guid]);
      await connection.end();
      
      return res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'Error deleting account', error: error.message });
    }
  } else if (req.method === 'PUT') {
    // Update account (password or block status)
    try {
      const { memb_guid, memb__pwd, bloc_code } = req.body;
      
      if (!memb_guid) {
        return res.status(400).json({ message: 'Account ID is required' });
      }

      const connection = await mysql.createConnection(dbConfig);
      
      if (memb__pwd !== undefined) {
        if (memb__pwd.length > 11) {
          return res.status(400).json({ message: 'Password must be 11 characters or less' });
        }
        await connection.execute(
          'UPDATE MEMB_INFO SET memb__pwd = ? WHERE memb_guid = ?',
          [memb__pwd, memb_guid]
        );
      }
      
      if (bloc_code !== undefined) {
        await connection.execute(
          'UPDATE MEMB_INFO SET bloc_code = ? WHERE memb_guid = ?',
          [bloc_code, memb_guid]
        );
      }
      
      await connection.end();
      return res.status(200).json({ message: 'Account updated successfully' });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'Error updating account', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

