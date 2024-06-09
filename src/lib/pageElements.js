export let entries = [
	PageInfo(
		'Title',
		'title',
		`This is the first page and doesn't have a number. 
    It prominently displays the title of your thesis, your name, your degree information (e.g., Master of Arts), 
    the institution's name, and the year of submission.`
	),
	PageInfo(
		'Certification',
		'certification',
		`This page, typically required by universities, 
    confirms that the thesis adheres to the institution's guidelines and has been approved by the advisor(s) 
    and committee members. It may include signatures and titles of those involved.`
	),
	PageInfo(
		'Dedication',
		'dedication',
		`A heartfelt note expressing gratitude to individuals 
    or entities who provided significant support during your thesis journey. This could be family, professors, 
    mentors, or funding institutions.`
	),
	PageInfo(
		'Acknowledgements',
		'acknowledgement',
		`This page extends thanks to a wider 
    range of people who contributed to your research. It acknowledges those who offered guidance, 
    support, or resources that aided your work, even if their role wasn't directly related to the 
    thesis itself.`
	),
	PageInfo(
		'Abstract',
		'abstract',
		`This is a concise summary of your entire thesis. 
    It highlights the research question, methodology, key findings, and main conclusion. 
    The abstract is crucial for readers to grasp the essence of your work and decide
    if they want to delve deeper.`
	),
	PageInfo(
		'Table of Contents',
		'toc',
		`This page outlines the structure of your thesis, listing all chapters, 
    subheadings, and their corresponding page numbers. It allows readers to easily 
    navigate and find specific sections of interest.`
	),
	PageInfo(
		'Table of Figures',
		'tof',
		`Similar to the list of tables, this page lists all figures (charts, graphs, images) used in your 
        thesis. It includes figure titles and corresponding page numbers, aiding readers in finding 
        visual representations of your research.`
	),
	PageInfo(
		'Main Body',
		'mbs',
		`The form of presentation may vary with the subject matter and
    the discipline. However, it is expected that it will be made up of the following Chapters in
    the order give.`,
		true
	)
];

function PageInfo(label, id, description, ranged, page, end) {
	return {
		label,
		id,
		description,
		ranged,
		page,
		end
	};
}
