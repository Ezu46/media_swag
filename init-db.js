const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "database.db");

// Удаляем существующую базу данных, если нужно пересоздать
if (fs.existsSync(DB_PATH)) {
  console.log("База данных уже существует. Удаляю старую версию...");
  fs.unlinkSync(DB_PATH);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Ошибка при создании базы данных:", err.message);
    process.exit(1);
  } else {
    console.log("База данных создана успешно");
  }
});

// Создание таблицы заявок
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_type TEXT,
      org_name TEXT NOT NULL,
      city TEXT,
      participants INTEGER,
      age_group TEXT,
      preferred_format TEXT,
      preferred_date TEXT,
      contact_person TEXT,
      email TEXT,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error("Ошибка при создании таблицы:", err.message);
        process.exit(1);
      } else {
        console.log("Таблица 'requests' создана успешно");
      }
    }
  );

  // Создание индекса для быстрого поиска по дате
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_created_at ON requests(created_at)`,
    (err) => {
      if (err) {
        console.error("Ошибка при создании индекса:", err.message);
      } else {
        console.log("Индекс создан успешно");
      }
    }
  );

  db.close((err) => {
    if (err) {
      console.error("Ошибка при закрытии базы данных:", err.message);
      process.exit(1);
    } else {
      console.log("База данных инициализирована. Можно запускать сервер: npm start");
      process.exit(0);
    }
  });
});
