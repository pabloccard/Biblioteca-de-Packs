import Script from "next/script";

export default function PacksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Script Global Padrão de Vendas (carregado APENAS nas páginas de packs/vendas) */}
      <Script id="sales-global-tracking" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://api.pablocastilho.com/1hlacdxvzy.js?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','bhjsn=EB5LPzAuTCJAMU41KjRXSg9HRFZVRQUCRAoXGggMAg0KDh8UDAxPDxYX');
        `}
      </Script>
      {children}
    </>
  );
}
