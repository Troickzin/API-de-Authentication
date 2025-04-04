const data = JSON.parse(decodeURIComponent(document.currentScript.getAttribute('data')));
const frontEnd = document.currentScript.getAttribute("frontEnd")
console.log("front end:", frontEnd, "data:", data)
console.log("opener:",window.opener);

if (window.opener) {
  console.log("uhuu")
	window.opener.postMessage({ data }, frontEnd);
  document.getElementById("titulo").innerText = data.message

  setTimeout(()=>{
    window.close()
  }, 5000)
}