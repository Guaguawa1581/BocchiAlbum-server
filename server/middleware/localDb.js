const { defaultMaxListeners } = require('nodemailer/lib/xoauth2');

const sqlite3 = require('sqlite3').verbose();

class SQLDatabase {
  constructor(dbPath = './database/mydatabase.db') {
    this.dbPath = dbPath;
    this.instance = null;
    this.db = null;

  }

  initDatabase(cb) {
    this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        if (cb) cb(err);
      } else {
        console.log('Connected to the SQLite database.');
        this.enableForeignKeySupport(cb);
      }
    });
  }

  enableForeignKeySupport(cb) {
    // 啟用外鍵

    this.db.run("PRAGMA foreign_keys = ON;", (err) => {
      if (err) {
        console.error('Error enabling foreign key support:', err.message);
        if (cb) cb(err);
        return;
      }
      console.log('Foreign key support enabled.');

      // 现在启用外键支持后，继续创建表
      this.createTable(cb);
    });
  }

  createTable(cb) {
    // 'users'表
    const sqlUsers = `
        CREATE TABLE IF NOT EXISTS users (
            sid INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            username TEXT NOT NULL,
            avatar TEXT,
            created_at INTEGER NOT NULL,
            reset_token TEXT,
            reset_token_exp INTEGER,
            UNIQUE (user_id),
            UNIQUE (email),
            UNIQUE (reset_token)
        );
    `;

    // 'cards'表
    const sqlCards = `
        CREATE TABLE IF NOT EXISTS cards (
            card_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            image_url TEXT NOT NULL,
            is_public INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            PRIMARY KEY (card_id),
            FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `;

    // 先建User
    this.db.run(sqlUsers, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
        if (cb) cb(err);
        return;
      }
      console.log('Users table is ready.');

      // 後card
      this.db.run(sqlCards, (err) => {
        if (err) {
          console.error('Error creating cards table:', err.message);
          if (cb) cb(err);
          return;
        }
        console.log('Cards table is ready.');

        // 如果都成功了，调用回调无错误
        if (cb) cb(null);
      });
    });
  }


  executeSQL(cb) {
    // this.db.run(sql, params, function (err, row) {
    //   callback(this, err, row);
    //   // if (err) {
    //   //   console.log("eeeeeeeeee", err);
    //   //   console.error('Error executing SQL:', err.message);
    //   //   if (callback) callback(err, null);
    //   // } else {
    //   //   console.log('SQL executed successfully');
    //   //   if (callback) callback(null, { id: this.lastID, changes: this.changes });
    //   // }
    // });

    this.db.all("SELECT * FROM users", [], (err, row) => {
      if (cb) cb({ err, row });
    });
  }

  closeDatabase() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SQLDatabase();
    }
    return this.instance;
  }
}

module.exports = SQLDatabase.getInstance();