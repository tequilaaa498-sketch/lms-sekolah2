const mariadb = require('mariadb');

async function main() {
  const pool = mariadb.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'coquette',
    connectionLimit: 5,
  });

  try {
    const conn = await pool.getConnection();
    console.log('✅ Konek berhasil!');
    const rows = await conn.query('SELECT 1 as test');
    console.log(rows);
    conn.release();
  } catch (err) {
    console.error('❌ Gagal konek:', err);
  } finally {
    await pool.end();
  }
}

main();