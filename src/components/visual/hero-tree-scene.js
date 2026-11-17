// @ts-nocheck
// Adaptado da cena 3D fornecida pelo Instituto Figura Viva.

  import * as THREE from 'three';
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
  import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
  import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';


export function mountHeroTree(root, onReady, onPhrase, background = false) {
  let disposed = false, frameId = 0, isVisible = true;
  const visibility = new IntersectionObserver(entries => { isVisible = entries[0].isIntersecting; }); visibility.observe(root);
  /* ===================================================================
     DADOS ORIGINAIS DA MARCA (pétalas e galhos do SVG 454×523)
     =================================================================== */
  const PETALS = [ [236.5, 34.8, 36.6, 0.94, "#02858c"], [251.4, 36.0, 69.1, 1.05, "#04db9f"], [263.4, 31.2, 78.8, 1.2, "#02775d"], [284.2, 30.0, -84.1, 0.78, "#01d28c"], [298.0, 40.8, 75.9, 0.89, "#00bc5d"], [314.4, 39.8, 20.5, 1.17, "#019142"], [140.8, 55.4, 28.0, 0.76, "#ff457a"], [149.5, 53.7, -52.9, 0.93, "#ff204d"], [167.1, 46.0, 58.1, 1.16, "#fe7bb7"], [181.9, 46.3, -41.3, 1.08, "#bf4e7f"], [198.1, 54.4, 70.0, 0.77, "#fe5f9b"], [221.7, 53.8, 20.5, 1.05, "#c07ba3"], [258.8, 46.6, 70.4, 1.12, "#02775d"], [268.5, 50.8, -36.1, 0.84, "#01d28c"], [291.3, 45.1, -49.8, 1.21, "#01cf79"], [302.0, 52.2, 20.1, 1.06, "#009e53"], [325.8, 55.2, -36.1, 0.89, "#01cf79"], [116.6, 73.3, -73.9, 0.85, "#ff3566"], [140.2, 67.0, 0.6, 1.07, "#fe6daa"], [149.5, 61.8, 56.8, 0.83, "#fe538b"], [173.5, 68.9, 4.6, 1.21, "#fe6daa"], [183.0, 71.7, -48.3, 1.12, "#fe5f9b"], [199.1, 73.1, -10.9, 1.15, "#fe7bb7"], [233.7, 74.8, -9.7, 0.76, "#03757e"], [249.5, 67.0, -16.4, 1.02, "#02949c"], [272.6, 62.6, -74.1, 0.83, "#01b991"], [293.4, 64.0, 45.4, 1.08, "#2fd782"], [302.0, 73.8, 56.9, 1.14, "#00bb76"], [107.0, 83.7, 2.0, 0.75, "#ff204d"], [122.8, 85.1, 12.4, 1.11, "#fe6daa"], [137.5, 78.2, 65.7, 1.13, "#ff8bc7"], [154.1, 90.2, 78.6, 0.87, "#fe7bb7"], [172.8, 83.9, 64.8, 1.04, "#fe6daa"], [187.3, 87.9, -49.6, 0.86, "#df528b"], [198.2, 80.4, -29.8, 1.13, "#fe538b"], [216.0, 81.3, 34.8, 1.05, "#df84b7"], [233.4, 91.3, 43.3, 0.98, "#02949c"], [292.3, 82.0, -66.2, 1.0, "#68c897"], [308.1, 78.6, 50.4, 1.18, "#00ac5f"], [327.0, 81.0, -84.8, 1.05, "#04cf5e"], [336.8, 90.0, -55.4, 1.09, "#019142"], [67.8, 108.5, -45.5, 1.21, "#ff867d"], [87.8, 105.0, 60.1, 1.14, "#ff3566"], [98.4, 101.2, 82.4, 0.78, "#fe6daa"], [111.2, 104.9, 3.6, 0.86, "#ff0d30"], [128.7, 97.8, 33.6, 1.01, "#ff204d"], [151.2, 104.2, 60.3, 0.74, "#fe5f9b"], [172.9, 96.0, -45.3, 1.14, "#ff457a"], [178.9, 98.4, 4.5, 1.19, "#fe6daa"], [208.1, 108.1, 5.8, 1.16, "#4d889a"], [219.7, 102.3, 9.5, 0.9, "#02858c"], [237.5, 95.9, -13.9, 1.07, "#02858c"], [254.6, 98.9, 36.1, 0.84, "#03757e"], [270.0, 107.5, 42.6, 0.9, "#03757e"], [298.8, 105.5, 24.4, 0.98, "#01b991"], [323.3, 98.6, 77.4, 1.09, "#01c94d"], [341.1, 100.6, -38.8, 0.84, "#019142"], [357.9, 104.4, 75.0, 1.03, "#00bd43"], [61.4, 120.7, -71.3, 1.05, "#ff457a"], [77.4, 114.5, -57.1, 0.85, "#ff3566"], [104.8, 124.7, -0.6, 1.1, "#ff3566"], [121.3, 120.5, 57.0, 1.16, "#ff0d30"], [136.1, 118.8, 24.1, 0.94, "#fe538b"], [149.0, 122.7, -37.3, 0.89, "#ff8bc7"], [165.9, 117.7, 79.5, 1.07, "#bf4e7f"], [235.7, 118.7, -61.0, 1.2, "#02858c"], [249.6, 121.8, -18.1, 1.11, "#03a2af"], [286.5, 114.3, 46.0, 1.09, "#019971"], [306.6, 121.3, -70.6, 1.15, "#019971"], [318.7, 120.2, 25.4, 0.78, "#00a97c"], [337.4, 118.6, -61.0, 0.9, "#009e53"], [358.1, 116.8, 24.8, 0.74, "#00bd43"], [371.7, 117.2, 80.7, 0.79, "#01c94d"], [68.5, 131.5, 50.2, 0.84, "#ff0d30"], [79.1, 138.3, -46.1, 0.87, "#ff457a"], [99.3, 132.4, 26.0, 1.02, "#fe7bb7"], [120.9, 129.4, -14.0, 1.12, "#ff3566"], [129.9, 137.7, 47.0, 0.73, "#fe7bb7"], [157.8, 140.3, -65.2, 0.8, "#fea2d7"], [163.5, 136.3, -70.4, 1.06, "#fea2d7"], [184.7, 131.7, 73.0, 0.93, "#e3699f"], [212.2, 138.7, 63.8, 1.13, "#a0765b"], [240.8, 130.6, 24.3, 0.82, "#07b5c5"], [282.9, 142.6, 76.6, 0.8, "#00bb76"], [301.8, 139.0, 50.1, 0.96, "#009e53"], [316.9, 140.0, 75.1, 0.77, "#007b45"], [336.8, 141.2, -50.9, 0.74, "#00bc5d"], [359.1, 132.9, -27.3, 0.98, "#00bd43"], [373.3, 140.5, 66.6, 1.0, "#30d363"], [386.6, 138.9, 1.3, 1.08, "#34cf49"], [46.8, 155.5, 70.7, 1.05, "#ffaa8e"], [65.4, 159.5, -6.3, 0.98, "#ff867d"], [83.7, 152.3, 47.5, 1.07, "#fe6daa"], [103.5, 150.6, -57.3, 0.88, "#ff867d"], [116.7, 149.3, -35.0, 0.9, "#d94814"], [170.7, 151.0, 9.6, 1.09, "#ff8bc7"], [186.9, 147.1, -43.2, 0.9, "#ff9099"], [200.4, 150.7, -78.1, 1.2, "#c3927b"], [216.4, 146.9, 21.7, 1.06, "#a0765b"], [269.2, 148.2, -39.7, 0.93, "#5edf91"], [290.3, 153.3, -17.1, 1.08, "#00ac5f"], [299.3, 153.9, -4.0, 0.76, "#00ac5f"], [319.9, 158.9, 37.6, 1.13, "#00bc5d"], [336.6, 159.1, -84.1, 0.85, "#009e53"], [354.2, 155.3, 50.2, 0.98, "#01c94d"], [377.9, 156.3, -54.5, 0.87, "#30d363"], [384.7, 155.5, -19.9, 1.11, "#51d65a"], [42.6, 174.1, 15.9, 1.01, "#ff8b5c"], [67.3, 170.9, 53.5, 0.78, "#ff867d"], [89.2, 173.6, 1.9, 1.09, "#fe7294"], [104.8, 173.4, 44.0, 0.8, "#ff9099"], [117.3, 175.5, -70.2, 0.92, "#ffb777"], [139.2, 171.7, -1.2, 0.81, "#f4b7af"], [170.9, 164.9, -14.7, 1.11, "#f2ccc3"], [187.8, 168.5, -48.2, 0.92, "#b88e5e"], [197.9, 169.1, -54.4, 1.11, "#a9b207"], [224.6, 164.7, -65.4, 0.98, "#98882d"], [241.9, 164.3, -67.7, 0.85, "#7e9a48"], [252.1, 173.1, 23.0, 0.74, "#7e9a48"], [292.0, 164.6, -42.4, 0.86, "#00a97c"], [304.8, 172.2, -57.2, 0.87, "#49db8b"], [318.1, 173.4, -41.8, 1.06, "#63db7c"], [334.0, 168.5, -3.7, 0.96, "#00bc5d"], [350.2, 165.4, -3.7, 1.05, "#00bc5d"], [369.7, 170.6, -49.8, 1.08, "#30d363"], [392.9, 163.8, -42.2, 0.84, "#49d773"], [410.6, 176.2, 50.1, 0.77, "#49db8b"], [35.4, 182.3, -15.5, 0.99, "#ffb777"], [48.3, 183.0, 55.0, 0.84, "#ff9d6d"], [63.9, 183.1, -28.5, 1.09, "#ff8b5c"], [88.6, 182.8, 36.0, 1.02, "#ff9099"], [101.1, 185.5, 39.5, 0.8, "#ffaa8e"], [121.4, 181.2, -8.5, 1.04, "#febe34"], [132.5, 185.2, -54.9, 0.75, "#febe34"], [152.6, 181.8, -41.0, 0.78, "#fcf8ba"], [162.9, 181.5, 37.2, 0.74, "#e1cfa1"], [178.1, 184.4, -13.1, 0.97, "#d2b570"], [198.2, 184.2, -4.1, 0.73, "#e1bd01"], [215.1, 186.7, 51.1, 0.72, "#a9b207"], [236.5, 180.1, 79.0, 0.98, "#a9b207"], [253.4, 190.2, -35.4, 1.16, "#92bb3f"], [273.7, 189.8, -14.3, 0.83, "#6fd75c"], [292.9, 182.0, -46.6, 1.15, "#68c897"], [307.2, 184.9, 41.8, 0.92, "#51d65a"], [327.5, 185.8, 42.2, 0.82, "#34cf49"], [337.0, 181.2, 83.9, 0.93, "#00bd43"], [351.0, 191.5, 27.8, 1.2, "#51d65a"], [368.8, 193.7, 75.7, 1.16, "#01c94d"], [395.0, 180.5, 74.8, 0.91, "#04cf5e"], [401.5, 193.3, -24.2, 0.97, "#2fd782"], [42.9, 202.7, 42.3, 0.94, "#ffa956"], [68.1, 206.2, -3.1, 1.0, "#ffb777"], [80.1, 208.9, -33.3, 0.73, "#fdf087"], [100.9, 197.0, -54.0, 0.92, "#ffaa8e"], [122.3, 197.5, -1.7, 0.96, "#febe34"], [133.7, 203.0, 37.2, 1.05, "#ffcb02"], [145.2, 204.8, 48.6, 0.97, "#ffcb02"], [162.0, 200.2, -43.3, 0.84, "#b67c35"], [180.1, 202.0, -13.0, 0.79, "#fdd93b"], [205.4, 198.5, 58.3, 0.78, "#e5d700"], [225.4, 207.3, 46.8, 0.75, "#a96f08"], [233.4, 200.7, -38.4, 1.01, "#be8509"], [257.6, 208.1, 54.9, 1.13, "#bccd2a"], [271.6, 199.6, 3.5, 0.76, "#66bf46"], [292.9, 201.7, 44.1, 0.91, "#88db67"], [306.3, 199.8, 30.4, 0.92, "#66bf46"], [325.5, 206.6, 19.2, 0.73, "#9de274"], [337.2, 198.1, 60.1, 1.13, "#9de274"], [351.7, 209.6, 37.4, 1.12, "#9de274"], [375.0, 197.2, 44.2, 0.86, "#30d363"], [389.9, 208.1, -9.6, 0.81, "#04cf5e"], [408.4, 200.7, 70.3, 0.83, "#5edf91"], [53.3, 221.8, 83.3, 0.94, "#fb5e0d"], [72.7, 217.4, 11.5, 0.83, "#fdf087"], [83.4, 217.8, 16.9, 1.04, "#ffc25a"], [105.8, 218.4, 30.9, 1.03, "#febe34"], [111.8, 219.9, 84.5, 0.92, "#fca403"], [140.3, 223.1, 44.4, 1.04, "#fca403"], [149.5, 215.6, 68.5, 0.78, "#feb204"], [170.4, 220.7, -14.4, 1.18, "#ffe104"], [191.4, 219.3, 60.2, 1.12, "#f1cb02"], [196.6, 221.5, -65.2, 0.94, "#fed701"], [220.1, 223.1, -12.1, 0.96, "#be8509"], [237.0, 224.5, 15.5, 1.13, "#e1bd01"], [250.4, 221.3, -71.2, 1.08, "#d3d103"], [273.2, 219.2, -52.5, 0.85, "#baca02"], [286.7, 226.6, 8.7, 0.81, "#bccd2a"], [301.8, 224.9, 41.0, 0.85, "#cce667"], [316.3, 216.1, -79.5, 0.98, "#9de274"], [331.7, 225.9, -11.3, 0.83, "#c1e87e"], [351.8, 219.1, -19.2, 0.94, "#ace783"], [375.0, 224.3, -50.0, 1.12, "#9ae389"], [382.4, 217.9, -21.9, 1.2, "#84df86"], [412.7, 214.1, 43.6, 0.77, "#5edf91"], [45.7, 235.0, -58.4, 1.15, "#ffde6e"], [72.6, 233.8, -22.0, 0.97, "#fded74"], [76.4, 241.5, 80.8, 0.93, "#febe34"], [101.6, 238.3, 80.5, 0.87, "#fd9306"], [116.5, 235.7, -8.5, 0.79, "#ffcb02"], [133.0, 239.1, 21.5, 1.15, "#fd9306"], [144.6, 234.5, -63.5, 1.03, "#fed701"], [175.0, 241.5, -48.7, 0.9, "#ffcb02"], [188.6, 244.7, -26.1, 1.13, "#e7a804"], [203.0, 237.9, -77.4, 1.18, "#fed701"], [219.3, 231.4, -33.2, 0.79, "#e1bd01"], [232.4, 236.1, 56.3, 0.75, "#e1bd01"], [250.3, 234.3, -0.7, 1.06, "#d3d103"], [271.3, 239.1, 31.5, 1.15, "#d3d103"], [287.9, 244.4, 56.0, 1.14, "#dde34a"], [306.2, 234.3, 32.5, 0.8, "#c7db4d"], [327.3, 236.7, 45.5, 1.01, "#d6ed7d"], [332.0, 235.7, -7.3, 1.2, "#b7e167"], [348.4, 233.6, 72.6, 0.91, "#c1e87e"], [370.9, 234.0, -49.0, 0.89, "#ace783"], [384.4, 238.1, -38.1, 1.11, "#84df86"], [411.7, 231.4, 68.1, 0.9, "#49db8b"], [54.0, 260.1, -54.8, 0.76, "#fed957"], [71.8, 256.6, 72.4, 0.94, "#febe34"], [78.9, 248.4, 69.2, 1.15, "#fed957"], [103.5, 258.1, -48.6, 1.2, "#fca403"], [115.1, 260.4, -9.9, 1.0, "#feb204"], [129.5, 254.8, 37.6, 0.83, "#fed024"], [169.4, 250.3, 70.6, 1.17, "#ffe104"], [188.3, 260.4, 28.3, 1.02, "#ffcb02"], [206.0, 252.3, 71.9, 0.86, "#d17004"], [213.6, 256.3, 15.5, 0.79, "#e37e05"], [230.0, 255.7, 70.0, 1.13, "#fed701"], [258.6, 259.0, -77.9, 0.83, "#d3d103"], [263.6, 258.8, -82.6, 1.09, "#e5d700"], [282.8, 257.0, 53.9, 0.73, "#f4e850"], [310.3, 255.8, -66.1, 0.91, "#dde34a"], [320.4, 259.7, 26.9, 1.0, "#dfe860"], [343.4, 249.8, -72.2, 0.98, "#d6ed7d"], [352.8, 259.7, 1.8, 0.76, "#cce667"], [373.1, 261.5, 72.0, 0.87, "#ace783"], [385.9, 258.2, -75.1, 0.74, "#84df86"], [401.0, 260.2, 57.9, 1.1, "#5edf91"], [64.2, 271.5, 52.3, 0.74, "#fdd93b"], [80.0, 274.7, 9.3, 0.77, "#fca834"], [99.0, 278.2, 41.5, 1.03, "#fed701"], [119.1, 278.6, 56.0, 1.05, "#fed701"], [135.3, 276.6, -68.1, 0.85, "#ed9204"], [147.6, 265.7, -15.8, 1.04, "#ed9204"], [169.6, 276.7, -65.1, 1.05, "#ffe104"], [180.9, 278.2, 79.1, 0.9, "#ffe104"], [200.9, 275.9, -28.5, 0.84, "#feb204"], [213.6, 277.3, -13.0, 0.81, "#e37e05"], [238.4, 275.8, 39.5, 1.15, "#f1cb02"], [258.5, 267.4, 7.3, 1.11, "#d3d103"], [269.2, 265.9, -13.1, 1.05, "#e5d700"], [284.4, 267.2, -25.7, 0.9, "#fdd93b"], [303.2, 268.9, 52.8, 1.14, "#ebd742"], [327.5, 271.2, 14.6, 1.01, "#ebd742"], [334.1, 267.8, 16.7, 0.76, "#e1bc38"], [361.5, 272.5, -10.3, 1.18, "#cce667"], [376.6, 275.8, -38.3, 0.96, "#beed8f"], [386.3, 276.1, 70.6, 0.75, "#9ae389"], [399.3, 267.9, -35.7, 1.18, "#70e08f"], [66.1, 287.9, -43.1, 1.15, "#fded74"], [78.0, 288.5, 50.8, 1.17, "#fdeb5e"], [102.4, 287.3, 80.9, 1.2, "#febe06"], [121.4, 285.9, 83.0, 1.16, "#fd9306"], [129.9, 286.1, -25.6, 1.06, "#feb204"], [149.9, 289.9, -79.3, 0.88, "#d94814"], [170.1, 286.4, -22.9, 0.78, "#fed701"], [188.3, 295.5, -16.9, 1.15, "#ffe429"], [203.5, 291.3, -38.0, 0.87, "#fd9306"], [215.9, 283.7, -38.8, 0.91, "#bb5309"], [230.0, 295.1, -76.4, 0.79, "#fca403"], [254.7, 283.0, 13.4, 0.95, "#cea603"], [267.0, 284.8, -43.1, 1.18, "#ffe104"], [284.8, 288.9, -71.6, 1.06, "#fdd93b"], [299.8, 289.3, 74.2, 0.98, "#ebd742"], [326.4, 287.0, 59.5, 1.15, "#f4e850"], [339.4, 284.0, -30.1, 1.06, "#f2eb69"], [358.1, 289.4, -32.9, 0.93, "#dfe860"], [367.4, 284.6, -46.0, 1.03, "#c1e87e"], [387.0, 295.5, -74.5, 0.74, "#ade898"], [79.4, 303.1, -36.3, 0.88, "#fdeb5e"], [103.0, 299.1, -6.0, 0.93, "#ffe429"], [116.9, 309.6, 70.3, 1.0, "#fde846"], [136.3, 307.5, -53.7, 1.16, "#ffe104"], [171.8, 309.6, -68.0, 1.01, "#c47229"], [184.3, 305.8, 68.6, 0.79, "#fed701"], [201.4, 300.9, 1.4, 1.0, "#ed9204"], [214.6, 304.7, -13.9, 0.82, "#ffcb02"], [237.1, 310.6, -7.6, 1.15, "#ffe104"], [246.7, 303.1, -57.6, 1.02, "#fed701"], [264.5, 312.3, 8.1, 0.72, "#cc8c31"], [306.5, 312.2, 82.5, 0.89, "#fdeb5e"], [318.0, 302.8, 77.3, 0.86, "#fde846"], [331.8, 312.5, -60.8, 1.21, "#fdeb5e"], [352.8, 300.6, 82.4, 1.22, "#b09a3d"], [366.4, 299.2, -32.5, 0.75, "#d2ef92"], [384.8, 312.6, -25.2, 1.09, "#ade898"], [407.7, 305.7, -34.3, 0.73, "#7fe499"], [100.7, 319.4, 53.8, 0.79, "#ffde6e"], [117.7, 322.0, 11.3, 1.09, "#fde846"], [133.3, 318.7, 12.1, 0.94, "#ffe104"], [155.1, 327.4, 1.7, 1.18, "#fde846"], [172.1, 325.6, -77.3, 0.77, "#9f5525"], [186.9, 324.1, 48.1, 0.83, "#fb5e0d"], [222.7, 320.8, 23.0, 0.89, "#fca403"], [232.6, 323.9, -55.6, 1.17, "#e7a804"], [253.6, 324.2, 68.5, 0.87, "#cc8c31"], [264.6, 323.2, 73.4, 1.22, "#fdd93b"], [291.7, 316.5, -79.9, 0.94, "#fdd93b"], [302.5, 321.6, 19.7, 0.85, "#fdeb5e"], [322.9, 318.5, 11.5, 0.95, "#f4e850"], [342.1, 329.8, -57.3, 1.07, "#f2e77d"], [355.9, 316.2, 47.5, 0.99, "#f2eb69"], [365.2, 321.2, -72.7, 1.16, "#e4d57c"], [386.8, 328.5, 19.5, 1.06, "#c8eda8"], [117.8, 335.5, -15.5, 1.22, "#fdeb5e"], [127.3, 343.3, 1.5, 1.01, "#fded74"], [146.0, 338.9, -10.0, 1.01, "#fde846"], [178.8, 339.5, -5.3, 0.92, "#cc8c31"], [203.4, 338.0, 19.6, 0.79, "#d17004"], [216.6, 337.0, -54.3, 0.92, "#be8509"], [276.6, 343.9, 73.3, 1.22, "#fdeb5e"], [291.4, 345.3, 65.6, 0.87, "#fde846"], [303.1, 337.3, -61.8, 0.94, "#e1bc38"], [316.1, 337.7, -57.7, 0.74, "#b56124"], [341.1, 338.0, 46.4, 1.04, "#f2eb69"], [354.7, 345.7, -28.2, 0.99, "#dfc855"], [173.5, 350.7, 48.3, 1.12, "#b67c35"], [205.2, 362.6, 25.8, 1.05, "#996232"], [249.9, 355.8, -53.7, 1.16, "#fdf087"], [271.4, 362.7, -10.7, 0.95, "#fdf087"], [289.7, 354.0, -14.5, 0.91, "#fde846"], [310.3, 356.4, -12.0, 1.07, "#fdeb5e"], [326.3, 362.1, 36.5, 0.9, "#fded74"], [340.7, 350.2, 61.4, 0.72, "#fdf087"], [357.6, 351.1, 10.3, 0.85, "#f2e77d"], [259.6, 377.9, -69.0, 0.9, "#fcf8ba"], [274.7, 380.0, -25.2, 0.97, "#fcf49d"], [291.2, 379.6, -57.8, 0.99, "#fdf087"], [297.6, 377.4, -57.5, 1.04, "#fcf49d"], [314.8, 368.5, -9.9, 1.08, "#fded74"], [341.7, 375.2, -50.6, 1.17, "#fcf8ba"] ];
  const BRANCHES = [ ["M194 472 C185 424 194 383 188 346 C186 325 179 307 173 294", 22], ["M192 388 C198 355 221 334 252 319 C282 308 307 290 330 269", 13], ["M190 359 C174 320 153 301 127 292 C99 286 79 276 64 264", 10], ["M181 334 C163 302 155 268 163 236 C171 207 165 185 154 160", 8], ["M191 347 C203 310 218 282 216 254 C212 223 226 196 241 169", 9], ["M215 271 C241 245 260 218 269 188 C279 156 308 140 329 125", 5], ["M239 176 C251 141 252 119 249 91 C248 70 255 52 269 40", 4], ["M250 139 C229 119 216 93 215 64", 2.5], ["M262 150 C281 123 310 109 331 105", 3], ["M273 187 C302 169 323 166 349 151", 3], ["M269 213 C289 206 312 204 325 190", 2], ["M162 236 C145 216 128 198 105 187 C86 178 69 163 65 148", 4], ["M157 174 C143 152 142 127 146 107", 3], ["M145 156 C119 147 103 132 93 114", 2], ["M129 292 C122 267 104 252 84 239", 4], ["M112 283 C84 277 60 249 50 230", 2], ["M251 319 C283 329 316 326 339 318 C356 309 370 307 385 311", 5], ["M296 326 C318 305 335 292 359 287", 3], ["M305 294 C309 272 325 259 341 248", 3], ["M215 311 C231 288 251 278 275 272", 4], ["M128 291 C114 277 111 260 113 247", 2], ["M218 253 C198 233 187 220 183 198", 3] ];

  const LEAF_SHAPES = {
    a: { outline: 'M0 17 C-9.5 10.2 -12.4 1.2 -9.2 -8.2 C-6.2 -16.4 3.2 -19.2 9.2 -12.2 C15.2 -4.2 10.2 9.2 0 17Z',
         rib: 'M-3.2 -10.5 Q-0.8 1.5 0 15.5', veins: 'M-1.8 -3.5 Q-5.2 -5.5 -6.8 -4.2 M-1.1 2.2 Q4.2 -0.5 6.1 1.2 M-0.6 7.2 Q-4.2 5.5 -5.5 6.8 M-2.6 -7.5 Q2.5 -10 5 -9' },
    b: { outline: 'M0 19 C-10.4 12.2 -16.2 1.1 -11.2 -10.2 C-6.2 -20.4 4.2 -21.2 11.2 -11.2 C17.2 -2.2 10.2 11.2 0 19Z',
         rib: 'M-4.2 -11.5 Q-1.0 2.5 0 17.2', veins: 'M-2.5 -4.5 Q-6.8 -6.5 -8.5 -4.8 M-1.5 1.8 Q5.2 -1.2 7.4 0.8 M-0.8 8.0 Q-5.0 6.0 -6.8 7.5 M-3.4 -8.5 Q2.8 -11.5 6 -10.4' },
    c: { outline: 'M0 17 C-13.2 13.2 -15.2 2.2 -8.2 -9.2 C-3.2 -18.2 7.2 -17.2 10.2 -7.2 C14.2 2.2 7.2 13.2 0 17Z',
         rib: 'M-2.2 -9.5 Q0.2 3.0 0 14.8', veins: 'M-1.2 -2.8 Q-5.8 -4.0 -7.5 -2.2 M-0.5 3.2 Q4.5 1.2 6.2 2.8 M-0.3 8.5 Q-4.5 7.5 -6 9 M-1.8 -6.5 Q3 -9 5.5 -7.8' }
  };

  const PHRASES = [
    'Você não precisa florescer o tempo todo. Raiz também é crescimento.',
    'O agora é o único chão onde a vida acontece.',
    'Respire. O que é seu encontra o caminho de volta.',
    'Toda folha que cai abre espaço para a luz entrar.',
    'Cuidar de si também é um jeito de cuidar do mundo.',
    'Entre o que foi e o que virá, existe você, aqui.',
    'Crescer devagar ainda é crescer.',
    'É na fronteira do encontro que a gente se transforma.',
    'Sinta primeiro. O entendimento chega depois.',
    'Você é figura e é fundo: tudo em você tem lugar.',
    'Ninguém floresce sozinho. Somos feitos de encontros.',
    'Dê nome ao que sente e o peso muda de lugar.',
    'A pausa também faz parte da música.',
    'Seja gentil com a sua própria estação.',
    'O que você acolhe em si deixa de gritar.',
    'Raízes fundas não temem a ventania.',
    'Hoje, basta estar presente.',
    'Cada cor que você carrega conta uma história que merece ser ouvida.',
    'Mudar é permitir que a vida continue passando por você.',
    'Onde há contato, há vida.',
    'O vento leva a folha, nunca a árvore.',
    'Você pode recomeçar quantas vezes o dia amanhecer.',
    'Escutar-se é o primeiro gesto de coragem.',
    'Permita-se ser obra em andamento.',
    'O que floresce em você perfuma quem está por perto.',
    'Nem toda queda é fim. Algumas são semeadura.',
    'Há beleza em ser inteiro, mesmo aos pedaços.',
    'A vida pulsa no intervalo entre um suspiro e outro.',
    'Olhe de novo: o que parecia fundo pode ser a figura de hoje.',
    'Tudo o que é vivo precisa de tempo, luz e companhia.'
  ];

  /* ===================================================================
     UTILITÁRIOS
     =================================================================== */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rnd = mulberry32(20261110);
  const rr = (a, b) => a + (b - a) * rnd();
  const R = (a, b) => a + (b - a) * Math.random();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeOutBack = t => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

  const S = 0.01;        // 1 unidade do SVG = 1 cm
  const OX = 194;        // eixo do tronco no SVG
  const GY = 478;        // linha do solo no SVG
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = id => root.querySelector(`[data-tree-node="${id}"]`);
  const canvas = $('scene');

  /* ===================================================================
     RENDERIZADOR, CENA, CÂMERA
     =================================================================== */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (err) {
    $('loading-text').textContent = 'Este navegador não conseguiu abrir a cena 3D (WebGL indisponível).';
    throw err;
  }
  const PR = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(PR);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xd9a27f, 0.02);

  const FOV = 35;
  const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.05, 500);
  scene.add(camera);
  const TARGET = new THREE.Vector3(0.28, 2.55, 0);
  const TAN_H = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  let camDist = 10;

  /* ===================================================================
     TEXTURAS PROCEDURAIS (canvas → textura, sem imagens externas)
     =================================================================== */
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  function barkTextures() {
    const W = 512, H = 1024;
    const col = document.createElement('canvas'); col.width = W; col.height = H;
    const hgt = document.createElement('canvas'); hgt.width = W; hgt.height = H;
    const c = col.getContext('2d'), h = hgt.getContext('2d');
    c.fillStyle = '#5b3c26'; c.fillRect(0, 0, W, H);
    h.fillStyle = '#808080'; h.fillRect(0, 0, W, H);
    // manchas largas de tom
    for (let i = 0; i < 260; i++) {
      const x = rnd() * W, y = rnd() * H, r = 20 + rnd() * 70;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      const tone = ['rgba(125,84,50,', 'rgba(60,36,22,', 'rgba(150,108,70,', 'rgba(40,26,18,'][i % 4];
      g.addColorStop(0, tone + '0.22)'); g.addColorStop(1, tone + '0)');
      c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // placas e fissuras verticais (desenhadas 3x para emendar nas bordas)
    for (let i = 0; i < 420; i++) {
      const x0 = rnd() * W, y0 = rnd() * H, len = 40 + rnd() * 240, wob = 6 + rnd() * 16, lw = 1 + rnd() * 5.5;
      const deep = rnd();
      for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) {
        const draw = (ctx, style, width) => {
          ctx.strokeStyle = style; ctx.lineWidth = width; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x0 + ox, y0 + oy);
          ctx.bezierCurveTo(x0 + ox + wob, y0 + oy + len * 0.33, x0 + ox - wob, y0 + oy + len * 0.66, x0 + ox + wob * 0.3, y0 + oy + len);
          ctx.stroke();
        };
        draw(c, `rgba(22,12,7,${0.25 + deep * 0.5})`, lw);
        draw(h, `rgba(0,0,0,${0.3 + deep * 0.55})`, lw * 1.4);
        if (deep > 0.55) { draw(c, 'rgba(176,132,88,0.16)', lw * 0.4); }
      }
    }
    // cristas claras
    for (let i = 0; i < 300; i++) {
      const x0 = rnd() * W, y0 = rnd() * H, len = 30 + rnd() * 150;
      h.strokeStyle = `rgba(255,255,255,${0.12 + rnd() * 0.2})`; h.lineWidth = 3 + rnd() * 7; h.lineCap = 'round';
      h.beginPath(); h.moveTo(x0, y0); h.lineTo(x0 + (rnd() - 0.5) * 12, y0 + len); h.stroke();
    }
    // musgo e líquen esparsos
    for (let i = 0; i < 46; i++) {
      const x = rnd() * W, y = rnd() * H, r = 8 + rnd() * 26;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      const m = i % 3 === 0 ? 'rgba(150,150,128,' : 'rgba(74,104,48,';
      g.addColorStop(0, m + '0.42)'); g.addColorStop(1, m + '0)');
      c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // grão fino
    const id = c.getImageData(0, 0, W, H), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 22; d[i] += n; d[i + 1] += n * 0.9; d[i + 2] += n * 0.8; }
    c.putImageData(id, 0, 0);
    const map = new THREE.CanvasTexture(col); map.colorSpace = THREE.SRGBColorSpace;
    const bump = new THREE.CanvasTexture(hgt);
    for (const t of [map, bump]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso; }
    return { map, bump };
  }

  function groundTextures() {
    const W = 512;
    const cv = document.createElement('canvas'); cv.width = cv.height = W;
    const c = cv.getContext('2d');
    c.fillStyle = '#4a5a26'; c.fillRect(0, 0, W, W);
    const tones = ['rgba(92,112,44,', 'rgba(58,74,28,', 'rgba(110,104,54,', 'rgba(74,58,34,', 'rgba(126,140,62,'];
    for (let i = 0; i < 1500; i++) {
      const x = rnd() * W, y = rnd() * W, r = 4 + rnd() * 30, tone = tones[i % tones.length];
      for (const ox of [-W, 0, W]) for (const oy of [-W, 0, W]) {
        const g = c.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        g.addColorStop(0, tone + '0.3)'); g.addColorStop(1, tone + '0)');
        c.fillStyle = g; c.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
      }
    }
    for (let i = 0; i < 5000; i++) {
      c.strokeStyle = `rgba(${40 + rnd() * 90 | 0},${70 + rnd() * 90 | 0},${20 + rnd() * 40 | 0},0.35)`;
      c.lineWidth = 1; const x = rnd() * W, y = rnd() * W;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 7, y - 2 - rnd() * 7); c.stroke();
    }
    const map = new THREE.CanvasTexture(cv); map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(26, 26); map.anisotropy = maxAniso;
    return map;
  }

  function soilTexture() {
    const W = 256; const cv = document.createElement('canvas'); cv.width = cv.height = W;
    const c = cv.getContext('2d');
    const g = c.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
    g.addColorStop(0, 'rgba(46,30,20,0.95)'); g.addColorStop(0.45, 'rgba(58,40,24,0.7)'); g.addColorStop(1, 'rgba(60,44,26,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, W);
    for (let i = 0; i < 900; i++) {
      const a = rnd() * 6.283, r = Math.pow(rnd(), 0.7) * W * 0.42;
      c.fillStyle = `rgba(${20 + rnd() * 70 | 0},${14 + rnd() * 40 | 0},${8 + rnd() * 24 | 0},${0.25 * (1 - r / (W * 0.45))})`;
      c.beginPath(); c.arc(W / 2 + Math.cos(a) * r, W / 2 + Math.sin(a) * r, 1 + rnd() * 3, 0, 6.283); c.fill();
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  function glowSprite() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const c = cv.getContext('2d'); const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cv);
  }

  // Quadro da folha em unidades do SVG: x ∈ [-18, 18], y ∈ [-23, 21]
  const LW = 36, LH = 44, LCX = 18, LCY = 23;

  function paintLeaf(ctx, type, k, fill) {
    const sh = LEAF_SHAPES[type];
    ctx.save();
    ctx.setTransform(k, 0, 0, k, LCX * k, LCY * k);
    const outline = new Path2D(sh.outline);
    ctx.save(); ctx.clip(outline);
    const g = ctx.createLinearGradient(-14, 18, 14, -20);
    g.addColorStop(0, fill.dark); g.addColorStop(0.5, fill.mid); g.addColorStop(1, fill.light);
    ctx.fillStyle = g; ctx.fillRect(-LCX, -LCY, LW, LH);
    // sombra suave ao longo da nervura central para dar volume
    const g2 = ctx.createLinearGradient(-12, 0, 12, 0);
    g2.addColorStop(0, 'rgba(0,0,0,0.10)'); g2.addColorStop(0.42, 'rgba(0,0,0,0)'); g2.addColorStop(0.5, 'rgba(0,0,0,0.10)'); g2.addColorStop(0.6, 'rgba(255,255,255,0.07)'); g2.addColorStop(1, 'rgba(0,0,0,0.04)');
    ctx.fillStyle = g2; ctx.fillRect(-LCX, -LCY, LW, LH);
    // nervuras
    ctx.lineCap = 'round';
    ctx.strokeStyle = fill.vein; ctx.globalAlpha = fill.veinAlpha;
    ctx.lineWidth = 0.75; ctx.stroke(new Path2D(sh.rib));
    ctx.lineWidth = 0.38; ctx.globalAlpha = fill.veinAlpha * 0.7; ctx.stroke(new Path2D(sh.veins));
    // nervuras finas secundárias
    ctx.lineWidth = 0.16; ctx.globalAlpha = fill.veinAlpha * 0.45;
    for (let i = 0; i < 9; i++) {
      const y = -9 + i * 2.6, x = -2.6 + (y + 10) * 0.1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 5, y - 3, x - 13, y - 2.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + 1.2); ctx.quadraticCurveTo(x + 5, y - 2, x + 13, y - 1.4); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // borda levemente mais escura
    ctx.strokeStyle = `rgba(0,0,0,${fill.edge})`; ctx.lineWidth = 1.1; ctx.stroke(outline);
    ctx.restore();
    ctx.restore();
    return outline;
  }

  function leafTexture(type) {
    const W = 256, H = Math.round(W * LH / LW);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    paintLeaf(ctx, type, W / LW, { dark: '#b9b9b9', mid: '#e6e6e6', light: '#ffffff', vein: '#ffffff', veinAlpha: 0.5, edge: 0.07 });
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
    return t;
  }

  function hexMix(hex, target, amt) {
    const n = parseInt(hex.slice(1), 16);
    const ch = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => Math.round(v + (target - v) * amt));
    return `rgb(${ch[0]},${ch[1]},${ch[2]})`;
  }
  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(n >> 16 & 255) + 0.7152 * f(n >> 8 & 255) + 0.0722 * f(n & 255);
  }

  // Folha-mensagem: folha colorida em alta resolução com a frase composta dentro do contorno.
  function messageTexture(type, hex, phrase) {
    const W = 1024, H = Math.round(W * LH / LW), k = W / LW;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const darkInk = luminance(hex) > 0.34;
    paintLeaf(ctx, type, k, {
      dark: hexMix(hex, 0, 0.22), mid: hex, light: hexMix(hex, 255, 0.26),
      vein: darkInk ? '#fffdf2' : '#fff7e6', veinAlpha: 0.2, edge: 0.16
    });
    // contorno em espaço de pixels para medir a largura útil em cada linha
    const px = new Path2D(); px.addPath(new Path2D(LEAF_SHAPES[type].outline), new DOMMatrix([k, 0, 0, k, LCX * k, LCY * k]));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const span = y => {
      let a = -1, b = -1;
      for (let x = 0; x < W; x += 6) if (ctx.isPointInPath(px, x, y)) { if (a < 0) a = x; b = x; }
      if (a < 0) return null;
      const pad = W * 0.085; a += pad; b -= pad;
      return b - a > 60 ? { c: (a + b) / 2, w: b - a } : null;
    };
    const words = phrase.split(/\s+/);
    const yMin = (LCY - 15.5) * k, yMax = (LCY + 6.5) * k, yMid = (LCY - 4.2) * k;
    let best = null;
    for (const fs of [84, 78, 72, 66, 60, 56, 52, 48, 44, 40, 36, 32]) {
      ctx.font = `italic 500 ${fs}px "Playfair Display", Georgia, serif`;
      const lh = fs * 1.2;
      let start = yMid - lh, lines = null;
      for (let pass = 0; pass < 5; pass++) {
        lines = []; let i = 0, y = start, ok = true;
        while (i < words.length) {
          const s = span(y - fs * 0.3); const s2 = span(y + fs * 0.12);
          if (!s || !s2) { ok = false; break; }
          const w = Math.min(s.w, s2.w), cx = (s.c + s2.c) / 2;
          let line = words[i];
          if (ctx.measureText(line).width > w) { ok = false; break; }
          i++;
          while (i < words.length && ctx.measureText(line + ' ' + words[i]).width <= w) { line += ' ' + words[i]; i++; }
          lines.push({ text: line, y, cx });
          y += lh;
        }
        if (!ok) { lines = null; break; }
        const want = yMid - (lines.length - 1) * lh / 2;
        if (Math.abs(want - start) < 2) break;
        start = want;
      }
      if (!lines) continue;
      const top = lines[0].y - fs * 0.8, bot = lines[lines.length - 1].y + fs * 0.3;
      const widow = lines.length > 1 && lines[lines.length - 1].text.length < 4;
      if (top >= yMin && bot <= yMax && !widow) { best = { fs, lines }; break; }
      if (!best && top >= yMin - 20 && bot <= yMax + 30) best = { fs, lines };
    }
    if (best) {
      ctx.font = `italic 500 ${best.fs}px "Playfair Display", Georgia, serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.shadowColor = darkInk ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 10;
      ctx.fillStyle = darkInk ? '#2a160c' : '#fffaf0';
      for (const l of best.lines) ctx.fillText(l.text, l.cx, l.y);
      ctx.shadowBlur = 0;
    }
    // assinatura discreta perto da ponta
    const sy = (LCY + 10.6) * k, ss = span(sy);
    if (ss) {
      ctx.font = '600 25px "DM Sans", system-ui, sans-serif';
      try { ctx.letterSpacing = '7px'; } catch (e) { /* navegadores antigos */ }
      ctx.textAlign = 'center'; ctx.globalAlpha = 0.62;
      ctx.fillStyle = darkInk ? '#2a160c' : '#fffaf0';
      ctx.fillText('FIGURA VIVA', ss.c + 3, sy);
      ctx.globalAlpha = 1;
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
    return t;
  }

  /* ===================================================================
     CÉU, LUZES, SOLO
     =================================================================== */
  const skyUniforms = {
    uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uBottom: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color() }, uSunGlow: { value: 1 }
  };
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyUniforms,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vDir; uniform vec3 uTop,uHorizon,uBottom,uSunDir,uSunCol; uniform float uSunGlow;
      void main(){ vec3 d = normalize(vDir); float h = d.y;
        vec3 c = mix(uHorizon, uTop, pow(clamp(h,0.0,1.0), 0.5));
        c = mix(c, uBottom, smoothstep(0.0, -0.18, h));
        float s = max(dot(d, uSunDir), 0.0);
        c += uSunCol * uSunGlow * (pow(s, 900.0) * 6.0 + pow(s, 40.0) * 0.35 + pow(s, 5.0) * 0.07);
        gl_FragColor = vec4(c, 1.0); }`
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(220, 32, 20), skyMat);
  sky.frustumCulled = false; if (background) scene.add(sky);
  const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 24, 16), skyMat));
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT = null;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.castShadow = true; sun.shadow.mapSize.set(512, 512);
  const sc = sun.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -3; sc.near = 1; sc.far = 50;
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.025;
  scene.add(sun); scene.add(sun.target); sun.target.position.set(0.5, 1.5, 0);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5); scene.add(fill);

  const groundMat = new THREE.MeshStandardMaterial({ map: groundTextures(), roughness: 1, metalness: 0 });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(120, 64), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; if (background) scene.add(ground);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(1.7, 40), new THREE.MeshStandardMaterial({ map: soilTexture(), transparent: true, depthWrite: false, roughness: 1 }));
  soil.rotation.x = -Math.PI / 2; soil.position.y = 0.006; soil.receiveShadow = true; if (background) scene.add(soil);

  // Grama: lâminas instanciadas que balançam no shader
  const windUniforms = { uTime: { value: 0 }, uWind: { value: 1 } };

  if (background) (function buildGrass() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, -0.32, 0.5, 0, 0.32, 0.5, 0, 0, 1, 0], 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 0.5, 1, 0.5, 0.5, 1], 2));
    g.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4]);
    const N = 6000;
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uTime = windUniforms.uTime; sh.uniforms.uWind = windUniforms.uWind;
      sh.vertexShader = 'uniform float uTime; uniform float uWind;\n' + sh.vertexShader.replace('#include <project_vertex>', `
        vec4 mvPosition = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
          float gw = sin(uTime * 2.1 + mvPosition.x * 1.4 + mvPosition.z * 0.9) * 0.6 + sin(uTime * 3.9 + mvPosition.x * 3.1 - mvPosition.z * 2.3) * 0.4;
          float bend = uv.y * uv.y;
          mvPosition.x += bend * (0.035 * uWind + gw * 0.018 * (0.5 + uWind));
          mvPosition.z += bend * gw * 0.01;
        #endif
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;`);
    };
    const mesh = new THREE.InstancedMesh(g, mat, N);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler(), col = new THREE.Color();
    for (let i = 0; i < N; i++) {
      // mais densa perto da câmera e ao redor da árvore
      let x, z;
      if (i % 3 === 0) { const a = rnd() * 6.283, r = 0.35 + Math.pow(rnd(), 0.8) * 5; x = Math.cos(a) * r; z = Math.sin(a) * r; }
      else { x = rr(-9, 9); z = rr(-5, 12); }
      const h = rr(0.05, 0.16) * (i % 11 === 0 ? 1.5 : 1);
      p.set(x, 0, z); e.set(rr(-0.25, 0.25), rnd() * 6.283, rr(-0.25, 0.25)); q.setFromEuler(e); s.set(rr(0.008, 0.015), h, 1);
      m.compose(p, q, s); mesh.setMatrixAt(i, m);
      col.setHSL(rr(0.22, 0.31), rr(0.45, 0.65), rr(0.16, 0.3)); mesh.setColorAt(i, col);
    }
    mesh.receiveShadow = true; mesh.frustumCulled = false; scene.add(mesh);
  })();

  /* ===================================================================
     ÁRVORE: tronco, galhos, raízes e raminhos como tubos afilados
     =================================================================== */
  const tree = new THREE.Group(); tree.visible = !background; scene.add(tree);

  function parsePath(d) {
    const n = d.match(/-?[\d.]+/g).map(Number); const segs = []; let p0 = [n[0], n[1]];
    for (let i = 2; i + 5 < n.length; i += 6) { const s = [p0, [n[i], n[i + 1]], [n[i + 2], n[i + 3]], [n[i + 4], n[i + 5]]]; segs.push(s); p0 = s[3]; }
    return segs;
  }
  function bez(s, t) { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t; return [a * s[0][0] + b * s[1][0] + c * s[2][0] + e * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + e * s[3][1]]; }

  class TubeBuilder {
    constructor() { this.pos = []; this.nor = []; this.uv = []; this.idx = []; }
    tube(pts, radiusFn, radial, lenSegs, wobble) {
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      const P = curve.getSpacedPoints(lenSegs), F = curve.computeFrenetFrames(lenSegs, false);
      const base = this.pos.length / 3; let L = 0;
      const uRep = Math.max(1, Math.round(radiusFn(0, P[0]) * 2 * Math.PI / 0.3));
      for (let i = 0; i <= lenSegs; i++) {
        if (i > 0) L += P[i].distanceTo(P[i - 1]);
        const r0 = radiusFn(i / lenSegs, P[i]), N = F.normals[i], B = F.binormals[i];
        for (let j = 0; j <= radial; j++) {
          const a = j / radial * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a);
          const nx = cs * N.x + sn * B.x, ny = cs * N.y + sn * B.y, nz = cs * N.z + sn * B.z;
          const r = r0 * (1 + wobble * (Math.sin(a * 3 + L * 7) * 0.6 + Math.sin(a * 5 - L * 13) * 0.4));
          this.pos.push(P[i].x + nx * r, P[i].y + ny * r, P[i].z + nz * r);
          this.nor.push(nx, ny, nz); this.uv.push(j / radial * uRep, L / 0.9);
        }
      }
      const row = radial + 1;
      for (let i = 0; i < lenSegs; i++) for (let j = 0; j < radial; j++) {
        const a = base + i * row + j, b = a + row;
        this.idx.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    geometry() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
      g.setIndex(this.idx); return g;
    }
  }

  const wood = new TubeBuilder();
  const nodes = [];           // pontos de ancoragem (amostras dos galhos + folhas já ligadas)
  const branchSamples = [];

  BRANCHES.forEach(([d, width], bi) => {
    const segs = parsePath(d); const raw = [];
    segs.forEach((s, si) => { for (let k = si === 0 ? 0 : 1; k <= 12; k++) raw.push(bez(s, k / 12)); });
    let len = 0; const acc = [0];
    for (let i = 1; i < raw.length; i++) { len += Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]); acc.push(len); }
    // profundidade: parte do ponto do galho-pai e se afasta em Z ao longo do comprimento
    let zStart = 0;
    if (bi > 0) {
      let bestD = 1e9;
      for (let j = 0; j < bi; j++) for (const sp of branchSamples[j]) { const dd = Math.hypot(sp.sx - raw[0][0], sp.sy - raw[0][1]); if (dd < bestD) { bestD = dd; zStart = sp.z; } }
    }
    const bias = bi === 0 ? 0.05 : (bi % 2 ? 1 : -1) * rr(0.35, 0.8) * clamp(len / 160, 0.45, 1.1);
    const samples = raw.map((p, i) => {
      const t = acc[i] / len;
      return { sx: p[0], sy: p[1], t, z: zStart + bias * Math.pow(t, 1.15) + (bi ? 0.04 * Math.sin(t * 6 + bi) : 0) };
    });
    branchSamples.push(samples);
    samples.forEach(s => nodes.push({ sx: s.sx, sy: s.sy, z: s.z, branch: true }));
    const pts = samples.map(s => new THREE.Vector3((s.sx - OX) * S, (GY - s.sy) * S, s.z));
    if (bi === 0) { pts.unshift(new THREE.Vector3(0.005, -0.12, 0)); pts.unshift(new THREE.Vector3(0.012, -0.4, 0)); }
    const r0 = width * 0.5 * S * (bi === 0 ? 1.2 : 1.05);
    const radiusFn = bi === 0
      ? (u, p) => r0 * lerp(1.0, 0.5, u) * (1 + 1.0 * Math.exp(-Math.max(p.y, 0) * 4.2))
      : (u) => Math.max(0.004, r0 * lerp(1, 0.28, Math.pow(u, 0.85)) * (u > 0.96 ? lerp(1, 0.35, (u - 0.96) / 0.04) : 1));
    wood.tube(pts, radiusFn, r0 > 0.05 ? 14 : r0 > 0.02 ? 9 : 6, Math.max(10, Math.round(len / 7)), bi === 0 ? 0.07 : 0.05);
  });

  // raízes aparentes
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + rr(-0.25, 0.25), reach = rr(0.55, 1.05), cx = Math.cos(a), cz = Math.sin(a);
    const pts = [
      new THREE.Vector3(cx * 0.05, 0.36, cz * 0.05),
      new THREE.Vector3(cx * 0.17, 0.13, cz * 0.17),
      new THREE.Vector3(cx * reach * 0.55 + rr(-0.05, 0.05), 0.045, cz * reach * 0.55 + rr(-0.05, 0.05)),
      new THREE.Vector3(cx * reach + rr(-0.08, 0.08), -0.05, cz * reach + rr(-0.08, 0.08))
    ];
    const rb = rr(0.045, 0.07);
    wood.tube(pts, u => lerp(rb, 0.012, Math.pow(u, 0.7)), 8, 14, 0.08);
  }

  // folhas: cada pétala do logotipo se liga ao ponto mais próximo (galho ou folha vizinha)
  const order = PETALS.map((p, i) => {
    let best = 1e9; for (const n of nodes) { const dd = Math.hypot(n.sx - p[0], n.sy - p[1]); if (dd < best) best = dd; }
    return { i, d: best };
  }).sort((a, b) => a.d - b.d);

  const leafDefs = [];
  for (const { i } of order) {
    const [sx, sy, ang, scale, hex] = PETALS[i];
    let best = null, bestD = 1e9;
    for (const n of nodes) { const dd = Math.hypot(n.sx - sx, n.sy - sy); if (dd < bestD) { bestD = dd; best = n; } }
    const z = clamp(best.z + rr(-1, 1) * (0.07 + bestD * S * 1.1), -1.25, 1.25);
    nodes.push({ sx, sy, z });
    const pos = new THREE.Vector3((sx - OX) * S, (GY - sy) * S, z);
    if (bestD < 90 && bestD > 3) {
      const a = new THREE.Vector3((best.sx - OX) * S, (GY - best.sy) * S, best.z);
      const mid = a.clone().lerp(pos, 0.5).add(new THREE.Vector3(rr(-0.03, 0.03), rr(-0.01, 0.04), rr(-0.03, 0.03)));
      wood.tube([a, mid, pos], u => lerp(best.branch ? 0.009 : 0.006, 0.003, u), 4, 5, 0);
    }
    leafDefs.push({ pos, ang, scale: scale * 0.88, hex, type: 'abc'[i % 3], primary: true });
    // segunda camada de folhagem para dar volume em 3D
    const n2 = scale > 0.95 ? 3 : 2;
    for (let k = 0; k < n2; k++) {
      const c = new THREE.Color(hex); c.offsetHSL(rr(-0.012, 0.012), rr(-0.04, 0.04), rr(-0.09, 0.03));
      leafDefs.push({
        pos: pos.clone().add(new THREE.Vector3(rr(-0.2, 0.2), rr(-0.2, 0.2), rr(-0.45, 0.32))),
        ang: ang + rr(-70, 70), scale: scale * rr(0.52, 0.85), hex: '#' + c.getHexString(), type: 'abc'[(i + k + 1) % 3], primary: false
      });
    }
  }

  const bark = barkTextures();
  const barkMat = new THREE.MeshStandardMaterial({ map: bark.map, bumpMap: bark.bump, bumpScale: 2.2, roughness: 0.93, metalness: 0 });
  const woodMesh = new THREE.Mesh(wood.geometry(), barkMat);
  woodMesh.castShadow = true; woodMesh.receiveShadow = true; tree.add(woodMesh);

  /* ===================================================================
     FOLHAS: geometria curva, material translúcido, instâncias
     =================================================================== */
  function leafGeometry(sx, sy, cup) {
    const g = new THREE.PlaneGeometry(LW * S, LH * S, sx, sy);
    g.translate(0, (LH / 2 - LCY) * S, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const xn = p.getX(i) / (LW * 0.5 * S), yn = p.getY(i) / (LH * 0.5 * S);
      p.setZ(i, S * cup * (-3.2 * xn * xn - 1.4 * yn * yn + 0.9 * yn));
    }
    g.computeVertexNormals(); return g;
  }
  const leafGeo = leafGeometry(4, 6, 1);
  const heroGeo = leafGeometry(14, 18, 0.55);

  const leafUniforms = { uSunDirV: { value: new THREE.Vector3() }, uSunCol: { value: new THREE.Color() }, uTrans: { value: 0.6 }, uGlow: { value: 0.05 } };
  function translucent(mat) {
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, leafUniforms);
      sh.fragmentShader = 'uniform vec3 uSunDirV; uniform vec3 uSunCol; uniform float uTrans; uniform float uGlow;\n' +
        sh.fragmentShader.replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
          { float back = saturate( dot( -normal, uSunDirV ) );
            reflectedLight.directDiffuse += diffuseColor.rgb * uSunCol * ( uTrans * back * 0.3183 );
            totalEmissiveRadiance += diffuseColor.rgb * uGlow; }`);
    };
    return mat;
  }

  const TYPES = ['a', 'b', 'c'];
  const leafTex = {}, leafMat = {}, leafDepth = {};
  for (const t of TYPES) {
    leafTex[t] = leafTexture(t);
    leafMat[t] = translucent(new THREE.MeshStandardMaterial({ map: leafTex[t], alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.5, metalness: 0, color: 0xffffff }));
    leafDepth[t] = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: leafTex[t], alphaTest: 0.42 });
  }

  const leaves = [];
  const attached = {};
  const _m = new THREE.Matrix4(), _e = new THREE.Euler(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
  const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _sc = new THREE.Vector3();
  for (const t of TYPES) {
    const defs = leafDefs.filter(d => d.type === t);
    const mesh = new THREE.InstancedMesh(leafGeo, leafMat[t], defs.length);
    mesh.customDepthMaterial = leafDepth[t]; mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
    defs.forEach((d, idx) => {
      const variation = rr(0.93, 1.05);
      const baseQ = new THREE.Quaternion().setFromEuler(_e.set(0, 0, -THREE.MathUtils.degToRad(d.ang)));
      const tilt = new THREE.Quaternion().setFromEuler(_e.set(rr(-0.55, 0.45), rr(-0.7, 0.7), 0));
      baseQ.premultiply(tilt);
      const color = new THREE.Color(d.hex);
      mesh.setColorAt(idx, color);
      leaves.push({
        type: t, mesh, idx, hex: d.hex, color, primary: d.primary,
        anchor: d.pos, baseQ, scl: new THREE.Vector3(d.scale * 0.88 * variation, d.scale * variation, d.scale * variation),
        ph: rnd() * 6.283, f1: rr(3.2, 6.5), f2: rr(2.2, 4.8), flex: rr(0.7, 1.35),
        ox: 0, oy: 0, oz: 0, vx: 0, vy: 0, vz: 0, rx: 0, rz: 0, wx: 0, wz: 0,
        grow: 1, delay: 0
      });
    });
    attached[t] = mesh; tree.add(mesh);
  }

  /* ===================================================================
     VENTO
     =================================================================== */
  const W = { strength: reduceMotion ? 0.4 : 0.8, gust: 0, fall: 1.2 };
  function windAt(p, t, out) {
    const base = W.strength * 1.35 + W.gust;
    const g1 = Math.sin(t * 0.7 + p.x * 0.35 + p.y * 0.15), g2 = Math.sin(t * 1.9 - p.x * 0.9 + p.z * 0.7 + 1.7), g3 = Math.cos(t * 1.3 + p.y * 0.8 + p.z * 0.5);
    const sp = base * (0.75 + 0.35 * g1 + 0.2 * g2);
    return out.set(sp, base * 0.22 * g3, base * 0.3 * g2 * g1);
  }

  /* ===================================================================
     FÍSICA DAS FOLHAS SOLTAS (corpo rígido leve com arrasto anisotrópico)
     =================================================================== */
  const PHYS = { G: 5.5, CN: 34, CT: 5, KQ: 26, KA: 5, KD: 2.2, KT: 16 };
  const _n = new THREE.Vector3(), _u = new THREE.Vector3(), _f = new THREE.Vector3(), _fn = new THREE.Vector3(), _ut = new THREE.Vector3();
  const _ax = new THREE.Vector3(), _tq = new THREE.Vector3(), _c = new THREE.Vector3(), _w = new THREE.Vector3(), _dq = new THREE.Quaternion();
  const UP = new THREE.Vector3(0, 1, 0);

  function newBody(p, q, v) {
    return { p: p.clone(), q: q.clone(), v: v.clone(), w: new THREE.Vector3(R(-3, 3), R(-3, 3), R(-3, 3)), state: 'air', age: 0, groundT: 0, rest: R(0.03, 0.1), fl: R(4, 9), qT: new THREE.Quaternion(), fade: 1 };
  }

  function stepBody(b, dt, time) {
    b.age += dt;
    if (b.state === 'ground') {
      b.groundT += dt;
      if (b.groundT < 0.6) b.q.slerp(b.qT, 1 - Math.exp(-9 * dt));
      // rajadas fortes levantam de novo as folhas do chão
      if (W.gust > 1.3 && Math.random() < dt * 0.5) {
        b.state = 'air'; windAt(b.p, time, _w);
        b.v.set(_w.x * 0.5, R(1.4, 2.8), R(-0.6, 0.6)); b.w.set(R(-6, 6), R(-6, 6), R(-6, 6)); b.p.y += 0.03;
      }
      return;
    }
    windAt(b.p, time, _w);
    _n.set(0, 0, 1).applyQuaternion(b.q);
    _u.copy(b.v).sub(_w);
    const un = _u.dot(_n);
    _f.set(0, -PHYS.G, 0);
    _fn.copy(_n).multiplyScalar(-PHYS.CN * Math.abs(un) * un);        // pressão na face da folha
    _ut.copy(_u).addScaledVector(_n, -un);
    _f.add(_fn).addScaledVector(_ut, -PHYS.CT);                        // atrito de perfil
    _ax.set(0, 1, 0).applyQuaternion(b.q);
    _tq.copy(_ax).multiplyScalar(0.05).cross(_fn).multiplyScalar(PHYS.KQ);   // centro de pressão fora do centro de massa
    _tq.addScaledVector(_c.copy(_n).cross(_u), PHYS.KA * un);          // acoplamento que faz a folha oscilar
    _tq.addScaledVector(_ax, Math.sin(b.age * b.fl) * 7);
    _tq.x += (Math.random() - 0.5) * PHYS.KT; _tq.y += (Math.random() - 0.5) * PHYS.KT; _tq.z += (Math.random() - 0.5) * PHYS.KT;
    b.w.addScaledVector(_tq, dt).multiplyScalar(Math.exp(-PHYS.KD * dt));
    const wl = b.w.length(); if (wl > 14) b.w.multiplyScalar(14 / wl);
    b.v.addScaledVector(_f, dt);
    b.p.addScaledVector(b.v, dt);
    _dq.set(b.w.x * dt * 0.5, b.w.y * dt * 0.5, b.w.z * dt * 0.5, 0).multiply(b.q);
    b.q.x += _dq.x; b.q.y += _dq.y; b.q.z += _dq.z; b.q.w += _dq.w; b.q.normalize();
    // colisão com o tronco
    if (b.p.y < 1.9) {
      const cx = -0.114 * b.p.y, dx = b.p.x - cx, dz = b.p.z, d = Math.hypot(dx, dz), rad = 0.13 + 0.1 * Math.exp(-b.p.y * 4);
      if (d < rad && d > 1e-4) {
        const nx = dx / d, nz = dz / d; b.p.x = cx + nx * rad; b.p.z = nz * rad;
        const vn = b.v.x * nx + b.v.z * nz; if (vn < 0) { b.v.x -= 1.4 * vn * nx; b.v.z -= 1.4 * vn * nz; }
      }
    }
    // pouso
    if (b.p.y <= b.rest) {
      b.p.y = b.rest; b.state = 'ground'; b.groundT = 0; b.v.set(0, 0, 0); b.w.set(0, 0, 0);
      _n.set(0, 0, 1).applyQuaternion(b.q);
      _c.copy(UP).multiplyScalar(_n.y >= 0 ? 1 : -1);
      _c.x += R(-0.22, 0.22); _c.z += R(-0.22, 0.22); _c.normalize();
      b.qT.setFromUnitVectors(_n, _c).multiply(b.q);
    }
  }

  // folhas soltas comuns: instâncias por formato
  const CAP = 150;
  const loose = { a: [], b: [], c: [] }, looseMesh = {};
  for (const t of TYPES) {
    const mesh = new THREE.InstancedMesh(leafGeo, leafMat[t], CAP);
    mesh.customDepthMaterial = leafDepth[t]; mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
    const c = new THREE.Color(1, 1, 1); for (let i = 0; i < CAP; i++) mesh.setColorAt(i, c);
    mesh.count = 0; looseMesh[t] = mesh; if (!background) scene.add(mesh);
  }

  const _lp = new THREE.Vector3(), _lq = new THREE.Quaternion();
  function leafWorld(L, pos, quat) {
    pos.set(L.anchor.x + L.ox, L.anchor.y + L.oy, L.anchor.z + L.oz).applyMatrix4(tree.matrixWorld);
    _q.set(L.rx * 0.5, 0, L.rz * 0.5, 1).normalize();
    quat.copy(tree.quaternion).multiply(_q).multiply(L.baseQ);
  }

  function detach(L, impulse) {
    if (L.grow < 0.95) return null;
    leafWorld(L, _lp, _lq);
    windAt(_lp, clockT, _w);
    _v.copy(_w).multiplyScalar(0.45).add(impulse || _v2.set(R(-0.3, 0.3), R(-0.1, 0.5), R(-0.3, 0.3)));
    const b = newBody(_lp, _lq, _v);
    b.scl = L.scl.clone(); b.color = L.color; b.type = L.type;
    L.grow = 0; L.delay = R(2.5, 6);
    const list = loose[L.type];
    if (list.length >= CAP) { let k = list.findIndex(x => x.state === 'ground'); list.splice(k < 0 ? 0 : k, 1); }
    list.push(b);
    return b;
  }

  /* ===================================================================
     FOLHA-MENSAGEM: salta da copa até a tela, mostra a frase e volta a cair
     =================================================================== */
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false }));
  veil.renderOrder = 998; veil.frustumCulled = false; camera.add(veil);

  let deck = [];
  function nextPhrase() {
    if (!deck.length) { deck = PHRASES.map((_, i) => i); for (let i = deck.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [deck[i], deck[j]] = [deck[j], deck[i]]; } }
    return PHRASES[deck.pop()];
  }

  let hero = null;            // folha em voo ou em exibição
  const fallen = [];          // folhas-mensagem já soltas, ainda em cena
  let lastSummon = 0, veilTarget = 0;

  function heroDistance() {
    const a = camera.aspect;
    return Math.max(0.40 / (0.6 * 2 * TAN_H), 0.31 / (0.8 * 2 * TAN_H * a));
  }
  const _ht = new THREE.Vector3(), _hq = new THREE.Quaternion(), _fwd = new THREE.Vector3();
  function heroTarget(time, out, outQ) {
    const d = heroDistance(), vis = 2 * d * TAN_H;
    _v.set(Math.sin(time * 0.9) * 0.008, 0.035 * vis + Math.sin(time * 1.3) * 0.006, -d);
    out.copy(_v).applyMatrix4(camera.matrixWorld);
    _e.set(-0.05 + pointer.ny * 0.08 + Math.sin(time * 0.7) * 0.03, pointer.nx * 0.16 + Math.sin(time * 0.55) * 0.1, 0.045 + Math.sin(time * 0.8) * 0.035);
    outQ.copy(camera.quaternion).multiply(_q2.setFromEuler(_e));
  }

  function pickLeaf() {
    const pool = leaves.filter(L => L.primary && L.grow >= 1);
    return pool.length ? pool[Math.random() * pool.length | 0] : null;
  }

  function summon(L) {
    if (hero) releaseHero();
    L = L || pickLeaf(); if (!L || L.grow < 0.95) return;
    const phrase = nextPhrase();
    leafWorld(L, _lp, _lq);
    const tex = messageTexture(L.type, L.hex, phrase);
    const mat = translucent(new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, roughness: 0.55, metalness: 0, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.2 }));
    const mesh = new THREE.Mesh(heroGeo, mat);
    mesh.renderOrder = 999; mesh.castShadow = true; mesh.frustumCulled = false; scene.add(mesh);
    hero = { mesh, tex, mat, phase: 'fly', t: 0, hold: clamp(4.2 + phrase.length * 0.075, 6, 10), p0: _lp.clone(), q0: _lq.clone(), s0: L.scl.clone(), body: null, phrase };
    L.grow = 0; L.delay = R(4, 7);
    lastSummon = clockT; veilTarget = 0;
    $('phrase-live').textContent = phrase; onPhrase(phrase);
    showHint('Toque na tela para soltar a folha', 5200);
  }

  function releaseHero() {
    if (!hero) return;
    const h = hero; hero = null; veilTarget = 0;
    camera.getWorldDirection(_fwd);
    _v.copy(_fwd).multiplyScalar(R(2.6, 3.4)); _v.y += R(1.2, 1.9); _v.x += R(-0.5, 0.9);
    h.body = newBody(h.mesh.position, h.mesh.quaternion, _v);
    h.body.w.set(R(-2, 2), R(-2, 2), R(-3, 3));
    h.sNow = h.mesh.scale.x; h.phase = 'fall'; h.mesh.renderOrder = 0;
    fallen.push(h);
    if (fallen.length > 6) removeHero(fallen.shift());
  }
  function removeHero(h) { scene.remove(h.mesh); h.tex.dispose(); h.mat.dispose(); }

  function updateHero(dt, time) {
    veil.material.opacity += (veilTarget - veil.material.opacity) * (1 - Math.exp(-4 * dt));
    veil.visible = veil.material.opacity > 0.005;
    if (veil.visible) { const d = heroDistance() + 0.45; veil.position.set(0, 0, -d); veil.scale.set(2 * d * TAN_H * camera.aspect * 1.2, 2 * d * TAN_H * 1.2, 1); }
    if (hero) {
      const h = hero; h.t += dt;
      heroTarget(time, _ht, _hq);
      if (h.phase === 'fly') {
        const T = 1.7, u = clamp(h.t / T, 0, 1), e = easeOutCubic(u);
        // arco de Bézier: sobe, vem na direção da câmera e pousa diante dela
        _v.copy(h.p0).lerp(_ht, 0.45); _v.y += 1.1;
        const a = (1 - e) * (1 - e), b = 2 * (1 - e) * e, c = e * e;
        h.mesh.position.set(a * h.p0.x + b * _v.x + c * _ht.x, a * h.p0.y + b * _v.y + c * _ht.y, a * h.p0.z + b * _v.z + c * _ht.z);
        h.mesh.quaternion.copy(h.q0).slerp(_hq, e);
        h.mesh.quaternion.multiply(_q2.setFromAxisAngle(_v2.set(0.25, 1, 0.1).normalize(), (1 - e) * Math.PI * 4));
        const sb = easeOutBack(u);
        h.mesh.scale.set(lerp(h.s0.x, 1, sb), lerp(h.s0.y, 1, sb), lerp(h.s0.z, 1, sb));
        if (u >= 1) { h.phase = 'hold'; h.t = 0; }
      } else {
        h.mesh.position.lerp(_ht, 1 - Math.exp(-10 * dt));
        h.mesh.quaternion.slerp(_hq, 1 - Math.exp(-8 * dt));
        if (h.t > h.hold) releaseHero();
      }
    }
    for (let i = fallen.length - 1; i >= 0; i--) {
      const h = fallen[i], b = h.body;
      stepBody(b, dt * 0.5, time); stepBody(b, dt * 0.5, time + dt * 0.5);
      h.mesh.position.copy(b.p); h.mesh.quaternion.copy(b.q);
      if (b.state === 'ground' && b.groundT > 45) b.fade -= dt * 0.5;
      const s = h.sNow * Math.max(0, b.fade); h.mesh.scale.set(s, s, s);
      if (b.fade <= 0 || b.p.length() > 60) { removeHero(h); fallen.splice(i, 1); }
    }
  }

  /* ===================================================================
     PARTÍCULAS: pólen/vaga-lumes e estrelas
     =================================================================== */
  const MOTES = 170;
  const motePos = new Float32Array(MOTES * 3), moteCol = new Float32Array(MOTES * 3), moteSeed = new Float32Array(MOTES), moteBase = [];
  const palette = ['#fe7bb7', '#fed701', '#49db8b', '#fff3d6', '#ffd27a'].map(h => new THREE.Color(h));
  for (let i = 0; i < MOTES; i++) {
    motePos[i * 3] = R(-6.5, 7); motePos[i * 3 + 1] = R(0.1, 6); motePos[i * 3 + 2] = R(-4, 6);
    moteSeed[i] = Math.random() * 100; moteBase.push(palette[i % palette.length]);
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  moteGeo.setAttribute('color', new THREE.BufferAttribute(moteCol, 3));
  const moteMat = new THREE.PointsMaterial({ map: glowSprite(), size: 0.07, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, sizeAttenuation: true, fog: false });
  const motes = new THREE.Points(moteGeo, moteMat); motes.frustumCulled = false; scene.add(motes);
  let moteLevel = 0.5, firefly = 0;

  const starGeo = new THREE.BufferGeometry();
  { const sp = new Float32Array(700 * 3);
    for (let i = 0; i < 700; i++) { const a = Math.random() * 6.283, y = Math.pow(Math.random(), 0.7) * 0.95 + 0.03, r = Math.sqrt(1 - y * y); sp[i * 3] = Math.cos(a) * r * 200; sp[i * 3 + 1] = y * 200; sp[i * 3 + 2] = Math.sin(a) * r * 200; }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3)); }
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdfe8ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.9, fog: false, depthWrite: false }));
  stars.frustumCulled = false; scene.add(stars);

  /* ===================================================================
     PÓS-PROCESSAMENTO
     =================================================================== */
  const rt = new THREE.WebGLRenderTarget(root.clientWidth * PR, root.clientHeight * PR, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(root.clientWidth, root.clientHeight), 0.25, 0.7, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ===================================================================
     ATMOSFERAS
     =================================================================== */
  const MOODS = {
    ouro: { sun: [-0.3, 0.27, -0.9], sunCol: 0xffb56b, sunI: 4.2, glow: 1, top: 0x2f5596, horizon: 0xffc08a, bottom: 0x5a4636, hemiSky: 0xffd9b3, hemiGnd: 0x4a3a22, hemiI: 1.25, fill: [0.5, 0.5, 0.9], fillCol: 0xffe2c4, fillI: 0.85, fog: 0xe6b48c, fogD: 0.011, exp: 1.02, trans: 0.75, leafGlow: 0.05, bloom: [0.3, 0.75, 0.88], motes: 0.55, fire: 0, stars: false, env: 0.55 },
    alba: { sun: [0.45, 0.78, 0.55], sunCol: 0xfff3df, sunI: 3.6, glow: 0.6, top: 0x4f8fd6, horizon: 0xe9eef2, bottom: 0x8a9478, hemiSky: 0xcfe3ff, hemiGnd: 0x6a7448, hemiI: 1.25, fill: [-0.6, 0.3, 0.6], fillCol: 0xdfeaff, fillI: 0.5, fog: 0xdfe8ee, fogD: 0.012, exp: 0.98, trans: 0.5, leafGlow: 0.03, bloom: [0.14, 0.6, 0.95], motes: 0.25, fire: 0, stars: false, env: 0.7 },
    noite: { sun: [-0.4, 0.72, -0.5], sunCol: 0x9ab8ff, sunI: 1.5, glow: 0.8, top: 0x02040c, horizon: 0x16224a, bottom: 0x05070d, hemiSky: 0x2a3f7a, hemiGnd: 0x0a0e12, hemiI: 1.5, fill: [0.4, 0.4, 0.9], fillCol: 0x6f86c9, fillI: 0.45, fog: 0x0a1026, fogD: 0.03, exp: 1.12, trans: 0.5, leafGlow: 0.55, bloom: [0.75, 0.8, 0.42], motes: 1, fire: 1, stars: true, env: 0.35 },
    puro: { sun: [-0.5, 0.75, 0.6], sunCol: 0xfff4e6, sunI: 3.4, glow: 0, top: 0x000000, horizon: 0x050506, bottom: 0x000000, hemiSky: 0x39393f, hemiGnd: 0x060606, hemiI: 0.7, fill: [0.7, 0.2, -0.7], fillCol: 0xffd8b0, fillI: 1.4, fog: 0x000000, fogD: 0.06, exp: 1.0, trans: 0.3, leafGlow: 0.1, bloom: [0.35, 0.7, 0.8], motes: 0.3, fire: 0, stars: false, env: 0.25 }
  };
  const sunDir = new THREE.Vector3();
  let fogBase = 0.02, mood = 'ouro';
  function applyMood(name) {
    const m = MOODS[name]; mood = name;
    document.documentElement.dataset.mood = name;
    sunDir.set(...m.sun).normalize();
    sun.position.copy(sun.target.position).addScaledVector(sunDir, 24);
    sun.color.set(m.sunCol); sun.intensity = m.sunI;
    hemi.color.set(m.hemiSky); hemi.groundColor.set(m.hemiGnd); hemi.intensity = m.hemiI;
    fill.position.set(...m.fill).multiplyScalar(10); fill.color.set(m.fillCol); fill.intensity = m.fillI;
    skyUniforms.uTop.value.set(m.top); skyUniforms.uHorizon.value.set(m.horizon); skyUniforms.uBottom.value.set(m.bottom);
    skyUniforms.uSunDir.value.copy(sunDir); skyUniforms.uSunCol.value.set(m.sunCol); skyUniforms.uSunGlow.value = m.glow;
    scene.fog.color.set(m.fog); fogBase = m.fogD;
    renderer.toneMappingExposure = m.exp;
    leafUniforms.uSunCol.value.set(m.sunCol).multiplyScalar(m.sunI); leafUniforms.uTrans.value = m.trans; leafUniforms.uGlow.value = m.leafGlow;
    bloom.strength = m.bloom[0]; bloom.radius = m.bloom[1]; bloom.threshold = m.bloom[2];
    moteLevel = m.motes; firefly = m.fire; stars.visible = m.stars;
    if (envRT) envRT.dispose();
    envRT = pmrem.fromScene(envScene, 0.03); scene.environment = envRT.texture;
    for (const mat of [barkMat, groundMat, ...TYPES.map(t => leafMat[t])]) mat.envMapIntensity = m.env;
    root.querySelectorAll('.moods button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mood === name)));
  }

  /* ===================================================================
     INTERAÇÃO
     =================================================================== */
  const pointer = { nx: 0, ny: 0, active: false, ray: new THREE.Ray(), vel: new THREE.Vector3(), last: new THREE.Vector3(), has: false, speed: 0, downX: 0, downY: 0, downT: 0, moved: 0 };
  const raycaster = new THREE.Raycaster(), _ndc = new THREE.Vector2(), _plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.15), _hit = new THREE.Vector3();
  const treeInv = new THREE.Matrix4(), rayL = new THREE.Ray();

  function setPointer(ev) {
    const r = canvas.getBoundingClientRect();
    _ndc.set((ev.clientX - r.left) / r.width * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    pointer.nx = _ndc.x; pointer.ny = _ndc.y;
    raycaster.setFromCamera(_ndc, camera); pointer.ray.copy(raycaster.ray); pointer.active = true;
    if (pointer.ray.intersectPlane(_plane, _hit)) {
      if (pointer.has) pointer.vel.copy(_hit).sub(pointer.last);   // deslocamento desde o último evento
      pointer.last.copy(_hit); pointer.has = true;
    }
  }
  canvas.addEventListener('pointermove', ev => { setPointer(ev); pointer.moved += Math.abs(ev.movementX || 0) + Math.abs(ev.movementY || 0); });
  canvas.addEventListener('pointerdown', ev => { pointer.has = false; setPointer(ev); pointer.downX = ev.clientX; pointer.downY = ev.clientY; pointer.downT = performance.now(); });
  canvas.addEventListener('pointerleave', () => { pointer.active = false; pointer.has = false; });
  canvas.addEventListener('pointerup', ev => {
    const tap = Math.hypot(ev.clientX - pointer.downX, ev.clientY - pointer.downY) < 9 && performance.now() - pointer.downT < 600;
    if (ev.pointerType !== 'mouse') { pointer.active = false; pointer.has = false; }
    if (!tap) return;
    if (hero) { if (hero.phase === 'hold' || hero.t > 0.5) releaseHero(); return; }
    setPointer(ev);
    const L = leafUnderRay(); if (L) summon(L);
  });
  canvas.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); hero ? releaseHero() : summon(); } });

  function leafUnderRay() {
    rayL.copy(pointer.ray).applyMatrix4(treeInv);
    let best = null, bestT = 1e9, near = null, nearD = 0.3;
    for (const L of leaves) {
      if (L.grow < 0.95) continue;
      _v.set(L.anchor.x + L.ox, L.anchor.y + L.oy, L.anchor.z + L.oz).sub(rayL.origin);
      const t = _v.dot(rayL.direction); if (t < 0) continue;
      const d = Math.sqrt(Math.max(0, _v.lengthSq() - t * t));
      if (d < 0.15 * L.scl.y && t < bestT) { bestT = t; best = L; }
      if (d < nearD) { nearD = d; near = L; }
    }
    return best || near;
  }

  let hintTimer = 0;
  function showHint(text, ms) { const el = $('hint'); el.textContent = text; el.classList.add('show'); clearTimeout(hintTimer); hintTimer = setTimeout(() => el.classList.remove('show'), ms || 2600); }

  function gust() {
    W.gust = 4.2;
    const n = 18;
    for (let i = 0; i < n; i++) setTimeout(() => { const L = leaves[Math.random() * leaves.length | 0]; detach(L, _v3.set(R(0.5, 2), R(0.2, 1.4), R(-0.8, 0.8))); }, 120 + i * 70);
    showHint('Uma brisa atravessou a copa', 2400);
  }

  $('btn-msg').addEventListener('click', () => summon());
  $('btn-gust').addEventListener('click', gust);
  $('btn-dock').addEventListener('click', ev => { const hid = $('dock').classList.toggle('hidden'); ev.currentTarget.setAttribute('aria-expanded', String(!hid)); });
  const windIn = $('wind'), fallIn = $('fall');
  windIn.value = W.strength;
  const windName = v => v === 0 ? 'Calmo' : v < 0.6 ? 'Aragem' : v < 1.2 ? 'Brisa leve' : v < 1.9 ? 'Vento' : 'Ventania';
  const fallName = v => v === 0 ? 'Nenhuma' : v < 1 ? 'Raras' : v < 2 ? 'Delicado' : 'Chuva de folhas';
  windIn.addEventListener('input', () => { W.strength = +windIn.value; $('wind-out').textContent = windName(W.strength); });
  fallIn.addEventListener('input', () => { W.fall = +fallIn.value; $('fall-out').textContent = fallName(W.fall); });
  $('wind-out').textContent = windName(W.strength);
  root.querySelectorAll('.moods button').forEach(b => b.addEventListener('click', () => applyMood(b.dataset.mood)));
  const autoIn = $('auto'); autoIn.checked = false;

  function resize() {
    const w = Math.max(1, root.clientWidth), h = Math.max(1, root.clientHeight);
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    camDist = Math.max(6.5 / (2 * TAN_H), 5.3 / (2 * TAN_H * camera.aspect)) * 1.02;
  }
  const observer = new ResizeObserver(resize); observer.observe(root);

  /* ===================================================================
     LAÇO PRINCIPAL
     =================================================================== */
  let clockT = 0, lastNow = performance.now(), camYaw = 0, camLift = 0, spawnAcc = 0;
  const K = 55, C = 5.5;      // mola e amortecimento das folhas presas

  function updateAttached(dt, t) {
    const push = pointer.active;
    if (push) rayL.copy(pointer.ray).applyMatrix4(treeInv);
    const pvx = pointer.vel.x, pvy = pointer.vel.y, pv = pointer.speed;
    for (let i = 0; i < leaves.length; i++) {
      const L = leaves[i];
      if (L.grow < 1) { if (L.delay > 0) L.delay -= dt; else L.grow = Math.min(1, L.grow + dt / 4.5); }
      windAt(L.anchor, t, _w);
      const f1 = Math.sin(t * L.f1 + L.ph), f2 = Math.sin(t * L.f2 + L.ph * 1.7), wx = _w.x * L.flex;
      let ax = (wx * 0.03 - L.ox) * K - L.vx * C;
      let ay = (_w.y * 0.03 + f1 * 0.004 * Math.abs(wx) - L.oy) * K - L.vy * C;
      let az = (_w.z * 0.035 + f2 * 0.006 * Math.abs(wx) - L.oz) * K - L.vz * C;
      let arx = (wx * 0.07 * f2 + _w.z * 0.12 - L.rx) * K - L.wx * C;
      let arz = (-wx * 0.085 * (0.65 + 0.5 * f1) - L.rz) * K - L.wz * C;
      if (push) {
        _v.set(L.anchor.x + L.ox, L.anchor.y + L.oy, L.anchor.z + L.oz).sub(rayL.origin);
        const tt = _v.dot(rayL.direction);
        _v.addScaledVector(rayL.direction, -tt);
        const d = _v.length(), rad = 0.42;
        if (d < rad && d > 1e-4) {
          const f = 1 - d / rad;
          ax += (_v.x / d) * f * 16 + pvx * f * 9; ay += (_v.y / d) * f * 16 + pvy * f * 9; az += f * 5;
          arz += -pvx * f * 30; arx += pvy * f * 30;
          // um gesto rápido arranca folhas
          if (pv > 2.6 && d < 0.2 && Math.random() < dt * 7) detach(L, _v3.set(pvx * 0.4, pvy * 0.4 + 0.3, R(-0.3, 0.6)));
        }
      }
      L.vx += ax * dt; L.vy += ay * dt; L.vz += az * dt; L.wx += arx * dt; L.wz += arz * dt;
      L.ox += L.vx * dt; L.oy += L.vy * dt; L.oz += L.vz * dt; L.rx += L.wx * dt; L.rz += L.wz * dt;
      _v.set(L.anchor.x + L.ox, L.anchor.y + L.oy, L.anchor.z + L.oz);
      _q.set(L.rx * 0.5, 0, L.rz * 0.5, 1).normalize().multiply(L.baseQ);
      const g = L.grow >= 1 ? 1 : easeOutBack(L.grow) * (L.grow > 0 ? 1 : 0);
      _sc.copy(L.scl).multiplyScalar(Math.max(g, 0.0001));
      L.mesh.setMatrixAt(L.idx, _m.compose(_v, _q, _sc));
    }
    for (const t2 of TYPES) attached[t2].instanceMatrix.needsUpdate = true;
  }

  function updateLoose(dt, t) {
    for (const ty of TYPES) {
      const list = loose[ty], mesh = looseMesh[ty];
      for (let i = list.length - 1; i >= 0; i--) {
        const b = list[i];
        stepBody(b, dt * 0.5, t); stepBody(b, dt * 0.5, t + dt * 0.5);
        if (b.state === 'ground' && b.groundT > 38) b.fade -= dt * 0.4;
        if (b.fade <= 0 || Math.abs(b.p.x) > 45 || Math.abs(b.p.z) > 45) list.splice(i, 1);
      }
      for (let i = 0; i < list.length; i++) {
        const b = list[i];
        _sc.copy(b.scl).multiplyScalar(Math.max(b.fade, 0.0001));
        mesh.setMatrixAt(i, _m.compose(b.p, b.q, _sc)); mesh.setColorAt(i, b.color);
      }
      mesh.count = list.length; mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
    }
  }

  function updateMotes(dt, t) {
    const wsp = W.strength * 0.5 + W.gust * 0.6;
    for (let i = 0; i < MOTES; i++) {
      const s = moteSeed[i], k = i * 3;
      motePos[k] += (wsp * 0.35 + Math.sin(t * 0.6 + s) * 0.12) * dt;
      motePos[k + 1] += (Math.sin(t * 0.45 + s * 1.7) * 0.1 + 0.02) * dt;
      motePos[k + 2] += Math.cos(t * 0.5 + s * 0.6) * 0.1 * dt;
      if (motePos[k] > 7.5) motePos[k] = -6.5; if (motePos[k + 1] > 6.2) motePos[k + 1] = 0.1; if (motePos[k + 1] < 0.05) motePos[k + 1] = 6;
      const tw = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * (firefly ? 1.6 : 2.6) + s * 3.1), firefly ? 6 : 1.5);
      const c = moteBase[i], lv = moteLevel * tw;
      moteCol[k] = c.r * lv; moteCol[k + 1] = c.g * lv; moteCol[k + 2] = c.b * lv;
    }
    moteGeo.attributes.position.needsUpdate = true; moteGeo.attributes.color.needsUpdate = true;
    moteMat.size = firefly ? 0.11 : 0.06;
  }

  function frame(now) {
    if (disposed) return;
    frameId = requestAnimationFrame(frame);
    if (document.hidden || !isVisible) { lastNow = now; return; }
    const dt = Math.min((now - lastNow) / 1000, 0.05); lastNow = now; clockT += dt;
    const t = clockT;

    W.gust *= Math.exp(-0.55 * dt); if (W.gust < 0.02) W.gust = 0;
    windUniforms.uTime.value = t; windUniforms.uWind.value = W.strength + W.gust * 0.6;

    // câmera: leve paralaxe com o ponteiro e deriva lenta
    const yawT = pointer.nx * 0.2 + Math.sin(t * 0.08) * 0.05, liftT = pointer.ny * 0.3;
    camYaw += (yawT - camYaw) * (1 - Math.exp(-2.2 * dt)); camLift += (liftT - camLift) * (1 - Math.exp(-2.2 * dt));
    camera.position.set(TARGET.x + Math.sin(camYaw) * camDist, 1.45 + camLift, TARGET.z + Math.cos(camYaw) * camDist);
    camera.lookAt(TARGET); camera.updateMatrixWorld();
    scene.fog.density = fogBase * 10 / camDist;
    sky.position.copy(camera.position);
    leafUniforms.uSunDirV.value.copy(sunDir).transformDirection(camera.matrixWorldInverse);

    // a árvore inteira cede um pouco ao vento
    const ws = W.strength * 1.35 + W.gust;
    tree.rotation.z = -(0.006 * ws + 0.004 * ws * Math.sin(t * 0.9) + 0.002 * Math.sin(t * 1.7));
    tree.rotation.x = 0.003 * ws * Math.sin(t * 0.6 + 1);
    tree.updateMatrixWorld(); treeInv.copy(tree.matrixWorld).invert();

    // velocidade do ponteiro em m/s (decai quando ele para)
    pointer.speed = pointer.vel.length() / Math.max(dt, 1e-3);
    pointer.vel.multiplyScalar(1 / Math.max(dt, 1e-3)).clampLength(0, 12);

    if (!background) updateAttached(dt, t);
    pointer.vel.set(0, 0, 0);

    // desprendimento espontâneo
    spawnAcc += dt * W.fall * (0.12 + ws * 0.32);
    while (spawnAcc > 1) { spawnAcc -= 1; detach(leaves[Math.random() * leaves.length | 0]); }

    if (!background) { updateLoose(dt, t); updateHero(dt, t); }
    updateMotes(dt, t);

    if (autoIn.checked && !hero && t - lastSummon > 16 && document.visibilityState === 'visible') summon();

    composer.render(dt);
  }

  /* ===================================================================
     PARTIDA
     =================================================================== */
  resize();
  applyMood('ouro');
  const fontsReady = (document.fonts && document.fonts.load)
    ? Promise.race([Promise.all([document.fonts.load('italic 500 48px "Playfair Display"'), document.fonts.load('600 24px "DM Sans"')]), new Promise(r => setTimeout(r, 2500))])
    : Promise.resolve();
  fontsReady.catch(() => {}).then(() => {
    window.__treeReady = true;
    if (disposed) return; $('loading').classList.add('done');
    lastNow = performance.now(); lastSummon = -12.5;   // primeira mensagem ~3,5 s depois de abrir
    if (!autoIn.checked) lastSummon = 0;
    frameId = requestAnimationFrame(frame);
    if (!background) for (let i = 0; i < 5; i++) setTimeout(() => detach(leaves[Math.random() * leaves.length | 0]), 300 + i * 260);
    onReady(() => summon());
  });
  
  return () => { disposed = true; cancelAnimationFrame(frameId); observer.disconnect(); visibility.disconnect(); scene.traverse(object => { if (object.geometry) object.geometry.dispose(); if (object.material) { const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => { Object.values(material).forEach(value => { if (value && value.isTexture) value.dispose(); }); material.dispose(); }); } }); envRT?.dispose(); pmrem.dispose(); composer.dispose(); renderer.dispose(); };
}
