const $=(selector,scope=document)=>scope.querySelector(selector);
const header=$('.site-header');
const mobileMenu=$('#contact-mobile-menu');
const menuToggle=$('.menu-toggle');
function updateHeader(){header?.classList.toggle('is-glass',scrollY>24)}
updateHeader();
addEventListener('scroll',updateHeader,{passive:true});
menuToggle?.addEventListener('click',()=>{mobileMenu?.showModal();menuToggle.setAttribute('aria-expanded','true')});
$('.menu-close')?.addEventListener('click',()=>mobileMenu?.close());
mobileMenu?.addEventListener('click',event=>{if(event.target===mobileMenu)mobileMenu.close()});
mobileMenu?.addEventListener('close',()=>menuToggle?.setAttribute('aria-expanded','false'));


async function initContactLocationMap(){
  const canvas=document.querySelector('#contact-map-canvas');
  if(!canvas)return;
  try{
    await import('./vendor/leaflet.js');
    const map=window.L.map(canvas,{zoomControl:false,scrollWheelZoom:false,minZoom:5,maxZoom:18}).setView([24.66,54.96],7);
    window.L.control.zoom({position:'bottomright'}).addTo(map);
    const message=document.querySelector('.contact-location-map .map-load-message');
    try{
      await import('./vendor/maplibre-gl-5.6.2.js');
      await import('./vendor/leaflet-maplibre-gl-0.1.3.js');
      const basemap=window.L.maplibreGL({
        style:new URL('./vendor/openfreemap-positron-en.json',import.meta.url).href,
        attributionControl:{customAttribution:'<a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> &copy; <a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}
      }).addTo(map);
      const backgroundMap=basemap.getMaplibreMap();
      backgroundMap.on('error',()=>{if(message)message.hidden=false;});
      backgroundMap.on('idle',()=>{if(message)message.hidden=true;});
    }catch(error){
      if(message)message.hidden=false;
      console.warn('Contact basemap could not load',error);
    }
    const locations=[
      {name:'Abu Dhabi Office',place:'Abu Dhabi, United Arab Emirates',coords:[24.4539,54.3773],url:'https://maps.google.com/?q=Abu%20Dhabi%20United%20Arab%20Emirates'},
      {name:'Hidd Al Saadiyat',place:'Abu Dhabi, United Arab Emirates',coords:[24.548,54.452],url:'https://maps.google.com/?q=Hidd%20Al%20Saadiyat%20Abu%20Dhabi'},
      {name:'Dubai Office',place:'Dubai, United Arab Emirates',coords:[25.2048,55.2708],url:'https://maps.google.com/?q=Dubai%20United%20Arab%20Emirates'},
      {name:'Al Ain Office',place:'Al Ain, Abu Dhabi, United Arab Emirates',coords:[24.2075,55.7447],url:'https://maps.google.com/?q=Al%20Ain%20Abu%20Dhabi%20United%20Arab%20Emirates'}
    ];
    const markers=locations.map(location=>{
      const marker=window.L.marker(location.coords,{
        icon:window.L.divIcon({className:'adure-map-marker contact-office-marker',html:'<span></span>',iconSize:[32,40],iconAnchor:[16,40]}),
        title:location.name,
        alt:location.name,
        keyboard:true
      }).addTo(map);
      marker.bindPopup(`<strong>${location.name}</strong><span>${location.place}</span><a href="${location.url}" target="_blank" rel="noopener">Open in Google Maps</a>`);
      return marker;
    });
    const bounds=window.L.latLngBounds(locations.map(location=>location.coords));
    map.fitBounds(bounds,{padding:[70,70],maxZoom:8,animate:false});
    new ResizeObserver(()=>map.invalidateSize()).observe(canvas);
  }catch(error){
    console.warn('Contact map could not initialise',error);
  }
}
initContactLocationMap();
