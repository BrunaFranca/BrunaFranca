// Gera assets/vida-da-bruna.svg: um side-scroller em pixel art, animado só com CSS.
// Uso: node scripts/gerar.mjs            -> gera o SVG
//      node scripts/gerar.mjs --at=12.5  -> gera uma prévia congelada no segundo 12.5 (para conferir)
import { mkdirSync, writeFileSync } from "node:fs";

const W = 240; // largura da tela, em pixels da arte
const H = 72;
const CHAO = 60; // onde ficam os pés
const HEROI_X = 60; // posição fixa da Bruninha na tela; quem anda é o mundo
const VEL = 36; // pixels por segundo
const PAUSA = 3.2; // segundos em cada estação

// ---------- paleta ----------
const BRUNA = {
  H: "#5E3B2A", h: "#7A4E37", S: "#F3CDB0", s: "#E5B394", E: "#3B2418",
  L: "#D9888C", D: "#262427", d: "#3A373B", N: "#E8E8EE", W: "#FFFFFF", w: "#D6D2DA",
};
const ALEXIS = { K: "#2A2A2E", w: "#FFFFFF", G: "#9BC47A", p: "#F2A7B5" };
const ESTRELA = { O: "#E59A52", w: "#FFFFFF", G: "#9BC47A", p: "#F2A7B5" };
const ARVORE = { G: "#A8D5A2", g: "#8CC48A", T: "#A77B5B" };
const IPE = { G: "#F6B8CC", g: "#EE9BB5", T: "#A77B5B" };

// ---------- desenho ----------
const ret = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;

/** Desenha um sprite a partir de linhas de texto: cada letra é uma cor da paleta, "." é transparente. */
function sprite(linhas, pal, x, y, s = 1) {
  let out = "";
  linhas.forEach((linha, j) => {
    let i = 0;
    while (i < linha.length) {
      const c = linha[i];
      if (!pal[c]) {
        i++;
        continue;
      }
      let k = i;
      while (k < linha.length && linha[k] === c) k++;
      out += ret(x + i * s, y + j * s, (k - i) * s, s, pal[c]);
      i = k;
    }
  });
  return out;
}

// ---------- sprites ----------
const corpo = [
  "...HHHHH....",
  "..HHHHHHH...",
  ".HHHHHHHHH..",
  ".HHHHSSSSH..",
  ".HHHSSSESS..",
  ".HHHSSSSSS..",
  ".HHHSSSSLS..",
  ".HHHHSSSS...",
  ".HHHHhSS....",
  ".HHHHDNDD...",
  ".HHHDDDDDS..",
  ".HHHDDDDDS..",
  "..HHDDDDDS..",
  "...DDDDDD...",
  "...DDDDDDD..",
  "..DDDDDDDD..",
];
const pernasParada = ["....SS.SS...", "....SS.SS...", "....SS.SS...", "...WWW.WWW..", "...www.www.."];
const pernasA = ["...SS...SS..", "..SS.....SS.", "..SS.....SS.", ".WWW.....WWW", ".www.....www"];
const pernasB = [".....SSS....", ".....SSS....", ".....SS.S...", "....WWWWWW..", "....wwwwww.."];

const gatoAlexis = [
  ".K..K......",
  ".KKKK......",
  ".GKGK....K.",
  ".KwpK.....K",
  "..wwKKKKKK.",
  "..wwwwwwKK.",
  "..wwwwwwwK.",
  "..w.w..w.w.",
];
const gatoEstrela = gatoAlexis.map((l) => l.replaceAll("K", "O"));

const copa = [
  "...GGGGG...",
  ".GGGgGGGGG.",
  "GGgGGGGGgGG",
  "GGGGGGgGGGG",
  "GgGGGGGGGgG",
  ".GGGGgGGGG.",
  "..GGGGGGG..",
  ".....T.....",
  ".....T.....",
  ".....T.....",
  "....TTT....",
];
const nota = ["..NN.", "..N.N", "..N..", "NNN..", "NNN.."];
const coracao = [".PP.PP.", "PPPPPPP", "PPPPPPP", ".PPPPP.", "..PPP..", "...P..."];
const ostensorio = [
  "....Y....",
  "...YYY...",
  "....Y....",
  ".Y.yYy.Y.",
  "..yYYYy..",
  "YyYWWWYyY",
  ".yYWWWYy.",
  "YyYWWWYyY",
  "..yYYYy..",
  ".Y.yYy.Y.",
  "....Y....",
  "...YYY...",
  "..YYYYY..",
];
const sacola = ["..KK..", ".K..K.", "PPPPPP", "PPPPPP", "PPPPPP", "PPPPPP"];
const notebook =["KKKKKKKKK", "KssssCssK", "KsCsCsssK", "KssCssssK", "KKKKKKKKK", "LLLLLLLLLLL"];

