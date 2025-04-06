const { query } = require('../models/userModel');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    const adminEmail = 'admin@example.com'; // Замените на нужный email
    const adminPassword = 'adminpassword'; // Замените на нужный пароль

    // Проверяем, существует ли уже администратор
    const existingAdmin = await query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    if (existingAdmin.rowCount > 0) {
      console.log('Администратор уже существует');
      return;
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Создаем администратора
    await query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
      ['admin', adminEmail, hashedPassword, 'admin']
    );

    console.log('Администратор успешно создан');
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
  } finally {
    process.exit();
  }
};

createAdmin();