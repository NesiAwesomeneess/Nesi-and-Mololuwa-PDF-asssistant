import fs from 'fs/promises';

export async function POST({ request }) {
	const { st } = await request.json();
	try {
		const zipData = await fs.readFile(`static/thesis/${st}`);
		return new Response(zipData, {
			status: 200,
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': 'attachement; filename=dummy.zip'
			}
		});
	} catch (error) {
		console.log('Retrival Error', error);
	}
}
