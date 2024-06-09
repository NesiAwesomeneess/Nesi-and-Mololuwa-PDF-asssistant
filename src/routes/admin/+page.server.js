import { mysqlconnFn } from '$lib/mysql';
import transporter from '$lib/emailSetup.server';
import fs from 'fs/promises';

export async function load() {
	let mysqlconn = await mysqlconnFn();
	let results = await mysqlconn
		// This is the grab a list of all submitted thesis
		.query('SELECT * FROM student_thesis')
		.then(function ([rows, fields]) {
			return rows;
		});

	return { submissions: results };
}

export const actions = {
	correct: async ({ request }) => {
		let mysqlconn = await mysqlconnFn();

		const formData = await request.formData();
		const appointmentDate = await formData.get('date');
		const appointmentTime = await formData.get('time');

		const thesisName = await formData.get('thesisName');
		const fileName = `Corrections for ${thesisName.substring(0, thesisName.length - 4)}.docx`;

		// Sending the email.
		try {
			const email = await formData.get('email');
			const correction = await formData.get('correction').arrayBuffer();
			const correctionData = new Uint8Array(correction);

			// save the correction to the data base.
			await fs.writeFile(`static/corrections/${fileName}`, correctionData);

			const message = {
				to: email,
				attachments: [
					{
						filename: fileName,
						content: correctionData,
						contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
					}
				],

				subject: 'Thesis Corrections',
				text: 'Lerum Something...',
				html: `<h2>Hello This is to inform you that your Thesis submission has been reviewed. <br/>
				Attached to this email is a Word document containing some corrections.</h2> <br/>
				Appointment Date: ${appointmentDate} <br/>
				Appointment Time: ${appointmentTime}`
			};

			const sendEmail = async (message) => {
				await new Promise((resolve, reject) => {
					transporter.sendMail(message, (err, info) => {
						if (err) {
							console.log(err);
							reject(err);
						} else {
							resolve(info);
						}
					});
				});
			};

			await sendEmail(message);
		} catch (error) {
			console.log(error);
		}

		// Update the database...
		console.log(thesisName);

		try {
			let result = await mysqlconn
				.query(
					`UPDATE student_thesis 
					SET correctionName='${fileName}', appointmentDate='${appointmentDate}', appointmentTime='${appointmentTime}' 
					WHERE thesisName='${thesisName}';`
				)
				.then(function ([rows, fields]) {
					return rows;
				});
		} catch (error) {
			return { submitted: false, message: 'This Thesis has already been submitted' };
		}
	}
};
