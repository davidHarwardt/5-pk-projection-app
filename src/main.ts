import './style.css'

import landRaw from "./land-110m.json";
import * as d3 from "d3";
import * as d3p from "d3-geo-projection";
import * as topojson from "topojson-client";

const land = topojson.feature(landRaw as any, landRaw.objects.land as any);
const grid = d3.geoGraticule10();

const canvas = document.createElement("canvas");
document.querySelector("#app")?.appendChild(canvas);
const ctx = canvas.getContext("2d")!;
resizeCanvas();

window.addEventListener("resize", resizeCanvas);

function btn(title: string, id: string) {
    const btn = document.createElement("button");
    btn.innerHTML = title;
    btn.id = id;
    return btn;
}

function sel(items: { name: string, items: { name: string, id: string }[] }[]) {
    const sel = document.createElement("select");
    items.forEach(v => {
        const optg = document.createElement("optgroup");
        optg.label = v.name;
        v.items.forEach(u => {
            const opt = document.createElement("option");
            opt.innerHTML = u.name;
            opt.value = u.id;

            optg.appendChild(opt);
        });

        sel.appendChild(optg);
    });
    return sel;
}

const buttons = [
    btn("Reset", "reset"),
];

function onEv(btns: HTMLButtonElement[], cb: (ev: string) => void) {
    btns.forEach(b => {
        b.addEventListener("click", _ => {
            cb(b.id);
        });
    });
}


const btns = document.querySelector(".buttons")!;
buttons.forEach(b => {
    btns.appendChild(b);
});

const mapSel = sel([
    {
        name: "Konform",
        items: [
            { name: "Mercator", id: "mercator" },
            { name: "Lambert (konisch)", id: "lambert-conformal-conic" },
            { name: "Littrow", id: "littrow" },
        ],
    },
    {
        name: "Flaechentreu",
        items: [
            { name: "Lambert (zylindrisch)", id: "lambert-area-cylindrical" },
            { name: "Gall-Peters", id: "gall-peters" },
            { name: "Eckert II", id: "eckert-2" },
            { name: "Eckert VI", id: "eckert-6" },
            { name: "Equal Earth", id: "equal-earth" },
            { name: "HEALPix", id: "healpix" },
            { name: "Sinosoidal (auch Equidistant)", id: "sinosoidal" },
        ],
    },
    {
        name: "Equidistant",
        items: [
            { name: "Equirectangular", id: "equirectangular" },
            { name: "Konisch", id: "conic" },
        ],
    },
    {
        name: "Perspektivisch",
        items: [
            { name: "Orthografisch", id: "orthographic" },
            { name: "Echte Perspektive", id: "perspective" },
        ],
    },
    {
        name: "Kompromiss",
        items: [
            { name: "Gall", id: "gall" },
            { name: "Miller", id: "miller" },
            { name: "Robinson", id: "robinson" },
            { name: "Natural Earth", id: "natural-earth" },
            { name: "Van der Grinten", id: "van-der-grinten" },
        ],
    }
]);
btns.appendChild(mapSel);

mapSel.addEventListener("change", _ => {
    const v = mapSel.value;
    switch(v) {
        case "mercator": { setProj(d3.geoMercator()) } break;
        case "lambert-conformal-conic": { setProj(d3.geoConicConformal()) } break;
        case "littrow": { setProj(d3p.geoLittrow()) } break;

        case "lambert-area-cylindrical": { setProj(d3p.geoCylindricalEqualArea().parallel(0)) } break;
        case "gall-peters": { setProj(d3p.geoCylindricalEqualArea().parallel(45)) } break;
        case "eckert-2": { setProj(d3p.geoEckert2()) } break;
        case "eckert-6": { setProj(d3p.geoEckert6()) } break;
        case "equal-earth": { setProj(d3.geoEqualEarth()) } break;
        case "healpix": { setProj(d3p.geoHealpix().lobes(1)) } break;
        case "sinosoidal": { setProj(d3p.geoSinusoidal()) } break;

        case "equirectangular": { setProj(d3.geoEquirectangular()) } break;
        case "conic": { setProj(d3.geoConicEquidistant()) } break;

        case "orthographic": { setProj(d3.geoOrthographic()) } break;
        case "perspective": { setProj(d3p.geoSatellite()) } break;

        case "gall": { setProj(d3p.geoCylindricalStereographic().parallel(45)) } break;
        case "miller": { setProj(d3p.geoMiller()) } break;
        case "robinson": { setProj(d3p.geoRobinson()) } break;
        case "natural-earth": { setProj(d3.geoNaturalEarth1()) } break;
        case "van-der-grinten": { setProj(d3p.geoVanDerGrinten()) } break;
    }
});

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

