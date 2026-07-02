import { NextResponse } from "next/server";

export const revalidate = 86400;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

// The one-line embed loader. Host sites paste:
//   <script src="https://officialrequirements.com/widget.js" async></script>
// It injects the iframe plus a visible attribution link in the HOST page's DOM
// (links inside an iframe don't credit the host page's readers or crawlers —
// the credit line outside it is what makes this a link-building asset).
export async function GET() {
  const js = `(function(){
  var s=document.currentScript;if(!s)return;
  var limit=s.getAttribute("data-limit")||"10";
  var box=document.createElement("div");
  box.style.cssText="max-width:520px;margin:0";
  var f=document.createElement("iframe");
  f.src="${SITE}/embed/funds?limit="+encodeURIComponent(limit);
  f.title="Student visa proof of funds by country";
  f.loading="lazy";
  f.style.cssText="width:100%;border:0;border-radius:12px;height:"+(90+34*Math.min(Math.max(parseInt(limit,10)||10,3),25))+"px";
  var credit=document.createElement("p");
  credit.style.cssText="font:12px/1.4 sans-serif;color:#64748b;margin:6px 2px";
  credit.innerHTML='Source: <a href="${SITE}/reports/cheapest-student-visa-proof-of-funds" rel="noopener">Student visa proof of funds data — OfficialRequirements</a>';
  box.appendChild(f);box.appendChild(credit);
  s.parentNode.insertBefore(box,s.nextSibling);
})();`;
  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
