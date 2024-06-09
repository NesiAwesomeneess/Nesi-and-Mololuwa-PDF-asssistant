import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: 'molouwaolapegba@gmail.com',
		pass: 'sspqtilbbamknebn'
	}
});

transporter.verify(function (error, success) {
	if (error) {
		console.error(error);
	} else {
		console.log('Server ready');
	}
});

export default transporter;
