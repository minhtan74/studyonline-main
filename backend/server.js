const app = require('./app');
const sequelize = require('./config/database');
const appConfig = require('./config/app');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối cơ sở dữ liệu MySQL thành công.');
  } catch (e) {
    console.error('❌ Lỗi kết nối cơ sở dữ liệu:', e.message);
    process.exit(1);
  }

  app.listen(appConfig.port, () => {
    console.log(`🚀 StudyOnline API đang chạy tại http://localhost:${appConfig.port}`);
    console.log(`📚 Swagger docs: http://localhost:${appConfig.port}/api-docs`);
  });
}

start();
