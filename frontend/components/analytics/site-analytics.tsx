import Script from "next/script"
import { GA_MEASUREMENT_ID, YANDEX_METRIKA_ID } from "@/lib/public/site-verification"

export function SiteAnalytics() {
  const hasGa = GA_MEASUREMENT_ID.length > 0
  const hasYandex = YANDEX_METRIKA_ID.length > 0

  if (!hasGa && !hasYandex) return null

  return (
    <>
      {hasGa ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      ) : null}

      {hasYandex ? (
        <>
          <Script id="yandex-metrika" strategy="afterInteractive">
            {`
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {
                  if (document.scripts[j].src === r) { return; }
                }
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
              })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
              ym(${YANDEX_METRIKA_ID}, "init", {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: true
              });
            `}
          </Script>
          <noscript>
            <div>
              <img
                src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        </>
      ) : null}
    </>
  )
}