/** Pessoa genérica. cabelo: "curto" | "longo" | "coque". */
function pessoa(x, { cab, roupa, calca = "#4F5B6E", cabelo = "curto", vestido = false, barba = false }) {
  const p = { H: cab, S: "#EFC3A4", E: "#3B2418", C: roupa, P: calca, F: "#FFFFFF" };
  const longo = cabelo === "longo";
  const lin = [
    ...(cabelo === "coque" ? ["...HH...", "..HHHH..", ".HHHHHH."] : ["..HHHH..", ".HHHHHH."]),
    ".HSSSSH.",
    ".SESSES.",
    barba ? ".SHHHHS." : ".SSSSSS.",
    "..SSSS..",
    longo ? ".HCCCCH." : "..CCCC..",
    longo ? "HCCCCCCH" : ".CCCCCC.",
    "SCCCCCCS",
    "SCCCCCCS",
    ...(vestido
      ? [".CCCCCC.", "CCCCCCCC", "CCCCCCCC", ".SS..SS.", ".SS..SS.", ".FF..FF."]
      : [".CCCCCC.", ".PPPPPP.", ".PP..PP.", ".PP..PP.", ".PP..PP.", ".PP..PP.", ".FF..FF."]),
  ];
  return sprite(lin, p, x, CHAO - lin.length);
}

// ---------- linha do tempo ----------
const estacoes = [
  { id: "casa", x: 130 },
  { id: "catedral", x: 280 },
  { id: "trabalho", x: 430 },
  { id: "piano", x: 580 },
  { id: "familia", x: 730 },
  { id: "shopping", x: 928 },
];
const INICIO = 20;
const FIM = 1040;
const FADE = 0.6;

let t = FADE;
let x = INICIO;
const cam = [
  [0, x],
  [t, x],
];
const andando = [];
for (const e of estacoes) {
  const saiu = t;
  t += (e.x - x) / VEL;
  andando.push([saiu, t]);
  x = e.x;
  cam.push([t, x]);
  e.a = t;
  t += PAUSA;
  e.b = t;
  cam.push([t, x]);
}
andando.push([t, t + (FIM - x) / VEL]);
t += (FIM - x) / VEL;
cam.push([t, FIM]);
const T = t + FADE;
cam.push([T, FIM]);

const pct = (s) => `${((s / T) * 100).toFixed(3)}%`;
const kf = (nome, pts) => `@keyframes ${nome}{${pts.map(([s, d]) => `${pct(s)}{${d}}`).join("")}}`;
const camada = (f) => cam.map(([s, cx]) => [s, `transform:translateX(${(-(cx - HEROI_X) * f).toFixed(2)}px)`]);
const ligado = (intervalos, on, off) => {
  const pts = [[0, off]];
  for (const [a, b] of intervalos) pts.push([a, off], [a + 0.01, on], [b, on], [b + 0.01, off]);
  pts.push([T, off]);
  return pts;
};
const mostra = (a, b) => ligado([[a, b]], "opacity:1", "opacity:0");
const sobe = (a, b, atraso) => [
  [0, "opacity:0;transform:translateY(0px)"],
  [a + atraso, "opacity:0;transform:translateY(0px)"],
  [a + atraso + 0.3, "opacity:1;transform:translateY(-2px)"],
  [b, "opacity:0;transform:translateY(-12px)"],
  [T, "opacity:0;transform:translateY(-12px)"],
];

const css = [];
const anim = (cls, pts) => {
  css.push(kf(cls, pts), `.${cls}{animation:${cls} ${T.toFixed(2)}s linear infinite}`);
  return cls;
};
anim("cam", camada(1));
anim("arv", camada(0.5));
anim("nuv", camada(0.15));
anim("anda", ligado(andando, "opacity:1", "opacity:0"));
anim("para", ligado(andando, "opacity:0", "opacity:1"));
anim("cena", [
  [0, "opacity:0"],
  [FADE, "opacity:1"],
  [T - FADE, "opacity:1"],
  [T, "opacity:0"],
]);
css.push("@keyframes flip{0%{opacity:1}50%{opacity:0}100%{opacity:0}}");
css.push(".pa{animation:flip .4s step-end infinite}.pb{animation:flip .4s step-end infinite;animation-delay:-.2s}");

