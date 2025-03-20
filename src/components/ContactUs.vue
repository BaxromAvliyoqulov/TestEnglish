<template>
	<div class="contact-container">
		<h2>Contact Us</h2>
		<form @submit.prevent="sendMessage" class="contact-form">
			<div class="form-group">
				<label for="name">Name</label>
				<input type="text" id="name" v-model="name" required />
			</div>
			<div class="form-group">
				<label for="message">Message</label>
				<textarea id="message" v-model="message" rows="4" required></textarea>
			</div>
			<button type="submit">Send Message</button>
		</form>
	</div>
</template>

<script>
	import { ref } from "vue";

	export default {
		name: "ContactUs",
		setup() {
			const name = ref("");
			const message = ref("");
			const TELEGRAM_BOT_TOKEN = "7822484855:AAGH184pXq1-8MyzmPwPl1FO1GA6ooJybRE";
			const TELEGRAM_CHAT_ID = "587788509";

			const sendMessage = async () => {
				try {
					const text = `New message from: ${name.value}\n\nMessage: ${message.value}`;
					const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							chat_id: TELEGRAM_CHAT_ID,
							text: text,
						}),
					});

					if (response.ok) {
						alert("Message sent successfully!");
						name.value = "";
						message.value = "";
					} else {
						throw new Error("Failed to send message");
					}
				} catch (error) {
					console.error("Error sending message:", error);
					alert("Failed to send message. Please try again.");
				}
			};

			return {
				name,
				message,
				sendMessage,
			};
		},
	};
</script>

<style scoped>
	.contact-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
	}

	.contact-form {
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.form-group {
		margin-bottom: 1rem;
	}

	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		resize: vertical;
	}
</style>
