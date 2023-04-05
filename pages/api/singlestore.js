import mysql from 'mysql2/promise';

//Modify the connection details to match the details specified while
//deploying the SingleStore workspace:
const HOST = 'admin_endpoint_of_the_workspace';
const USER = 'admin';
const PASSWORD = 'admin_password';
const DATABASE = 'name_of_the_database';

async function create({ conn, user }) {
  const [results] = await conn.execute(
    'INSERT INTO users (first_name, last_name, email, gender, country) VALUES (?, ?, ?, ?, ?)',
    [user.first_name, user.last_name, user.email, user.gender, user.country]
  );
  return results.insertId;
}

async function readN({ conn }) {
  const [rows] = await conn.execute(
    'SELECT first_name, last_name, country FROM users '
  );
  return rows;
}

async function updateN({ conn, country, first_name }) {
  await conn.execute('UPDATE users SET country = ? WHERE first_name = ?', [
    country,
    first_name,
  ]);
  const [upd] = await conn.execute('SELECT * FROM users WHERE first_name = ?', [
    first_name,
  ]);
  return upd[0];
}

export default async function handler(req, res) {
  let singleStoreConnection;
  try {
    singleStoreConnection = await mysql.createConnection({
      host: 'svc-a54ad217-6bf1-4ee3-a487-cf79a29b67b9-dml.aws-virginia-5.svc.singlestore.com',
      user: 'admin',
      password: 'Admin1234',
      database: 'singlestoredb',
    });

    // Create Operation
    const id = await create({
      conn: singleStoreConnection,
      user: {
        first_name: 'george2',
        last_name: 'moller',
        email: 'george@msn.com',
        gender: 'male',
        country: 'Uruguay'
      },
    });
    console.log(`Inserted row id is: ${id}`);

    // Read all users operation
    const rows = await readN({ conn: singleStoreConnection });
    if (rows == null) {
      console.log('No message entry with this ID.');
    } else {
      console.log(rows);
    }
    res.status(200).json({ users: rows });

    // Update user operation
    const i = await updateN({
      conn: singleStoreConnection,
      first_name: 'george2',
      country: 'Argentina',
    });
    console.log(`Updated row ${i.first_name}`);


    console.log('You have successfully connected to SingleStore.');
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    if (singleStoreConnection) {
      await singleStoreConnection.end();
    }
  }

  res.status(200).json({ name: 'John Doe' });
}
