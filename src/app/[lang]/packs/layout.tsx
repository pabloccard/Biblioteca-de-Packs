import Script from 'next/script'

export default function PacksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script id="sentinel-tracker" strategy="afterInteractive">
        {`
(function(s,e,n,t,i){s[n]=s[n]||function(){(s[n].q=s[n].q||[]).push(arguments)};
var js=e.createElement('script');js.async=1;js.src=t+'?tid='+i;
e.head.appendChild(js)})(window,document,'sentinel','https://track.pablocastilho.com/api/t/tracker.js','ece68b0f-29f4-4c1f-a11e-14c69436679c');
        `}
      </Script>
      {children}
    </>
  )
}
