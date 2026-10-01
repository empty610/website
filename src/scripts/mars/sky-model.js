
export function initMarsSkyModel(scope) {
/* JPL approximate planetary elements, 1800–2050, J2000 ecliptic frame.
   https://ssd.jpl.nasa.gov/planets/approx_pos.html
   Positions are geometric: Earth–Moon barycenter approximates Earth;
   light-time, aberration, precession and topocentric parallax are omitted. */
(function (root) {
  'use strict';
  const RAD = Math.PI / 180, DAY = 86400000;
  const elements = {
    earth: [[1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0],
      [.00000562,-.00004392,-.01294668,35999.37244981,.32327364,0]],
    mars: [[1.52371034,.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],
      [.00001847,.00007882,-.00813131,19140.30268499,.44441088,-.29257343]]
  };
  const wrap = n => Math.atan2(Math.sin(n), Math.cos(n));
  function heliocentric(body, ms) {
    // UTC is sufficient for this educational approximation (sub-day accuracy).
    const t = (ms / DAY + 2440587.5 - 2451545) / 36525;
    const [a,e,i,l,p,n] = elements[body][0].map((v,k) => v + elements[body][1][k] * t);
    const M = wrap((l-p)*RAD), w = (p-n)*RAD, node = n*RAD, inc = i*RAD;
    let E = M;
    for (let k=0; k<12; k++) {
      const correction = (E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
      E -= correction;
      if (Math.abs(correction)<1e-12) break;
    }
    const x = a*(Math.cos(E)-e), y = a*Math.sqrt(1-e*e)*Math.sin(E);
    const u = Math.cos(w)*x-Math.sin(w)*y, v = Math.sin(w)*x+Math.cos(w)*y;
    return {x:Math.cos(node)*u-Math.sin(node)*Math.cos(inc)*v,
      y:Math.sin(node)*u+Math.cos(node)*Math.cos(inc)*v, z:Math.sin(inc)*v};
  }
  function position(ms) {
    const e = heliocentric('earth',ms), m = heliocentric('mars',ms);
    const x = m.x-e.x, y = m.y-e.y, z = m.z-e.z;
    return {longitude:(Math.atan2(y,x)/RAD+360)%360,
      latitude:Math.atan2(z,Math.hypot(x,y))/RAD, distance:Math.hypot(x,y,z)};
  }
  function rate(ms) {
    return wrap((position(ms+DAY/2).longitude-position(ms-DAY/2).longitude)*RAD)/RAD;
  }
  function rootBetween(fn, a, b) {
    let fa=fn(a);
    for(let k=0;k<45;k++) {
      const c=(a+b)/2, fc=fn(c);
      if(fa*fc<=0) b=c; else {a=c;fa=fc;}
    }
    return (a+b)/2;
  }
  const start=Date.UTC(2024,10,1), end=Date.UTC(2025,3,15);
  const stationary=[];
  for(let ms=start;ms<end;ms+=DAY) {
    if(rate(ms)*rate(ms+DAY)<0) stationary.push(rootBetween(rate,ms,ms+DAY));
  }
  const opposition=rootBetween(ms=> {
    const e=heliocentric('earth',ms);
    return wrap(position(ms).longitude*RAD-Math.atan2(e.y,e.x));
  },Date.UTC(2025,0,10),Date.UTC(2025,0,20));
  const api={DAY,start,end,position,rate,heliocentric,stationary,opposition};
  root.MarsSkyModel=api;
})(typeof globalThis==='object'?globalThis:this);
}
