import { goLogInPage, goRegisterPage } from "./utils.js"

const readmeBtn = document.getElementById("readmeBtn")
const readmeModal = document.getElementById("readmeModal")
const closeReadme = document.getElementById("closeReadme")

document.addEventListener("DOMContentLoaded", () => {
    const logBtn = document.querySelector(".logBtn")
    const forgotBtn = document.getElementById("forgotBtn")

    logBtn.addEventListener("click", goLogInPage)
    forgotBtn.addEventListener("click", goRegisterPage)
})

const token = localStorage.getItem("token")
const checkToken = async () => {
  if (!token) return

  try {
    const res = await fetch("/check", {
      headers: { Authorization: token }
    })

  if (res.ok) window.location.href = "storepage.html"

	} catch (err) {
		console.error("Network error:", err) 
	}
}

readmeBtn.addEventListener("click", e => {
  e.preventDefault()
  readmeModal.classList.remove("hidden")
})

readmeModal.addEventListener("click", e => {
  if (e.target === readmeModal) {
    readmeModal.classList.add("hidden")
  }
})

closeReadme.addEventListener("click", () => {
  readmeModal.classList.add("hidden")
})

checkToken()