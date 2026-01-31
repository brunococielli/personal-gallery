import { goBack } from "./utils.js"

const emailInp = document.getElementById("email")
const passwordInp = document.getElementById("password")
const registerBtn = document.getElementById("registerBtn")

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".backBtn").addEventListener("click", goBack)
})

const createUser = async () => {
	const email = emailInp.value
	const password = passwordInp.value

	emailInp.value = ""
	passwordInp.value = ""

	const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!isValidEmail.test(email)) return alert("Invalid email address!")

	try {
		const registerRes = await fetch("/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password })
		})

		if (!registerRes.ok) {
			const errorText = await registerRes.text()
			return alert(errorText)
		}

		const emailRes = await fetch("/send-email", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email })
		})

		if (!emailRes.ok) {
			const errorText = await emailRes.text()
			return console.error(errorText)
		}

		const message = await registerRes.text()
		alert(message)

	} catch (err) {
		console.error(err)
		alert("Network error or server offline")
	}
}

registerBtn.addEventListener("click", createUser)