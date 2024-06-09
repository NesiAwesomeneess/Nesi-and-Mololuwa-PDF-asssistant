<script>
	let pageName = 'Admin';

	export let data;
	let submissions = data.submissions;

	let files;

	async function getThesis(st) {
		const response = await fetch('/api/thesis', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ st })
		});

		let blob = await response.blob();
		var url = window.URL || window.webkitURL;
		let link = url.createObjectURL(blob);

		var a = document.createElement('a');
		document.body.append(a);
		a.download = st;
		a.href = link;
		a.click();
		a.remove();
	}

	let studentDetails;

	function reset() {
		studentDetails = null;
		files = null;
		date = null;
		time = null;
	}

	let submitButton;
	let date;
	let time;

	$: if (submitButton && date && time) {
		submitButton.disabled = false;
	}

	let v;
</script>

<svelte:head>
	<title>{pageName} Page</title>
</svelte:head>

<body>
	<div class="box">
		<h1>Thesis Submissions Manager</h1>
		<table>
			<tr>
				<th style="color: white">Student</th>
				<th style="color: white">Date of Appointment</th>
				<th style="color: white">Time of Appointment</th>
			</tr>

			{#if submissions.length < 1}
				<span>No Submissions Yet</span>
			{/if}

			{#each submissions as submission}
				<tr class="student">
					<button
						class="interact"
						on:click={() => {
							studentDetails = submission;
						}}>{submission.fullName} - {submission.faculty}</button
					>
					{#if submission.appointmentDate}
						<td>{submission.appointmentDate.toLocaleDateString('en-UK')}</td>
						<td>{submission.appointmentTime.substring(0, submission.appointmentTime.length - 3)}</td
						>
					{:else}
						<span>Pending Review</span>
					{/if}
				</tr>
			{/each}
		</table>
	</div>

	{#if studentDetails}
		<div class="menu-cover"></div>
		<div class="menu-holder">
			<button class="close" on:click={reset}>×</button>

			<form class="menu" method="post" action="?/correct" enctype="multipart/form-data">
				<input name="thesisName" type="hidden" bind:value={studentDetails.thesisName} />
				<input name="email" type="hidden" bind:value={studentDetails.email} />

				<h2 class="student">
					{studentDetails.fullName} from the faculty of {studentDetails.faculty}
				</h2>

				<button
					class="preview interact"
					type="button"
					on:click={() => {
						getThesis(studentDetails.thesisName);
					}}>Review Thesis</button
				>

				{#if studentDetails.appointmentDate}
					<span>Correction Submitted.</span>
				{:else}
					<label for="correction-upload" class="interact"
						>{files ? 'Change Correction' : 'Upload Correction'}
					</label>
					<input id="correction-upload" bind:files type="file" name="correction" accept=".docx" />

					{#if files}
						<div class="submit">
							<label>Date of Appointment<input type="date" name="date" bind:value={date} /></label>
							<label>Time of Appointment<input type="time" name="time" bind:value={time} /></label>
							<label
								>Notes <input
									type="text"
									placeholder="This will be attached to the email."
								/></label
							>
							<div>
								<span>{files[0].name}</span>
								<button type="submit" bind:this={submitButton} class="interact" disabled
									>Submit Correction</button
								>
							</div>
						</div>
					{/if}
				{/if}
			</form>
		</div>
	{/if}
</body>

<style>
	* {
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
		user-select: none;
		cursor: default;
	}

	table {
		width: 100%;

		border: 1px solid #ddd;
		border-collapse: collapse;
	}

	table tr:nth-child(even) {
		background-color: rgb(236, 236, 236);
	}

	th {
		text-align: left;
		border: none;

		padding: 8px 16px;
		font-weight: bold;

		background-color: rgb(0, 0, 0);
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
	}

	td {
		text-align: center;
		border: none;

		padding: 4px 8px;
		font-weight: normal;

		color: rgb(0, 0, 0);
		border-right: 1px solid #d7d7d7;
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
	}

	.submit {
		display: flex;
		flex-direction: column;
		gap: 12px;

		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px dashed rgba(0, 0, 0, 0.491);
	}

	.submit label,
	input {
		cursor: pointer;
		display: grid;
	}

	.submit span {
		font-size: 14px;
		color: rgba(0, 0, 0, 0.584);
	}

	.menu-holder {
		display: flex;
		flex-direction: column;

		position: absolute;

		justify-self: center;
		align-self: center;

		margin-bottom: 24px;
		width: 50%;

		padding: 0;
	}

	.menu-cover {
		width: 100vw;
		height: 100vh;

		position: absolute;
		background-color: rgba(0, 0, 0, 0.18);
	}

	.close {
		align-self: flex-end;
		font-weight: 600;

		position: relative;
		background: rgba(255, 0, 0, 0.247);
		border: none;

		border-radius: 50%;
		width: 24px;
		height: 24px;

		z-index: 3;

		margin-right: 8px;
		top: 32px;

		cursor: pointer;
	}

	.menu {
		z-index: 2;
		display: grid;
		gap: 8px;

		border-radius: 8px;

		padding: 32px;

		background-color: rgb(255, 255, 255);
		box-shadow: 3px 3px 3px rgba(42, 37, 37, 0.1);
	}

	input[type='file'] {
		display: none;
	}

	.student {
		font-size: 16px;
		margin: 0;
		margin-bottom: 8px;
	}

	.student button {
		width: 40ch;
		padding: 8px;

		border: none;
		border-radius: 0;
	}

	.student button:hover {
		background-color: rgb(255, 255, 255);
	}

	.interact {
		display: grid;
		margin: 0;

		justify-self: center;
		justify-items: center;

		font-size: 16px;
		line-height: 28px;

		cursor: pointer;
		border: 1px solid rgba(0, 0, 0, 0.491);
		border-radius: 8px;

		width: 100%;
		background-color: rgba(231, 231, 231, 0.372);
	}

	h1 {
		font-size: 24px;
		text-align: justify;
		color: rgb(64, 64, 64);
	}

	.box {
		display: grid;

		border-radius: 8px;

		align-self: center;
		justify-self: center;

		padding: 32px 32px;
		max-height: 900px;

		background-color: rgb(255, 255, 255);
		box-shadow: 3px 3px 3px rgba(42, 37, 37, 0.1);
	}

	.box h1 {
		margin: 0;
		margin-bottom: 16px;
	}

	body {
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;

		width: 100vw;
		height: 100vh;

		min-height: 100vh;

		margin: 0;
		background-attachment: fixed;
		background-color: hsl(209, 36%, 86%);
		background-size: 100vw 100vh;
		background-image: radial-gradient(
				50% 50% at 50% 50%,
				rgba(255, 255, 255, 0.75) 0%,
				rgba(255, 255, 255, 0) 100%
			),
			linear-gradient(180deg, rgb(202, 216, 228) 0%, hsl(209, 36%, 86%) 15%, hsl(224, 44%, 95%) 50%);
	}

	.preview {
		cursor: pointer;
	}
</style>