// ---------- cenário ----------
let ceu = ret(0, 0, W, 20, "#FDEFF4") + ret(0, 20, W, 18, "#F8EAF3") + ret(0, 38, W, 22, "#EEF4FA");
let nuvens = "";
for (let i = 0; i < 6; i++) {
  const nx = 20 + i * 70;
  const ny = 8 + (i % 3) * 6;
  nuvens += ret(nx, ny, 14, 3, "#FFFFFF") + ret(nx + 3, ny - 2, 8, 2, "#FFFFFF");
}
let arvores = "";
for (let i = 0, ax = -10; ax < 760; i++, ax += 26) {
  arvores += sprite(copa, i % 3 === 1 ? IPE : ARVORE, ax, CHAO - 26, 2);
}
const chao = ret(0, 56, W, 4, "#BFE3B0") + ret(0, 60, W, 6, "#F3ECE8") + ret(0, 66, W, 1, "#D9CFE0") + ret(0, 67, W, 5, "#D3CEDA");

let mundo = "";
for (let lx = 0; lx < 1300; lx += 12) mundo += ret(lx, 60, 1, 6, "#E4DAD5");
for (let fx = 40; fx < 1250; fx += 55) mundo += ret(fx, 55, 3, 2, "#F2A7C0") + ret(fx + 1, 54, 1, 1, "#EE8FB0") + ret(fx, 57, 3, 1, "#8CC48A");

// casa + gatas
{
  const hx = 140;
  mundo += sprite(
    ["........RR........", "......RRRRRR......", "....RRRRRRRRRR....", "..RRRRRRRRRRRRRR..", "RRRRRRRRRRRRRRRRRR"].map(
      (l) => l,
    ),
    { R: "#E79AAE" },
    hx,
    CHAO - 30,
    2,
  );
  mundo += ret(hx + 2, CHAO - 20, 32, 20, "#FADADD");
  mundo += ret(hx + 22, CHAO - 13, 7, 13, "#B98B73") + ret(hx + 27, CHAO - 7, 1, 1, "#F2C14E");
  mundo += ret(hx + 6, CHAO - 15, 9, 7, "#FFFFFF") + ret(hx + 7, CHAO - 14, 7, 5, "#DDEFF8") + ret(hx + 10, CHAO - 14, 1, 5, "#FFFFFF");
  mundo += sprite(gatoEstrela, ESTRELA, 146, CHAO - 8);
  mundo += sprite(gatoAlexis, ALEXIS, 158, CHAO - 8);
}
// catedral (o cone)
{
  const cx = 308;
  const topo = 6;
  for (let y = topo; y < CHAO - 4; y++) {
    const meia = Math.round(1 + (y - topo) * 0.3);
    const cor = (y - topo) % 7 === 0 ? "#D7D2DF" : "#E9E5EF";
    mundo += ret(cx - meia, y, meia, 1, cor) + ret(cx, y, meia, 1, (y - topo) % 7 === 0 ? "#C2BCCD" : "#CFC9D9");
  }
  mundo += ret(cx - 20, CHAO - 4, 40, 4, "#DCD6E3") + ret(cx - 3, CHAO - 9, 6, 9, "#B9A6C9");
  mundo += ret(cx, topo - 6, 1, 6, "#C9A94E") + ret(cx - 2, topo - 4, 5, 1, "#C9A94E");
}
// prédio do trabalho
{
  const px = 444;
  mundo += ret(px, CHAO - 40, 36, 40, "#D9D1EE") + ret(px - 1, CHAO - 41, 38, 2, "#C4B9E2");
  for (let wy = CHAO - 36; wy < CHAO - 12; wy += 7) for (let wx = px + 4; wx < px + 32; wx += 8) mundo += ret(wx, wy, 5, 4, "#F0F7FC");
  mundo += ret(px + 14, CHAO - 10, 8, 10, "#A99CC9");
}
// piano
mundo += sprite(
  ["BBBBBBBBBBBBBBBB", "BbbbbbbbbbbbbbbB", "BbbbbbbbbbbbbbbB", "BBBBBBBBBBBBBBBB", "WKWKWWKWKWKWWKWW", "WWWWWWWWWWWWWWWW", "BBBBBBBBBBBBBBBB", "B..............B", "B..............B", "B..............B", "BB............BB"],
  { B: "#3D3036", b: "#54434B", W: "#FFFFFF", K: "#222222" },
  593,
  CHAO - 11,
);
// família e amigos
mundo += pessoa(748, { cab: "#DAD6DE", roupa: "#C9B6E4", cabelo: "coque", vestido: true }); // vó
mundo += pessoa(759, { cab: "#3B2A20", roupa: "#A9CBE8", barba: true }); // tio
mundo += pessoa(770, { cab: "#7A4E37", roupa: "#F4B6C8", cabelo: "longo", vestido: true }); // amiga
mundo += pessoa(781, { cab: "#E3C27A", roupa: "#BFE3CF", cabelo: "longo", vestido: true }); // amiga
// shopping
{
  const sx = 900;
  mundo += ret(sx, CHAO - 36, 70, 36, "#FBE6D8") + ret(sx - 2, CHAO - 38, 74, 3, "#F2C7B0");
  for (let i = 0; i < 70; i += 6) mundo += ret(sx + i, CHAO - 22, 3, 4, "#F4A7C0") + ret(sx + i + 3, CHAO - 22, 3, 4, "#FFFFFF");
  mundo += ret(sx + 26, CHAO - 17, 18, 17, "#CFE8F3") + ret(sx + 34, CHAO - 17, 1, 17, "#FFFFFF");
  for (const [vx, cor] of [[sx + 5, "#F27BA0"], [sx + 52, "#B48AD8"]]) {
    mundo += ret(vx, CHAO - 15, 14, 10, "#E8F4FA") + sprite(sacola, { K: "#8A8590", P: cor }, vx + 4, CHAO - 13);
  }
  mundo += ret(sx + 10, CHAO - 33, 50, 7, "#FFFFFF") + ret(sx + 12, CHAO - 31, 46, 3, "#F6D3DE");
}

