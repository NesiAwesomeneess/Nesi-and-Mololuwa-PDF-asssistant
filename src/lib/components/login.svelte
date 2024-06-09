<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let firstName;
	let lastName;
	let faculty;
	let email;

	function Verify() {
		dispatch('login', {
			firstName,
			lastName,
			faculty,
			email
		});
	}
</script>

<body>
	<div class="container">
		<div class="welcome">
			<h1>ThesisRefine</h1>
		</div>

		<div class="loginbox">
			<form on:submit={Verify}>
				<input required bind:value={firstName} placeholder="First Name" />
				<input required bind:value={lastName} placeholder="Last Name" />
				<input required bind:value={faculty} placeholder="Faculty" />
				<input required bind:value={email} placeholder="Email Address" />
				<button class="proceed" type="submit">Proceed</button>
			</form>
		</div>
	</div>
</body>

<style>
	h1 {
		margin: 0;

		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
		font-size: 36px;
		color: black;
		position: absolute;
		/* Elements with a higher z-index value are displayed in front of elements with lower z-index values.  */
		z-index: 1;
		text-shadow: 3px 4px 12px rgba(167, 151, 165, 0.8);
		justify-self: center;
		align-self: center;
	}

	body {
		display: grid;
		justify-items: center;
		align-items: center;

		width: 100vw;
		min-height: 100vh;
		margin: 0;
		background-image: linear-gradient(-20deg, #f3edfb 0%, #feffed 100%);
	}

	.container {
		display: grid;
		grid-template-columns: 1fr 1fr;

		height: 60%;
		min-height: 400px;

		width: 75%;
		max-width: 900px;

		justify-self: center;

		overflow: hidden;
		border-radius: 12px;
		box-shadow: 3px 4px 12px rgba(82, 82, 82, 0.432);
	}

	.welcome {
		display: grid;
		justify-content: center;
		background-color: rgba(255, 255, 255, 0.5);
	}

	.loginbox {
		background-color: rgba(255, 255, 255, 0.5);
	}
	.loginbox:last-child {
		justify-content: center;
		align-content: center;
		background-color: white;
	}

	input {
		padding: 12px;
		margin: 12px;
		border-style: none;
		border-bottom: 1px solid grey;
		position: relative;
		bottom: 28px;
	}

	.proceed {
		position: relative;
		left: 12px;
		top: 16px;
		width: 220px;
		padding: 8px;
		border-radius: 8px;
		border-style: none;
	}
</style>
