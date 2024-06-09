<script>
	import LoginPage from '$lib/components/login.svelte';
	import { PDFDocument } from 'pdf-lib';
	import { slide, fly } from 'svelte/transition';

	// Data about the form action
	export let form;
	if (!form) {
		form = { submitted: false };
	}

	// Data coming from the server
	export let data;
	let editedThesis = data.edited;
	let fullName = data.fullName;
	let faculty = data.faculty;
	let email = data.email;

	const thesisName = `Thesis by ${data.fullName} from ${data.faculty}`;

	let files;
	let pdfFile;
	let fileName;

	let pageCount = 0;

	let pdfLoaded = false;
	let clicked = false;

	async function processThesis() {
		fileName = files[0].name;
		const file = await files[0].arrayBuffer();
		pdfFile = await PDFDocument.load(file);
		pageCount = pdfFile.getPageCount();
		pdfLoaded = true;
	}

	let pagesWithImages = [];

	let entries = [
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

	let i;
	let imagePageInput;
</script>

<svelte:head>
	<title>Thesis Submission</title>
</svelte:head>

{#if fullName}
	<main>
		<!-- This is going to be a dialogue box -->
		{#if editedThesis}
			<form
				class="submission"
				method="post"
				action="?/submit"
				on:submit={() => {
					clicked = true;
				}}
			>
				<input type="hidden" value={`${thesisName}.zip`} name="thesisName" />
				<span>{thesisName}</span>

				{#if !form.submitted}
					<a href={data.edited} download={`${thesisName}.pdf`}>Click Here to Preview </a>
					{#if clicked}
						<button class="buttons pending" disabled>Submitting...</button>
					{:else}
						<button class="buttons" type="submit">Submit</button>
					{/if}
				{:else}
					<button class="buttons success" disabled>Submitted!</button>
				{/if}

				<span>{form.message || ''}</span>
			</form>
		{:else}
			<form class="thesis-form" method="post" enctype="multipart/form-data" action="?/process">
				<input type="hidden" name="fullName" value={fullName} />
				<input type="hidden" name="faculty" value={faculty} />
				<input type="hidden" name="email" value={email} />

				<label
					transition:slide={{ axis: 'y' }}
					for="thesis-upload"
					class={pdfFile ? 'upload ed' : 'upload'}
				>
					{files ? 'Click here to select a different Thesis' : 'Upload Your Thesis Here'}
				</label>

				<input
					id="thesis-upload"
					bind:files
					on:change={processThesis}
					type="file"
					name="pdfFile"
					accept=".pdf"
				/>

				{#if pageCount > 0}
					<div transition:slide={{ axis: 'y' }} class="thesis-details">
						<span>{fileName}</span>
						<span>{`${pageCount} pages`}</span>
					</div>
					<div transition:slide={{ axis: 'y' }} class="thesis-info">
						<div>
							<label for="instruction">Instructions</label>
							<p id="instruction" class="instruction">
								<strong>Do not use personalised page numbers.</strong> Use the page numbers shown in
								a typical pdf reader. Click the checkbox<input
									class="ranged"
									type="checkbox"
								/>signify that the specified content is contained in more than one page.
							</p>
						</div>

						{#each entries as entry, index}
							<div>
								<label for={entry.id}
									>{entry.label}
									<div class="input">
										<input
											id={entry.id}
											name={index}
											type="number"
											placeholder={entry.ranged ? 'from page' : 'in page'}
											bind:value={entry.page}
											on:change={() => {
												// Remove the value if the input is invalid.
												if (entry.page > pageCount || entry.page < 1) {
													entry.page = null;
												}
											}}
										/>
										{#if entry.ranged}
											<input
												on:visibilitychange={() => (entry.end = null)}
												transition:slide={{ axis: 'x' }}
												id={entry.id}
												name={index + '-end'}
												placeholder="to page"
												type="number"
												bind:value={entry.end}
												on:change={() => {
													// Remove the value if the input is invalid.
													if (entry.end > pageCount || entry.end < 1 || entry.end < entry.page) {
														entry.end = null;
													}
												}}
											/>
										{/if}

										<input class="ranged" type="checkbox" bind:checked={entry.ranged} />
									</div>
								</label>
								{#if entry.description}
									<p class="description">{entry.description}</p>
								{/if}
							</div>
						{/each}

						<div class="image-pages">
							<input type="hidden" value={pagesWithImages.length} name="imagePages" />

							<span>What Page Contains Images</span>
							<p class="description">Provide us with a list of page numbers that contain images</p>
							<div class="pages">
								{#each pagesWithImages as page, index}
									<div class="image-page" transition:fly={{ x: -10 }}>
										Page {page.value}
										<button
											class="close"
											type="button"
											on:click={() => {
												pagesWithImages = pagesWithImages.filter((page) => page.id != index);
											}}>×</button
										>
										<input type="hidden" name={`imagePage-${index}`} bind:value={page.value} />
									</div>
								{/each}
								<input
									type="number"
									bind:value={i}
									bind:this={imagePageInput}
									on:focus={() => {
										imagePageInput.required = true;
									}}
									on:blur={() => {
										imagePageInput.required = false;
									}}
									on:change={() => {
										if (i < 1) {
											return;
										}

										let pageNumber = {
											id: pagesWithImages.length,
											value: i
										};

										pagesWithImages = [...pagesWithImages, pageNumber];
										i = null;
									}}
								/>
							</div>
						</div>
					</div>

					<button class="buttons" type="submit">Process</button>
					<input type="hidden" name="segmentCount" value={entries.length} />
				{/if}
			</form>
		{/if}
	</main>
{:else}
	<LoginPage
		on:login={({ detail }) => {
			fullName = `${detail.firstName} ${detail.lastName}`;
			faculty = detail.faculty;
			email = detail.email;
		}}
	/>
{/if}

<style>
	main {
		position: absolute;
		display: grid;

		top: 0;
		left: 0;
		margin: 0;

		width: 100vw;
		min-height: 100vh;

		background: white;
		font-family: Montserrat;
	}

	input[type='number']::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}

	.close {
		position: relative;
		top: 1px;
		left: 8px;
		font-size: 18px;
		font-weight: bolder;

		color: rgb(243, 248, 255);
		border: none;
		background: none;
	}

	.image-page {
		display: flex;
		align-items: center;
		font-size: 16px;

		color: rgb(243, 248, 255);
		padding: 4px 16px;

		border-radius: 24px;
		background-color: rgba(35, 125, 235, 0.884);
	}

	.submission {
		display: grid;
		margin: 16px;
	}

	.submission a {
		padding: 8px 0;
	}

	.instruction {
		font-size: 16px;
		margin: 8px 0 8px;

		line-height: 1.5rem;
		justify-self: center;
	}

	.instruction input {
		position: relative;
		top: 1px;
		margin: 0 4px;
	}

	.thesis-form {
		display: grid;
		grid-auto-flow: row;

		justify-content: center;
		justify-self: center;

		padding: 1.5rem;

		max-width: 800px;
		font-weight: 500;
	}

	.thesis-details {
		display: grid;
		grid-auto-flow: column;

		padding: 8px 16px;

		color: rgba(0, 0, 0, 0.295);
		font-style: italic;
		font-size: 0.75rem;
	}

	.thesis-details span:last-child {
		justify-self: end;
	}

	.thesis-info {
		display: grid;
		gap: 16px;

		padding: 1.5rem 0.5rem;
	}

	input[type='file'] {
		display: none;
	}

	.upload {
		display: grid;
		gap: 16px;

		justify-items: center;

		font-weight: 500;

		padding: 16px;

		max-height: 18px;

		color: rgba(52, 51, 47, 0.644);
		background-color: rgba(238, 248, 250, 0.372);

		border: 2px dashed rgba(0, 0, 0, 0.491);
		border-radius: 16px;
		cursor: pointer;
	}

	.upload.ed {
		background-color: rgba(155, 155, 155, 0.406);
	}

	.thesis-info label {
		display: grid;
		font-size: 1.25rem;
		grid-auto-flow: column;
		grid-template-columns: 1fr auto auto;

		align-items: center;
		width: 100%;
	}

	.input {
		display: grid;
		grid-auto-flow: column;
		gap: 8px;

		justify-self: end;
		justify-items: center;

		border-radius: 16px;
		padding: 4px 8px;

		border: 2px solid rgba(205, 205, 206, 0.737);
		overflow: hidden;
	}

	.input input[type='number'] {
		color: rgba(0, 0, 0, 0.779);

		width: 4rem;
		height: 1.25rem;
		padding: 8px;

		background: none;
		border-style: none;

		border-right: 2px dashed rgba(0, 0, 0, 0.187);
		cursor: pointer;
	}

	.input input[type='number']:focus-visible {
		border-right: 2px dashed rgba(0, 0, 0, 0.187);
		outline-style: none;
	}

	.ranged {
		width: 16px;
		margin-right: 8px;
	}

	.description {
		font-size: 0.75rem;
		margin: 0;
		margin-top: 16px;

		line-height: 1.125rem;
	}

	.pages {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;

		margin-top: 8px;
		max-width: 100%;
	}

	.pages input {
		justify-items: center;

		padding: 0;
		margin: 0;

		color: rgba(0, 0, 0, 0.779);
		background: none;

		border-style: none;
		border-bottom: 2px solid rgb(0, 0, 0);

		padding: 0 8px;
		height: 32px;
	}

	.pages input:focus {
		outline: none;
	}

	.image-pages {
		margin: 8px 0;
	}

	.buttons {
		font-family: Montserrat;
		font-size: 1rem;
		font-weight: 500;
		padding: 1rem;

		margin-top: 1rem;
		margin-bottom: 32px;

		border-radius: 16px;
		border-style: none;

		color: rgb(243, 248, 255);
		background-color: rgba(35, 125, 235, 0.884);
		cursor: pointer;
	}

	.success {
		cursor: default;
		background-color: rgba(54, 203, 109, 0.884);
	}

	.pending {
		cursor: default;
		background-color: rgba(147, 152, 149, 0.884);
	}
</style>
