const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "database.db");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Статические файлы (HTML, CSS, JS)
app.use(express.static(__dirname));

// Инициализация базы данных при первом запуске
if (!fs.existsSync(DB_PATH)) {
  console.log("База данных не найдена. Запустите: npm run init-db");
}

// Подключение к базе данных
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err.message);
  } else {
    console.log("Подключено к базе данных SQLite");
  }
});

// API: Сохранение заявки
app.post("/api/requests", (req, res) => {
  const {
    orgType,
    orgName,
    city,
    participants,
    age,
    preferredFormat,
    date,
    contact,
    email,
    comment,
  } = req.body;

  // Валидация обязательных полей
  if (!orgName || !orgName.trim()) {
    return res.status(400).json({
      success: false,
      error: "Название организации обязательно для заполнения",
    });
  }

  // Сохранение в базу данных
  const sql = `INSERT INTO requests (
    org_type, org_name, city, participants, age_group, 
    preferred_format, preferred_date, contact_person, 
    email, comment, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;

  db.run(
    sql,
    [
      orgType || null,
      orgName.trim(),
      city ? city.trim() : null,
      participants ? parseInt(participants) : null,
      age || null,
      preferredFormat || null,
      date ? date.trim() : null,
      contact ? contact.trim() : null,
      email ? email.trim() : null,
      comment ? comment.trim() : null,
    ],
    function (err) {
      if (err) {
        console.error("Ошибка при сохранении заявки:", err);
        return res.status(500).json({
          success: false,
          error: "Не удалось сохранить заявку. Попробуйте позже.",
        });
      }

      res.json({
        success: true,
        message: "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.",
        id: this.lastID,
      });
    }
  );
});

// API: Получение списка заявок (для администратора, можно добавить авторизацию)
app.get("/api/requests", (req, res) => {
  const sql = `SELECT * FROM requests ORDER BY created_at DESC LIMIT 100`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Ошибка при получении заявок:", err);
      return res.status(500).json({
        success: false,
        error: "Не удалось получить заявки",
      });
    }

    res.json({
      success: true,
      data: rows,
    });
  });
});

// Главная страница
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error("Ошибка сервера:", err);
  res.status(500).json({
    success: false,
    error: "Внутренняя ошибка сервера",
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Ошибка при закрытии базы данных:", err.message);
    } else {
      console.log("База данных закрыта");
    }
    process.exit(0);
  });
});
