import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import { mysqlconnFn } from '$lib/mysql';

import JSZip from 'jszip';
import {
	ConvertDocumentDirectRequest,
	ConvertApi,
	Configuration
} from 'groupdocs-conversion-cloud';

const config = new Configuration(
	'ce2f7e05-ca7e-4eef-943c-c146a265774b',
	'b9029f1c027cfa55a40cac42ac82d64a'
);

let serverData = {};
let pageData = {};

export async function load() {
	return pageData;
}

export const actions = {
	process: async ({ request }) => {
		const data = await request.formData();
		pageData.fullName = await data.get('fullName');
		pageData.faculty = await data.get('faculty');
		pageData.email = await data.get('email');
		const imagePages = await data.get('imagePages');

		const segmentCount = await data.get('segmentCount');
		const file = await data.get('pdfFile').arrayBuffer();

		const pdf = await PDFDocument.load(file);
		const imagePDF = await PDFDocument.load(file);
		// This is saved in the server filesystem
		serverData.source = await pdf.save();

		const pagesImage = imagePDF.getPages();
		const pages = pdf.getPages();

		//  REARRANGE PAGE
		// As pages move around this will cause a offset.
		let destination = 0;
		// Don't forget that the page numbers are one of the page index
		for (let i = 0; i < Number(segmentCount); i++) {
			insertPages(pdf, pages, data.get(`${i}`), data?.get(`${i}-end`));
		}
		// Remove excess pages.
		for (let i = 0; i < destination; i++) {
			let lastPageIndex = pdf.getPageCount() - 1;
			pdf.removePage(lastPageIndex);
		}

		// REMOVE PAGES WITHOUT IMAGES
		destination = 0;
		for (let i = 0; i < Number(imagePages); i++) {
			const pageNumber = await data.get(`imagePage-${i}`);

			const page = pagesImage[pageNumber - 1];
			const { height } = page.getSize();
			const helveticaFont = await imagePDF.embedFont(StandardFonts.Helvetica);
			page.drawText(`From Page ${pageNumber}`, {
				x: 20,
				y: height / 2 - 240,
				size: 36,
				font: helveticaFont,
				color: rgb(0.95, 0.1, 0.25)
			});
			insertPages(imagePDF, pagesImage, pageNumber);
		}

		// Remove excess pages.
		for (let i = 0; i < pagesImage.length; i++) {
			let lastPageIndex = imagePDF.getPageCount() - 1;
			imagePDF.removePage(lastPageIndex);
		}

		function insertPages(pdfDoc, pdfPages, start, end) {
			if (!start) {
				return;
			}

			if (!end) {
				end = start;
			}
			for (let i = start - 1; i < end; i++) {
				pdfDoc.insertPage(destination, pdfPages[i]);
				destination += 1;
			}
		}

		serverData.edited = await pdf.save();
		serverData.images = await imagePDF.save();
		// This is saved and sent back to the client to be viewed
		pageData.edited = await pdf.saveAsBase64({ dataUri: true });
		return { success: true };
	},
	submit: async ({ request }) => {
		const data = await request.formData();
		const thesisName = await data.get('thesisName');
		console.log('file process started');

		try {
			// Save filepath to the database
			let mysqlconn = await mysqlconnFn();
			try {
				let results = await mysqlconn
					.query(
						`INSERT INTO student_thesis (fullName, faculty, email, thesisName) 
					VALUES ('${pageData.fullName}', '${pageData.faculty}', '${pageData.email}', '${thesisName}');`
					)
					.then(function ([rows, fields]) {
						return rows;
					});
			} catch (error) {
				return { submitted: false, message: 'This Thesis has already been submitted' };
			}

			// Save in the files system
			await fs.writeFile('static/temp/temp.pdf', serverData.edited);
			const temp = await fs.readFile('static/temp/temp.pdf');

			const ask = new ConvertDocumentDirectRequest('docx', temp);
			const convertApi = new ConvertApi(config);
			console.log('awaiting API call');
			const result = await convertApi.convertDocumentDirect(ask);
			console.log('Word Document made');

			const zip = new JSZip();

			zip.file('Review-Document.docx', result);
			zip.file('Student-Submission.pdf', serverData.source);
			zip.file('Images-in-thesis.pdf', serverData.images);

			let zipData = await zip.generateAsync({ type: 'uint8array' });
			await fs.writeFile(`static/thesis/${thesisName}`, zipData);
		} catch (error) {
			return { submitted: false, message: 'Error compiling' };
		}

		return { submitted: true };
	}
};
