const express = require('express');
const mysql = require('mysql');
const path = require('path'); // Import path module to handle file paths
const app = express();
const port = 8080;

// MySQL adatbázis kapcsolat beállítása
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql',
  database: 'category'
});

connection.connect(err => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the MySQL server.');
  });
  
  // Statikus fájlok kiszolgálása
  app.use(express.static('public'));
  
  // Gyökér útvonal kezelése, hogy az index.html betöltődjön
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
  // Kategóriák lekérése és megjelenítése
  app.get('/categories', (req, res) => {
    connection.query('SELECT * FROM categories', (err, results) => {
      if (err) {
        console.error('Error fetching categories:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json(results);
    });
  });
  
  // Dinamikus kategória oldalak kezelése
  app.get('/category/:id', (req, res) => {
    const categoryId = req.params.id;
  
    // Fetch the specific category
    connection.query('SELECT * FROM categories WHERE id = ?', [categoryId], (err, categoryResults) => {
      if (err) {
        console.error('Error fetching category:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      if (categoryResults.length === 0) {
        res.status(404).send('Category not found');
        return;
      }
      const category = categoryResults[0];
  
      // Fetch all categories for the navigation menu
      connection.query('SELECT * FROM categories', (err, allCategories) => {
        if (err) {
          console.error('Error fetching categories:', err);
          res.status(500).send('Internal Server Error');
          return;
        }
  
        // Generate the navigation menu
        const navLinks = allCategories.map(cat => `<a href="/category/${cat.id}">${cat.name}</a>`).join(' ');
  
        // Send the HTML response
        res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${category.name}</title>
            <link rel="stylesheet" href="/style.css">
          </head>
          <body>
            <header>
              <h1>${category.name}</h1>
            </header>
            <nav id="menu">${navLinks}</nav>
            <div id="content">
              <p>${category.description}</p>
            </div>
          </body>
          </html>
        `);
      });
    });
  });
  
  // Szerver indítása
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });