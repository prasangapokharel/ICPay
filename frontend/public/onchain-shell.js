// Asset canister SPA fallback serves root index.html for deep links. Vercel
// rewrites those URLs onto the prerendered shells; on-chain we swap in the
// correct shell HTML before Next hydrates. Runs only on IC-hosted origins.
(function () {
  var host = location.hostname
  if (host.indexOf(".icp0.io") === -1 && host.indexOf(".ic0.app") === -1) return

  var path = location.pathname.replace(/\/$/, "") || "/"
  var shell = null
  var shellId = null

  if (/^\/bucket\/(?!docs$)[^/]+$/.test(path)) {
    shell = "/bucket/id.html"
    shellId = "bucket-id"
  } else if (/^\/launch\/[^/]+$/.test(path)) {
    shell = "/launch/id.html"
    shellId = "launch-id"
  } else if (/^\/token\/[^/]+$/.test(path)) {
    shell = "/token/token.html"
    shellId = "token-ledger"
  } else if (/^\/icpverse\/[^/]+$/.test(path)) {
    shell = "/icpverse/profile.html"
    shellId = "icpverse-profile"
  } else if (/^\/[A-Za-z0-9_]{1,8}$/.test(path)) {
    var seg = path.slice(1).toLowerCase()
    var reserved =
      "login wallet deposit withdraw transfer profile settings icpverse username terms privacy api admin icpay support help about static public assets images audio well sitemap robots manifest favicon icon og u index 404 video bucket launch token swap roadmap faq transparency transactions deposit withdraw wallet transfer login icpay"
    if ((" " + reserved + " ").indexOf(" " + seg + " ") === -1) {
      shell = "/u.html"
      shellId = "profile-u"
    }
  }

  if (!shell || !shellId) return

  var meta = document.querySelector('meta[name="icpay-shell"]')
  if (meta && meta.getAttribute("content") === shellId) return

  try {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", shell, false)
    xhr.send(null)
    if (xhr.status === 200 && xhr.responseText.indexOf("__next") !== -1) {
      document.open()
      document.write(xhr.responseText)
      document.close()
    }
  } catch (_err) {
    // Leave the default SPA fallback in place.
  }
})()
