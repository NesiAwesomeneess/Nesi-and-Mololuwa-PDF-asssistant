import mysql from 'mysql2/promise';

let mysqlconn = null;

export function mysqlconnFn() {
	if (!mysqlconn) {
		mysqlconn = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: '1N_Prayer5',
			database: 'thesis'
		});
	}

	return mysqlconn;
}
