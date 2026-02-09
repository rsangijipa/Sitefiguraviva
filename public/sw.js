if (!self.define) {
  let e,
    a = {};
  const c = (c, s) => (
    (c = new URL(c + ".js", s).href),
    a[c] ||
      new Promise((a) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = c), (e.onload = a), document.head.appendChild(e));
        } else ((e = c), importScripts(c), a());
      }).then(() => {
        let e = a[c];
        if (!e) throw new Error(`Module ${c} didn’t register its module`);
        return e;
      })
  );
  self.define = (s, t) => {
    const i =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (a[i]) return;
    let d = {};
    const n = (e) => c(e, i),
      r = { module: { uri: i }, exports: d, require: n };
    a[i] = Promise.all(s.map((e) => r[e] || n(e))).then((e) => (t(...e), d));
  };
}
define(["./workbox-86a8e45e"], function (e) {
  "use strict";
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "abd5e313a4eedd5fdfec255401c102d7",
        },
        {
          url: "/_next/static/chunks/1370-c9d2460d949d433e.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/1370-c9d2460d949d433e.js.map",
          revision: "ba515e428b39439198c250bf3a59b232",
        },
        {
          url: "/_next/static/chunks/1477.e86e34d5329ebc80.js",
          revision: "e86e34d5329ebc80",
        },
        {
          url: "/_next/static/chunks/1477.e86e34d5329ebc80.js.map",
          revision: "7029652b50a66a167c08ed2d409cb4a1",
        },
        {
          url: "/_next/static/chunks/1523-861f5dd78081cdc7.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/1523-861f5dd78081cdc7.js.map",
          revision: "f9e1ddd0e4ee72c153b47ab69d972b7a",
        },
        {
          url: "/_next/static/chunks/2222-e13bab2ebf1ddacc.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/2222-e13bab2ebf1ddacc.js.map",
          revision: "86aa1495dbca1dd1ed6429f8b15e31a3",
        },
        {
          url: "/_next/static/chunks/224-0515f5191942757d.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/224-0515f5191942757d.js.map",
          revision: "bd9f0604a6614fdaf366ae4764873b68",
        },
        {
          url: "/_next/static/chunks/2386-0a3554cc0925c2a5.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/2386-0a3554cc0925c2a5.js.map",
          revision: "4e9966a3d334e395e615395a6594b0ab",
        },
        {
          url: "/_next/static/chunks/2419.a42a8f54b3448d1c.js",
          revision: "a42a8f54b3448d1c",
        },
        {
          url: "/_next/static/chunks/2419.a42a8f54b3448d1c.js.map",
          revision: "de728037c644a050f507470bc3445e08",
        },
        {
          url: "/_next/static/chunks/278-f96301cdf0940a41.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/278-f96301cdf0940a41.js.map",
          revision: "2dd2677d84b26879e2a50ad606b962fe",
        },
        {
          url: "/_next/static/chunks/3046-22378cd5c9396dcb.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/3046-22378cd5c9396dcb.js.map",
          revision: "cf10a244f885d7dca5e8b1daed7dbffa",
        },
        {
          url: "/_next/static/chunks/3087-4dfe44c11893fc5a.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/3087-4dfe44c11893fc5a.js.map",
          revision: "d00b425f59c6cb18bde0930d0e934770",
        },
        {
          url: "/_next/static/chunks/3656-b9999f3de7f33ae8.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/3656-b9999f3de7f33ae8.js.map",
          revision: "1df81b2a49300bb25a6e5ac0756a450d",
        },
        {
          url: "/_next/static/chunks/3852-c806cf6ce9c07cb6.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/3852-c806cf6ce9c07cb6.js.map",
          revision: "cfcde9676d5517d042c1c3e5aae8a43a",
        },
        {
          url: "/_next/static/chunks/4402-b33a5a22d0ceb1c3.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/4402-b33a5a22d0ceb1c3.js.map",
          revision: "57456d954aa222db21d87879dfc570ae",
        },
        {
          url: "/_next/static/chunks/4495-84fb77eca719d63f.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/4495-84fb77eca719d63f.js.map",
          revision: "219b383d560c4dfef001f15a44414d6d",
        },
        {
          url: "/_next/static/chunks/4bd1b696-542957ff8e89a13d.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/4bd1b696-542957ff8e89a13d.js.map",
          revision: "8d19cb838b96b1036a58cc72a5fe9c42",
        },
        {
          url: "/_next/static/chunks/5203.185b10fad52c05c2.js",
          revision: "185b10fad52c05c2",
        },
        {
          url: "/_next/static/chunks/5203.185b10fad52c05c2.js.map",
          revision: "4b04b334470c185d7ae9296ee9f7402b",
        },
        {
          url: "/_next/static/chunks/5392-22c2721cb0fd13cc.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/5392-22c2721cb0fd13cc.js.map",
          revision: "ca3efb1100eb5f36565b0745b765c98a",
        },
        {
          url: "/_next/static/chunks/53c0104b-812abcada8a1e87e.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/53c0104b-812abcada8a1e87e.js.map",
          revision: "bf03b14facd983dac3da924fc9d7d50a",
        },
        {
          url: "/_next/static/chunks/5902-4353f66c849a07ac.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/5902-4353f66c849a07ac.js.map",
          revision: "1157cb5116fbef6a8283d9c64ded554c",
        },
        {
          url: "/_next/static/chunks/608-fd645697c47a0b57.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/608-fd645697c47a0b57.js.map",
          revision: "e477be47cb2aa42ea384d6553dc0307d",
        },
        {
          url: "/_next/static/chunks/609-7b2dc76d4256da8a.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/609-7b2dc76d4256da8a.js.map",
          revision: "47949e99aeb0e1b42293f566589cf12d",
        },
        {
          url: "/_next/static/chunks/6110-85bb76e8fea6a2cf.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/6110-85bb76e8fea6a2cf.js.map",
          revision: "f59ed1448ea43da44c819cdb21138d30",
        },
        {
          url: "/_next/static/chunks/6218.0bc30e16936b4ed9.js",
          revision: "0bc30e16936b4ed9",
        },
        {
          url: "/_next/static/chunks/6218.0bc30e16936b4ed9.js.map",
          revision: "f8bc26bf15f66d0906f6914a32fdae7d",
        },
        {
          url: "/_next/static/chunks/6440-7816b11518e39487.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/6440-7816b11518e39487.js.map",
          revision: "0b6c2f61b5a2276f4ce1ca917ab84183",
        },
        {
          url: "/_next/static/chunks/6484-76286e3668eb38a3.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/6484-76286e3668eb38a3.js.map",
          revision: "2097ea8cce6b29c7ac3974448f48fa6a",
        },
        {
          url: "/_next/static/chunks/6830-35c4ac63e80743bc.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/6830-35c4ac63e80743bc.js.map",
          revision: "fd0236b06a755a26e089f66b27697561",
        },
        {
          url: "/_next/static/chunks/6927-7fff3aa8eda9d47e.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/6927-7fff3aa8eda9d47e.js.map",
          revision: "dd39edd7c9d2239999ed8526b51a3b61",
        },
        {
          url: "/_next/static/chunks/7174-7f20cb21904d1da4.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/7174-7f20cb21904d1da4.js.map",
          revision: "a18a75060a731c2873a85292f95a7296",
        },
        {
          url: "/_next/static/chunks/7216-14c7d9efad6973e8.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/7216-14c7d9efad6973e8.js.map",
          revision: "c34280cc1527ce92ec348a387d09164d",
        },
        {
          url: "/_next/static/chunks/7525-3d49ec564cabf77a.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/7525-3d49ec564cabf77a.js.map",
          revision: "a3680b88b215a4e4bc633d97a6be21f6",
        },
        {
          url: "/_next/static/chunks/7527-64f850753b846edd.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/7527-64f850753b846edd.js.map",
          revision: "aa23bde9500aef0f5d0389e47df6d02c",
        },
        {
          url: "/_next/static/chunks/7648-5b0075ac5f82ba54.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/7648-5b0075ac5f82ba54.js.map",
          revision: "ccb38fac0b84b5c4ed71223ab0825a3e",
        },
        {
          url: "/_next/static/chunks/772-606ff1467ece0c34.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/772-606ff1467ece0c34.js.map",
          revision: "43c1dd65c4a3cbf84672b02327f30449",
        },
        {
          url: "/_next/static/chunks/7789-4c0f79732fdc8b22.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/7789-4c0f79732fdc8b22.js.map",
          revision: "adc6b9bb4fc297ae4d051067939d4fc0",
        },
        {
          url: "/_next/static/chunks/7970-486b57b1ecc2d17f.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/7970-486b57b1ecc2d17f.js.map",
          revision: "f1e7002ab972beff471ddaa0004ba304",
        },
        {
          url: "/_next/static/chunks/8173-44b781dec624f269.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/8173-44b781dec624f269.js.map",
          revision: "5e4fc37e9223fe1e8288043faeb35a91",
        },
        {
          url: "/_next/static/chunks/8397-d9284e380cbbea8c.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/8397-d9284e380cbbea8c.js.map",
          revision: "2f988d4950b36c5867a8a5efc144d62a",
        },
        {
          url: "/_next/static/chunks/8559-0e791945f0acda82.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/8559-0e791945f0acda82.js.map",
          revision: "b9e00976f4ba3764eea663f30dcbd988",
        },
        {
          url: "/_next/static/chunks/8985.be7ad7b46bcb0d48.js",
          revision: "be7ad7b46bcb0d48",
        },
        {
          url: "/_next/static/chunks/8985.be7ad7b46bcb0d48.js.map",
          revision: "cd7b1faad6121d7a577c6e81337b53c5",
        },
        {
          url: "/_next/static/chunks/9556-4a25a49c1c726d75.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/9556-4a25a49c1c726d75.js.map",
          revision: "40caaa4ad683165c24f862d99e064415",
        },
        {
          url: "/_next/static/chunks/9936-0718dc7bb28a6eb0.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/9936-0718dc7bb28a6eb0.js.map",
          revision: "c4d2511418cb72be20b37a19c8364927",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-275cbec3b0a22c6b.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/applications/page-a797240a48905506.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/applications/page-a797240a48905506.js.map",
          revision: "182ce1ec0e0e1109808b8d9e590a95d6",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/approvals/page-dcdb3e5e9a946f79.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/approvals/page-dcdb3e5e9a946f79.js.map",
          revision: "ef9d4e0bb0965390ba36d18941618aa2",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/assessments/page-cec9c5c671861ff7.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/blog/page-f2384a00821990aa.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/blog/page-f2384a00821990aa.js.map",
          revision: "fa55771030a7495de46a538ec5a0ae46",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/builder/layout-c34db351a2766e0e.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/builder/layout-c34db351a2766e0e.js.map",
          revision: "58bd70060a0033fbb6e418690748e549",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/builder/page-006f2e58a81ac08c.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/builder/page-006f2e58a81ac08c.js.map",
          revision: "d7d2a9a82dd227b51778fb2f9155fb2b",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/layout-24dd9232641de0b1.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/layout-24dd9232641de0b1.js.map",
          revision: "a606e34d6707e1dad4c88a7ad8a7e9bc",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/lessons/%5BlessonId%5D/page-e70557dbdd5abb44.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/lessons/%5BlessonId%5D/page-e70557dbdd5abb44.js.map",
          revision: "bc2adb6987f4a584080ce0e7199a9497",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/materials/page-75e4b59743594a35.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/materials/page-75e4b59743594a35.js.map",
          revision: "00f97c2f05f246a634cce3ff0e5f1ae2",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/page-422e9084c949d1e2.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/%5Bid%5D/page-422e9084c949d1e2.js.map",
          revision: "1fc0716ea17272bc01674904e546a37c",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/new/page-1962197fcee983fc.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/page-edc484a1a5885a0d.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/courses/page-edc484a1a5885a0d.js.map",
          revision: "1161c5cbb9115efc8be580ca8ae88a54",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/dashboard/page-4945c0a9e1479691.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/enrollments/page-184c4e7713040564.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/enrollments/page-184c4e7713040564.js.map",
          revision: "8352e7af25b42f5b3eca587ba593dfcf",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/events/page-c9e5ede2b716cffa.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/events/page-c9e5ede2b716cffa.js.map",
          revision: "b1e8f19c892a431ed0d9bb757c6f96e1",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/gallery/page-6ccf102ececca128.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/gallery/page-6ccf102ececca128.js.map",
          revision: "ed0f519f51036db541d2e8f15735c0a6",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/google/page-abfe500d5ef22130.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/google/page-abfe500d5ef22130.js.map",
          revision: "dbb6fd3c26dff717ec3ab286cc81fcf4",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/layout-786acda6d3f3dd23.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/layout-786acda6d3f3dd23.js.map",
          revision: "aa5a77f711e4f4edc1b5e09786677f25",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/logs/page-89f64035e96d1e3d.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/logs/page-89f64035e96d1e3d.js.map",
          revision: "bbb5a2601003d59b7e29f0322667a243",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/page-a6a2907607cc13af.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/page-a6a2907607cc13af.js.map",
          revision: "7f705cfd7cfada64c15b51b534e7888a",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/public-docs/page-d51c2249335344e5.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/public-docs/page-d51c2249335344e5.js.map",
          revision: "f24f172b9334137e7b0c37edf106abaf",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/settings/page-dee99cf12bae39db.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/settings/page-dee99cf12bae39db.js.map",
          revision: "ccb6816467a1072f02f9c81e22e85272",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/users/page-8aa43cb1176830ba.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/(protected)/users/page-8aa43cb1176830ba.js.map",
          revision: "03fa49e5e0c7890e07fee1c924c6ad45",
        },
        {
          url: "/_next/static/chunks/app/admin/login/page-7540143a48021d3d.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/admin/login/page-7540143a48021d3d.js.map",
          revision: "9efaac5582f3eb31e127bb4fdedaa786",
        },
        {
          url: "/_next/static/chunks/app/api/admin/seed/route-fe0a2a0120656018.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/api/applications/submit/route-c603c6c4420e7dd4.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/api/auth/login/route-1bbdf3bbabe28394.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/api/auth/logout/route-7c283bb6d2dff929.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/api/billing/checkout-subscription/route-a6fd3428af9cb4e5.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/api/billing/customer-portal/route-e858c986fc4e4c7d.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/api/billing/webhook/route-070a12ca4d86b858.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/api/portal/dashboard/route-d3ceb36cd6643246.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/api/test-auth/route-914484c3b442e056.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/api/upload/route-34e093adf40ca074.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/auth/page-ff0678b72e128e9c.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/auth/page-ff0678b72e128e9c.js.map",
          revision: "e0b3febe34517e911d1581da60774fbf",
        },
        {
          url: "/_next/static/chunks/app/auth/reset-password/page-5f2c0d50caedd618.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/auth/reset-password/page-5f2c0d50caedd618.js.map",
          revision: "1e3618fe038fc7f06813f8d0b60c564c",
        },
        {
          url: "/_next/static/chunks/app/blog/%5Bid%5D/page-3ed51d336ed76c4e.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/blog/%5Bid%5D/page-3ed51d336ed76c4e.js.map",
          revision: "93874fd3b5d47dabca3ad348bdfb2b4b",
        },
        {
          url: "/_next/static/chunks/app/blog/page-f346daa45bd478ed.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/blog/page-f346daa45bd478ed.js.map",
          revision: "d02e6119cec9f14ec12d26d38d25af15",
        },
        {
          url: "/_next/static/chunks/app/certificado/%5Bcode%5D/page-cd5dc09535efaa6f.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/certificado/%5Bcode%5D/page-cd5dc09535efaa6f.js.map",
          revision: "779bc0a3d3f0d2644ac09d4e4132c12c",
        },
        {
          url: "/_next/static/chunks/app/certificates/verify/%5Bcode%5D/page-c6e14db13348ec91.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/certificates/verify/%5Bcode%5D/page-c6e14db13348ec91.js.map",
          revision: "a621a90d51da7d4b290fd88ca22c5f6d",
        },
        {
          url: "/_next/static/chunks/app/curso/%5Bid%5D/page-7a11678731efada2.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/curso/%5Bid%5D/page-7a11678731efada2.js.map",
          revision: "c5123a999855179d84cf0cfca6e4d400",
        },
        {
          url: "/_next/static/chunks/app/curso/page-3a367382b41361f2.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/curso/page-3a367382b41361f2.js.map",
          revision: "8d5d52ed7ff0a81173f01b9aae5aac89",
        },
        {
          url: "/_next/static/chunks/app/error-67dddfc05c6fd682.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/error-67dddfc05c6fd682.js.map",
          revision: "b3d45c4ae65197e9740e7fc85ee892d6",
        },
        {
          url: "/_next/static/chunks/app/global-error-023757750157d8b6.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/global-error-023757750157d8b6.js.map",
          revision: "a85cb0c75ca62065dae754b967a431b7",
        },
        {
          url: "/_next/static/chunks/app/inscricao/%5BcourseId%5D/cancelado/page-862237b94c023fe3.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/inscricao/%5BcourseId%5D/cancelado/page-862237b94c023fe3.js.map",
          revision: "882d8fa1a8050300b09f47da1de90ee1",
        },
        {
          url: "/_next/static/chunks/app/inscricao/%5BcourseId%5D/page-397ce5ed8be0398c.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/inscricao/%5BcourseId%5D/page-397ce5ed8be0398c.js.map",
          revision: "fe164dfa89cf773b922dfcb886c2cbf2",
        },
        {
          url: "/_next/static/chunks/app/inscricao/%5BcourseId%5D/sucesso/page-4448687636fe2987.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/layout-a570875144cf5cbd.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/layout-a570875144cf5cbd.js.map",
          revision: "b3aa85b4d7cdfaa0458b3ec9446a6747",
        },
        {
          url: "/_next/static/chunks/app/login/page-817a6260ec7ff926.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/not-found-1b10b9692fd494b4.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/not-found-1b10b9692fd494b4.js.map",
          revision: "745e9fa269e5f546a82a39a8b374f8e3",
        },
        {
          url: "/_next/static/chunks/app/page-7bb2f5cedcb45aad.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/page-7bb2f5cedcb45aad.js.map",
          revision: "9d1a6e6ddee31d6b3fa383d36b11488f",
        },
        {
          url: "/_next/static/chunks/app/portal/certificate/%5Bid%5D/page-5813fb785e381182.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/certificate/%5Bid%5D/page-5813fb785e381182.js.map",
          revision: "4a8cce9ebd3eac66441c95cef367720b",
        },
        {
          url: "/_next/static/chunks/app/portal/certificates/%5Bid%5D/page-febd81dd4f7aa7d9.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/certificates/%5Bid%5D/page-febd81dd4f7aa7d9.js.map",
          revision: "90400ca4723147c880fdfb8e6071895b",
        },
        {
          url: "/_next/static/chunks/app/portal/certificates/error-5967385a431f70ce.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/certificates/error-5967385a431f70ce.js.map",
          revision: "d933e1b21685a04eefebb5cacc861b9c",
        },
        {
          url: "/_next/static/chunks/app/portal/certificates/page-439d8c9274c2d6e3.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/certificates/page-439d8c9274c2d6e3.js.map",
          revision: "9c3f2e6b1c24d0cfc9bfee22391e0c66",
        },
        {
          url: "/_next/static/chunks/app/portal/checkin/page-f9cf198fc8844c5d.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/checkin/page-f9cf198fc8844c5d.js.map",
          revision: "85da88b6687fac17a6f759f3e9486936",
        },
        {
          url: "/_next/static/chunks/app/portal/community/error-c50ce5e6a8cfb490.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/community/error-c50ce5e6a8cfb490.js.map",
          revision: "d6c20db42ccbbb0b23eec2cbcb423446",
        },
        {
          url: "/_next/static/chunks/app/portal/community/page-ec4e6554f7bdc1ab.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/community/page-ec4e6554f7bdc1ab.js.map",
          revision: "7226a756ba64d6ce7ff6bf2c9ac02d51",
        },
        {
          url: "/_next/static/chunks/app/portal/course/%5BcourseId%5D/certificate/page-1ec01a63e6442d44.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/course/%5BcourseId%5D/certificate/page-1ec01a63e6442d44.js.map",
          revision: "f2a5fc41e8b421c6532945bf5a800da7",
        },
        {
          url: "/_next/static/chunks/app/portal/course/%5BcourseId%5D/lesson/%5BlessonId%5D/page-57d3f55d007f8418.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/course/%5BcourseId%5D/lesson/%5BlessonId%5D/page-57d3f55d007f8418.js.map",
          revision: "9dd120c55ef1506e95a48776be43fa77",
        },
        {
          url: "/_next/static/chunks/app/portal/course/%5BcourseId%5D/page-173a21ffb87b4fc6.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/course/%5BcourseId%5D/page-173a21ffb87b4fc6.js.map",
          revision: "d332a3f38bc70fd071a69ff32bcc3e01",
        },
        {
          url: "/_next/static/chunks/app/portal/courses/page-661746df206e78d5.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/courses/page-661746df206e78d5.js.map",
          revision: "ea053e4a44d2568315f71028b7dd05cf",
        },
        {
          url: "/_next/static/chunks/app/portal/error-a3ca7a25fba6d306.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/error-a3ca7a25fba6d306.js.map",
          revision: "ca73b4da804bfc663f1e9da2bb9188e3",
        },
        {
          url: "/_next/static/chunks/app/portal/events/error-45595e51ab9f59b7.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/events/error-45595e51ab9f59b7.js.map",
          revision: "dc370727f4a7ce785bd6eeb255409c26",
        },
        {
          url: "/_next/static/chunks/app/portal/events/page-7adcdbb2241be480.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/events/page-7adcdbb2241be480.js.map",
          revision: "9b82063946822ae520a1f18c7be49941",
        },
        {
          url: "/_next/static/chunks/app/portal/exam/%5BexamId%5D/page-20cee8d3663d08c8.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/exam/%5BexamId%5D/page-20cee8d3663d08c8.js.map",
          revision: "369fc7c3e2984712d28eb54ec0075893",
        },
        {
          url: "/_next/static/chunks/app/portal/goals/page-e69e1c1347481d7f.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/goals/page-e69e1c1347481d7f.js.map",
          revision: "e4a1fa5768cac55fd5ee3637b78657d9",
        },
        {
          url: "/_next/static/chunks/app/portal/layout-aa4117b717f6b749.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/layout-aa4117b717f6b749.js.map",
          revision: "472d6fd7ca75f48ced5444dd5de79e6d",
        },
        {
          url: "/_next/static/chunks/app/portal/loading-9e797b76337c50f5.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/materials/page-3e3dd46f38a76a4a.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/materials/page-3e3dd46f38a76a4a.js.map",
          revision: "e07e18dc8732a8560a4c6a2daa6b5cf7",
        },
        {
          url: "/_next/static/chunks/app/portal/page-11d76ed6e7aa79fd.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/page-11d76ed6e7aa79fd.js.map",
          revision: "39bb67a138ff852e35f5c9d03d00c282",
        },
        {
          url: "/_next/static/chunks/app/portal/profile/page-738096a11e289922.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/settings/page-687be4e5e79ee018.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/support/page-1106338081ae6233.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/portal/support/page-1106338081ae6233.js.map",
          revision: "bb2fcbab3b9ec2ddf3ef6072e100b351",
        },
        {
          url: "/_next/static/chunks/app/signup/page-a9d7f2a6ae07dece.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/verify/%5Bid%5D/page-5ba7bfc6d1336e7c.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/app/verify/%5Bid%5D/page-5ba7bfc6d1336e7c.js.map",
          revision: "b12582763dc86dba7ba2ed85de168031",
        },
        {
          url: "/_next/static/chunks/b536a0f1-6da42bcaadd46e23.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/b536a0f1-6da42bcaadd46e23.js.map",
          revision: "d85a1a83fc54af8db72228da4093506f",
        },
        {
          url: "/_next/static/chunks/bd904a5c-47b089ee331e9dfd.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/bd904a5c-47b089ee331e9dfd.js.map",
          revision: "05938675129e836aea82df4f4d37d3e2",
        },
        {
          url: "/_next/static/chunks/ebf8faf4-ba6cf0e33650a815.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/ebf8faf4-ba6cf0e33650a815.js.map",
          revision: "a4eb214190be89f375aab0df6d15c643",
        },
        {
          url: "/_next/static/chunks/framework-43e8367f3204ceca.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/framework-43e8367f3204ceca.js.map",
          revision: "0217a856ea0468804ac663e1e5114c1a",
        },
        {
          url: "/_next/static/chunks/main-app-37dc0152eb60887e.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/main-app-37dc0152eb60887e.js.map",
          revision: "e4829006fb91a5a1cf79fad19ade662a",
        },
        {
          url: "/_next/static/chunks/main-ef24720867c7837e.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/main-ef24720867c7837e.js.map",
          revision: "e3aa60fcf28e834db449682a7fc346d0",
        },
        {
          url: "/_next/static/chunks/pages/_app-3be995566ca4ee66.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/pages/_app-3be995566ca4ee66.js.map",
          revision: "95fa03bcc4d8c64f763fe9f6059ea861",
        },
        {
          url: "/_next/static/chunks/pages/_error-62982b47b35b3a27.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/pages/_error-62982b47b35b3a27.js.map",
          revision: "64148fd6788a6b10c6a39ed26a70cd20",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-6df49e10ecfd67ff.js",
          revision: "m8WcBPjS0BvfCdu49tVXd",
        },
        {
          url: "/_next/static/chunks/webpack-6df49e10ecfd67ff.js.map",
          revision: "ee7aa448fd6a815b36b81a0c52729db8",
        },
        {
          url: "/_next/static/css/71fa9f68e374a9c8.css",
          revision: "71fa9f68e374a9c8",
        },
        {
          url: "/_next/static/css/71fa9f68e374a9c8.css.map",
          revision: "528a653ed97d33de671f4f5ccb554314",
        },
        {
          url: "/_next/static/css/ea7bd41af09fbea2.css",
          revision: "ea7bd41af09fbea2",
        },
        {
          url: "/_next/static/css/ea7bd41af09fbea2.css.map",
          revision: "a90021db1e7c07d6af29df3180763845",
        },
        {
          url: "/_next/static/m8WcBPjS0BvfCdu49tVXd/_buildManifest.js",
          revision: "2eff7d0b294fb84c203450830a8ce41b",
        },
        {
          url: "/_next/static/m8WcBPjS0BvfCdu49tVXd/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/media/155cae559bbd1a77-s.p.woff2",
          revision: "268d01e94fa0e3a13787891fe19f739c",
        },
        {
          url: "/_next/static/media/393d45a2251e223a-s.woff2",
          revision: "c88e7854dc9e21b3df900e1e9bbb9791",
        },
        {
          url: "/_next/static/media/39969fcf98a3026e-s.woff2",
          revision: "01cbba1eab04f564e7d2f44107608d74",
        },
        {
          url: "/_next/static/media/48410f3df60da620-s.woff2",
          revision: "e1f7cd82031b41027ce3b241bca44c88",
        },
        {
          url: "/_next/static/media/4de1fea1a954a5b6-s.p.woff2",
          revision: "b7d6b48d8d12946dc808ff39aed6c460",
        },
        {
          url: "/_next/static/media/6d664cce900333ee-s.p.woff2",
          revision: "017598645bcc882a3610effe171c2ca3",
        },
        {
          url: "/_next/static/media/7b89a4fd5e90ede0-s.p.woff2",
          revision: "ec4225ec161bd5285480b6b197e10b2b",
        },
        {
          url: "/_next/static/media/8715d2ed531152f4-s.woff2",
          revision: "4707efc4a5178d63587bcd41cb9b91c7",
        },
        {
          url: "/_next/static/media/9ce3050912c26948-s.woff2",
          revision: "324bf0e980ab5cdf94e7203d821fe44b",
        },
        {
          url: "/_next/static/media/c48b38fe8bb532f3-s.woff2",
          revision: "3e6270b013fa54e61b296effea15acc2",
        },
        {
          url: "/_next/static/media/cce080f35d014443-s.woff2",
          revision: "b0d4953143648e4486d93df16327b906",
        },
        {
          url: "/assets/audio/meditation.mp3",
          revision: "911bccf860493145cc67b30f3c645e76",
        },
        {
          url: "/assets/auth-bg.jpg",
          revision: "f25647409778343a6010c6a3d4d263e9",
        },
        {
          url: "/assets/curso-experiencia-atemporal.jpg",
          revision: "6029da8c66d658c15388740cc09eda9d",
        },
        {
          url: "/assets/foto-grupo.jpg",
          revision: "72cfb439320ee9a764e2309e91a4b983",
        },
        {
          url: "/assets/fundo-galeria.png",
          revision: "7fbf789195e7968b97b2d48016554fd2",
        },
        {
          url: "/assets/hero-bg-custom.png",
          revision: "cda755bbb17e3a6312b19ebff2698f0d",
        },
        {
          url: "/assets/lilian-vanessa.jpeg",
          revision: "7e2e802035b8e200b22177846b2b4c61",
        },
        {
          url: "/assets/logo-figura-viva.jpg",
          revision: "925787993cdefbfa1caa1561260cf388",
        },
        {
          url: "/assets/logo-hero.png",
          revision: "fcad64364a515710098f8fbd8176beea",
        },
        {
          url: "/assets/logo.jpeg",
          revision: "951bf143a05bbb908fec585c7e81fd94",
        },
        {
          url: "/cursos/III Formação Clínica em Gestalt-Terapia/capa.jpeg",
          revision: "695bb55527e802491fab71db8c3047ae",
        },
        {
          url: "/cursos/III Formação Clínica em Gestalt-Terapia/info.txt",
          revision: "53ce7c6f2678e9af1e792cbdd29fe46a",
        },
        {
          url: "/cursos/III Formação Clínica em Gestalt-Terapia/mediador1.jpeg",
          revision: "61df590d6720ca262b734f7d4a33d6b9",
        },
        {
          url: "/cursos/III Formação Clínica em Gestalt-Terapia/mediador2.jpeg",
          revision: "9b74ed646096edc6dd29496745adab8e",
        },
        {
          url: "/cursos/detalhes.txt",
          revision: "fc6ceca173ceaf30e37ed3a5829f801a",
        },
        {
          url: "/cursos/experincia-atemporal/capa.jpeg",
          revision: "687d3b811b27efa875035f1653d41dce",
        },
        {
          url: "/cursos/experincia-atemporal/info.txt",
          revision: "1f2a7d0b24ee9270f20eabf49827d5be",
        },
        {
          url: "/cursos/experincia-atemporal/mediador1.jpeg",
          revision: "2e9b0e6508d3ef11aff3b72c2fdfcc0e",
        },
        {
          url: "/cursos/experincia-atemporal/mediador2.jpeg",
          revision: "61df590d6720ca262b734f7d4a33d6b9",
        },
        {
          url: "/cursos/superviso-clnica-co-visar/capa.jpeg",
          revision: "a410200b19bbc81457985a6055aa98b1",
        },
        {
          url: "/cursos/superviso-clnica-co-visar/info.txt",
          revision: "365267a084f817d1c963305afac16906",
        },
        {
          url: "/cursos/superviso-clnica-co-visar/mediador1.jpeg",
          revision: "fab61aee6400d89db74566f9a46bb89a",
        },
        {
          url: "/documents/As polaridades do feminino na contemporaneidade e a depressão pós-parto uma visão gestáltica.pdf",
          revision: "90b201617ddc60361eb13fca0398ce18",
        },
        { url: "/favicon.ico", revision: "c30c7d42707a47a3f4591831641e50dc" },
        {
          url: "/images/Captura de tela 2025-12-29 114654.png",
          revision: "f51c6929bc59f88c75815746cefc8630",
        },
        {
          url: "/images/Captura de tela 2025-12-29 114654.png.txt",
          revision: "55c1f7d961c3e6ca4f1b7568db6a66ef",
        },
        {
          url: "/images/Captura de tela 2025-12-29 114713.png",
          revision: "f72fb6a1aef1cab85479d56271dcfb5f",
        },
        {
          url: "/images/Captura de tela 2025-12-29 114713.png.txt",
          revision: "c6cfbf0a771058d6fb854ee35a538130",
        },
        {
          url: "/images/Captura de tela 2025-12-29 114713.txt",
          revision: "f03c6c4c49b60035328fdea7293da41b",
        },
        {
          url: "/images/Captura de tela 2025-12-29 114736.png",
          revision: "84cdf4316ebba284f884cbd73dc995b2",
        },
        {
          url: "/images/Captura de tela 2025-12-29 114736.txt",
          revision: "293c410a5beb70256867805a5b72e5ee",
        },
        {
          url: "/images/Captura de tela 2025-12-29 125619.png",
          revision: "e3a57050919ff34151309f06b70a53a4",
        },
        {
          url: "/images/Captura de tela 2025-12-29 125619.png.txt",
          revision: "8c17ec671b09e1d93f5bc3cbc585c526",
        },
        {
          url: "/images/model.txt",
          revision: "fdfe76c3cc9a1ecca9ddc38106f0604f",
        },
        { url: "/manifest.json", revision: "ca1186b6dc40a52c17fc74c6c0f19af8" },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: a,
              event: c,
              state: s,
            }) =>
              a && "opaqueredirect" === a.type
                ? new Response(a.body, {
                    status: 200,
                    statusText: "OK",
                    headers: a.headers,
                  })
                : a,
          },
        ],
      }),
      "GET",
    ));
});
//# sourceMappingURL=sw.js.map