// ---------- eventos nas estações ----------
const [casa, catedral, trabalho, piano, familia, shopping] = estacoes;
let eventos = "";
eventos += `<g class="${anim("ev1", mostra(casa.a, casa.b))}">${sprite(coracao, { P: "#F27BA0" }, 154, CHAO - 16)}</g>`;
const OURO = { Y: "#D9AE3F", y: "#F3D57E", W: "#FFFFFF" };
eventos += `<g class="${anim("ev2a", sobe(catedral.a, catedral.b, 0.2))}">${sprite(ostensorio, OURO, 292, CHAO - 34)}</g>`;
eventos += `<g class="${anim("ev3", mostra(trabalho.a, trabalho.b))}">${ret(427, CHAO - 36, 17, 11, "#FFFFFF")}${ret(431, CHAO - 25, 2, 2, "#FFFFFF")}${sprite(notebook, { K: "#55505A", s: "#BDE3F5", C: "#5FB37E", L: "#8A8590" }, 430, CHAO - 34)}</g>`;
eventos += `<g class="${anim("ev4a", sobe(piano.a, piano.b, 0.2))}">${sprite(nota, { N: "#E07A9B" }, 596, CHAO - 18)}</g>`;
eventos += `<g class="${anim("ev4b", sobe(piano.a, piano.b, 1.2))}">${sprite(nota, { N: "#B48AD8" }, 604, CHAO - 18)}</g>`;
eventos += `<g class="${anim("ev5a", sobe(familia.a, familia.b, 0.2))}">${sprite(coracao, { P: "#F27BA0" }, 756, CHAO - 24)}</g>`;
eventos += `<g class="${anim("ev5b", sobe(familia.a, familia.b, 1.0))}">${sprite(coracao, { P: "#F6A9C2" }, 774, CHAO - 24)}</g>`;

// sacolinhas: aparecem quando ela sai do shopping e vão com ela até o fim
const sacolas = `<g class="${anim("sac", ligado([[shopping.a + 1.2, T - 0.02]], "opacity:1", "opacity:0"))}">${sprite(sacola, { K: "#8A8590", P: "#9B6FD0" }, -3, 11)}${sprite(sacola, { K: "#8A8590", P: "#E86A97" }, 8, 11)}${sprite(sacola, { K: "#8A8590", P: "#5DB892" }, 11, 12)}</g>`;

const heroiY = CHAO - corpo.length - 5;
const heroi = `<g transform="translate(${HEROI_X} ${heroiY})">${sprite(corpo, BRUNA, 0, 0)}<g class="para">${sprite(pernasParada, BRUNA, 0, corpo.length)}</g><g class="anda"><g class="pa">${sprite(pernasA, BRUNA, 0, corpo.length)}</g><g class="pb">${sprite(pernasB, BRUNA, 0, corpo.length)}</g></g>${sacolas}</g>`;

// ---------- montagem ----------
const at = process.argv.find((a) => a.startsWith("--at="));
if (at) css.push(`*{animation-play-state:paused!important;animation-delay:-${at.slice(5)}s!important}`);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 4}" height="${H * 4}" shape-rendering="crispEdges" role="img" aria-label="Vida da Bruna: um joguinho em pixel art">
<style>${css.join("")}</style>
<clipPath id="tela"><rect width="${W}" height="${H}" rx="3"/></clipPath>
<g clip-path="url(#tela)"><g class="cena">
${ceu}<g class="nuv">${nuvens}</g><g class="arv">${arvores}</g>${chao}
<g class="cam">${mundo}${eventos}</g>${heroi}
</g></g></svg>`;

mkdirSync("assets", { recursive: true });
const saida = at ? `assets/previa-${at.slice(5)}.svg` : "assets/vida-da-bruna.svg";
writeFileSync(saida, svg);
console.log(`${saida}: ${(svg.length / 1024).toFixed(1)} KB, loop de ${T.toFixed(1)}s`);