let dragging = false;
let oldPos = [0, 0];
let rot: [number, number, number] = [0, 0, 0];

let zoom = 1.0;
const sens = 0.8;

if("GestureEvent" in window) {
    let oldZoom = 1;

    document.addEventListener("touchstart", ev => {
        dragging = true;
        oldPos = [ev.touches[0].clientX, ev.touches[0].clientY];

        ev.preventDefault();
    }, false);

    document.addEventListener("touchmove", ev => {
        const touch = ev.touches[0];
        const [dx, dy] = [touch.clientX - oldPos[0], touch.clientY - oldPos[1]];

        if(dragging) {
            rot[0] += dx * sens;
            rot[1] -= dy * sens;
        }

        oldPos = [touch.clientX, touch.clientY];
    }, false);

    canvas.addEventListener("touchend", ev => {
        ev.preventDefault();
    }, false);

    canvas.addEventListener("gesturechange", ev => {
        const scale = (ev as any).scale;
        zoom += (scale - oldZoom);
        oldZoom = scale;
    });

    canvas.addEventListener("gesturestart", ev => {
        dragging = false;
        ev.preventDefault();
    });

    canvas.addEventListener("gestureend", _ => {
        oldZoom = 1.0;
    });
} else {
    canvas.addEventListener("pointermove", ev => {
        const [dx, dy] = [ev.clientX - oldPos[0], ev.clientY - oldPos[1]];

        if(dragging) {
            rot[0] += dx * sens;
            rot[1] -= dy * sens;
        }

        oldPos = [ev.clientX, ev.clientY];
        ev.preventDefault();
    });

    canvas.addEventListener("pointerdown", ev => {
        oldPos = [ev.clientX, ev.clientY];
        dragging = true;
    });
    canvas.addEventListener("pointerup", _ => dragging = false);

    window.addEventListener("wheel", ev => {
        zoom += ev.deltaY * sens * 0.001;
    });
}

onEv(buttons, ev => {
    switch(ev) {
        case "reset": {
            rot = [0, 0, 0];
        } break;
        case "center-africa": {
            rot = [-20, 13, 0];
        } break;
    }
});

let currentP = d3.geoMercator();
let projScale = 1.0;
function setProj(p: d3.GeoProjection) {
    projScale = p.scale();
    currentP = p;
}
setProj(d3p.geoSatellite());

function draw() {
    zoom = Math.min(Math.max(zoom, 0.1), 10);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 5;

    let p = currentP.translate([canvas.width / 2.0, canvas.height / 2.0]).rotate(rot).scale(zoom * projScale);

    const path = d3.geoPath(
        p,
        // d3p.geoSatellite(),
        ctx,
    );

    ctx.beginPath();
    path(grid);
    ctx.stroke();

    ctx.beginPath();
    path(land);
    ctx.fill();

    const globePath = d3.geoPath(
        d3p.geoSatellite()
            .scale(432.147 * 0.5)
            .translate([canvas.width * 0.1, canvas.height * 0.2])
            .rotate(rot),
        ctx
    );

    ctx.beginPath();
    const [cx, cy] = globePath.centroid(grid);
    ctx.arc(cx, cy, 150.0, 0, Math.PI * 2.0);

    const oldFill = ctx.fillStyle;
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.fillStyle = oldFill;

    ctx.beginPath();
    globePath(grid);
    ctx.stroke();

    ctx.beginPath();
    globePath(land);
    ctx.fill();

    // ctx.fillStyle = "orange"; ctx.font = "50px Arial"; ctx.fillText(`rot: ${JSON.stringify(rot)}`, 100, 200);

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

