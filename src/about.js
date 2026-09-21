const $=(selector,scope=document)=>scope.querySelector(selector);
const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
const header=$('.site-header');
const mobileMenu=$('#about-mobile-menu');
function updateHeader(){header.classList.toggle('is-glass',scrollY>24)}
updateHeader();addEventListener('scroll',updateHeader,{passive:true});
$('.menu-toggle')?.addEventListener('click',()=>{mobileMenu.showModal();$('.menu-toggle').setAttribute('aria-expanded','true')});
$('.menu-close')?.addEventListener('click',()=>mobileMenu.close());
mobileMenu?.addEventListener('close',()=>$('.menu-toggle').setAttribute('aria-expanded','false'));
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.16,rootMargin:'0px 0px -8% 0px'});
  $$('[data-reveal]').forEach(node=>observer.observe(node));
}else{$$('[data-reveal]').forEach(node=>node.classList.add('is-visible'))}


// Scale metric counter animation.
const scaleMetrics=$$('.scale-impact-metrics strong');
if(scaleMetrics.length){
  function parseMetric(text){
    const match=text.trim().match(/([\d,.]+)(.*)/);
    const value=match?Number(match[1].replace(/,/g,'')):0;
    const suffix=match?.[2]||'';
    return {value,suffix};
  }
  const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  scaleMetrics.forEach(metric=>{
    const parsed=parseMetric(metric.textContent);
    metric.dataset.target=String(parsed.value);
    metric.dataset.suffix=parsed.suffix;
    metric.textContent=prefersReduced?`${parsed.value}${parsed.suffix}`:`0${parsed.suffix}`;
  });
  function formatMetric(value,suffix){
    const rounded=Math.round(value);
    return `${rounded}${suffix}`;
  }
  function animateMetric(metric){
    if(metric.dataset.counted==='true')return;
    metric.dataset.counted='true';
    const target=Number(metric.dataset.target||0);
    const suffix=metric.dataset.suffix||'';
    if(prefersReduced){metric.textContent=formatMetric(target,suffix);return;}
    const start=performance.now();
    const duration=1300;
    function tick(now){
      const progress=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-progress,3);
      metric.textContent=formatMetric(target*eased,suffix);
      if(progress<1)requestAnimationFrame(tick);
      else metric.textContent=formatMetric(target,suffix);
    }
    requestAnimationFrame(tick);
  }
  if('IntersectionObserver' in window){
    const metricObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          $$('.scale-impact-metrics strong',entry.target).forEach(animateMetric);
          metricObserver.unobserve(entry.target);
        }
      });
    },{threshold:.35});
    const metricWrap=$('.scale-impact-metrics');
    if(metricWrap)metricObserver.observe(metricWrap);
  }else{
    scaleMetrics.forEach(animateMetric);
  }
}

const storySection=$('.story-tilton-section');
if(storySection && $('.story-tilton-years', storySection) && $('.story-tilton-prev', storySection) && $('.story-tilton-next', storySection) && $('.story-tilton-year', storySection)){
  const milestones=[
    {
          year:'2002',
          title:'Laying The Foundation',
          summary:'Established in Abu Dhabi',
          body:[
            'Established in Abu Dhabi to manage and operate residential and commercial property.'
          ],
          left:'assets/about/timeline-foundation-building.webp',
          right:'assets/hidd-al-saadiyat/landscaped-community.webp'
        },
    {
          year:'2021',
          title:'Growing Our Portfolio',
          summary:'Hidd Al Saadiyat added',
          body:[
            'Added Hidd Al Saadiyat, a waterfront residential community.'
          ],
          left:'assets/hidd-al-saadiyat/saadiyat-aerial-beach.webp',
          right:'assets/hidd-al-saadiyat/golden-waterfront.webp'
        },
    {
          year:'2026',
          title:'Staying True To Our Promise',
          summary:'1800+ units managed',
          body:[
            'Continue to expand across the region, managing over 1800+ units, and staying true to our commitment of creating value that goes beyond property.'
          ],
          left:'assets/hidd-al-saadiyat/golden-waterfront.webp',
          right:'assets/hidd-al-saadiyat/saadiyat-aerial-beach.webp'
        }
  ];  const stage=$('.story-tilton-stage',storySection);
  const prev=$('.story-tilton-prev',storySection);
  const next=$('.story-tilton-next',storySection);
  const year=$('.story-tilton-year',storySection);
  const title=$('#story-heading',storySection);
  const card=$('.story-tilton-card',storySection);
  const mainImage=$('.story-tilton-image-left img',storySection);
  const nextImage=$('.story-tilton-image-next img',storySection);
  const paragraphs=$$('p:not(.story-tilton-year)',card).filter(p=>!p.classList.contains('about-eyebrow'));
  const railItems=$$('.story-tilton-years li',storySection);
  const railButtons=$$('.story-tilton-years button',storySection);
  let index=0;
  let locked=false;
  function paint(nextIndex){
    const item=milestones[nextIndex];
    year.textContent=item.year;
    title.textContent=item.title;
    if(mainImage&&item.left){
      mainImage.src=item.left;
      mainImage.alt=item.title;
    }
    if(nextImage){
      const nextItem=milestones[(nextIndex+1)%milestones.length];
      const nextFigure=nextImage.closest('.story-tilton-image-next');
      nextImage.src=nextItem.left||item.right||item.left;
      nextImage.alt='';
      if(nextFigure){
        nextFigure.dataset.nextYear=nextItem.year;
        nextFigure.dataset.nextTitle=nextItem.title;
        nextFigure.dataset.nextText=nextItem.body?.[0]||'';
      }
    }
    paragraphs.forEach((paragraph,i)=>{paragraph.textContent=item.body[i]||''; paragraph.hidden=!item.body[i];});
    railItems.forEach((li,i)=>{
      li.classList.toggle('is-active',i===nextIndex);
      const small=li.querySelector('small');
      if(small&&milestones[i]?.summary)small.textContent=milestones[i].summary;
    });
    railButtons.forEach((button,i)=>button.setAttribute('aria-current',i===nextIndex?'true':'false'));
    prev.disabled=nextIndex===0;
    next.disabled=nextIndex===milestones.length-1;
    index=nextIndex;
  }
  async function go(nextIndex){
    if(locked||nextIndex===index||nextIndex<0||nextIndex>=milestones.length)return;
    locked=true;
    const direction=nextIndex>index?1:-1;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){paint(nextIndex);locked=false;return;}
    const outDistance=direction>0?-22:22;
    const inDistance=direction>0?22:-22;
    try{
      await stage.animate([
        {opacity:1,transform:'translate3d(0,0,0)'},
        {opacity:0,transform:`translate3d(${outDistance}px,0,0)`}
      ],{duration:260,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished;
      paint(nextIndex);
      await stage.animate([
        {opacity:0,transform:`translate3d(${inDistance}px,0,0)`},
        {opacity:1,transform:'translate3d(0,0,0)'}
      ],{duration:420,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}).finished;
      stage.getAnimations().forEach(animation=>animation.cancel());
    }finally{
      stage.style.opacity='';
      stage.style.transform='';
      locked=false;
    }
  }
  prev?.addEventListener('click',()=>go(index-1));
  next?.addEventListener('click',()=>go(index+1));
  function activateStoryButton(button){
    go(Number(button.dataset.storyIndex));
  }
  railButtons.forEach(button=>{
    button.addEventListener('click',()=>activateStoryButton(button));
    button.addEventListener('pointerdown',event=>{
      event.preventDefault();
      activateStoryButton(button);
    });
  });
  storySection.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight')go(index+1);
    if(event.key==='ArrowLeft')go(index-1);
  });
  let storyPointerStart=null;
  stage?.addEventListener('pointerdown',event=>{
    storyPointerStart={x:event.clientX,y:event.clientY};
    stage.setPointerCapture?.(event.pointerId);
  });
  stage?.addEventListener('pointerup',event=>{
    if(!storyPointerStart)return;
    const dx=event.clientX-storyPointerStart.x;
    const dy=event.clientY-storyPointerStart.y;
    storyPointerStart=null;
    if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2)go(index+(dx<0?1:-1));
  });
  storySection.addEventListener('wheel',event=>{
    const primary=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
    if(Math.abs(primary)<18||locked)return;
    const nextIndex=index+(primary>0?1:-1);
    if(nextIndex<0||nextIndex>=milestones.length)return;
    event.preventDefault();
    go(nextIndex);
  },{passive:false});
  paint(0);
}

const visionScrollSection=$('.vision-scroll-section');
if(visionScrollSection){
  const visionImages=$$('.vision-scroll-image',visionScrollSection);
  const visionPanels=$$('[data-vision-panel]',visionScrollSection);
  let activeVisionStep=-1;
  let visionTicking=false;
  function setVisionStep(step){
    if(step===activeVisionStep)return;
    activeVisionStep=step;
    visionScrollSection.dataset.activeStep=String(step);
    visionImages.forEach((image,index)=>image.classList.toggle('is-active',index===step));
    visionPanels.forEach((panel,index)=>{
      const isActive=index===step;
      panel.classList.toggle('is-active',isActive);
      panel.setAttribute('aria-hidden',isActive?'false':'true');
    });
  }
  function updateVisionScroll(){
    visionTicking=false;
    const rect=visionScrollSection.getBoundingClientRect();
    const travel=Math.max(1,visionScrollSection.offsetHeight-window.innerHeight);
    const scrolled=Math.min(Math.max(-rect.top,0),travel);
    const progress=scrolled/travel;
    const step=Math.min(visionPanels.length-1,Math.max(0,Math.round(progress*(visionPanels.length-1))));
    visionScrollSection.style.setProperty('--vision-progress',progress.toFixed(4));
    visionScrollSection.style.setProperty('--vision-image-y',`${Math.round(progress*38)}px`);
    setVisionStep(step);
  }
  function requestVisionUpdate(){
    if(visionTicking)return;
    visionTicking=true;
    requestAnimationFrame(updateVisionScroll);
  }
  addEventListener('scroll',requestVisionUpdate,{passive:true});
  addEventListener('resize',requestVisionUpdate);
  updateVisionScroll();
}

const valuesScrubSection=$('.values-expedition-section');
if(valuesScrubSection){
  const valueRows=$$('.values-expedition-list article',valuesScrubSection);
  const valueImages=$$('.values-expedition-visual img',valuesScrubSection);
  let activeValueIndex=-1;
  let valuesTicking=false;
  function setActiveValue(index){
    if(index===activeValueIndex)return;
    activeValueIndex=index;
    valuesScrubSection.style.setProperty('--values-active',String(index));
    valueRows.forEach((row,rowIndex)=>{
      row.classList.toggle('is-active',rowIndex===index);
      row.classList.toggle('is-before',rowIndex<index);
      row.classList.toggle('is-after',rowIndex>index);
    });
    valueImages.forEach((image,imageIndex)=>image.classList.toggle('is-active',imageIndex===index));
  }
  function updateValuesScrub(){
    valuesTicking=false;
    const sectionRect=valuesScrubSection.getBoundingClientRect();
    const travel=Math.max(1,valuesScrubSection.offsetHeight-window.innerHeight);
    const scrolled=Math.min(Math.max(-sectionRect.top,0),travel);
    const progress=scrolled/travel;
    const targetLine=window.innerHeight*.48;
    let closestIndex=0;
    let closestDistance=Infinity;
    valueRows.forEach((row,index)=>{
      const rect=row.getBoundingClientRect();
      const rowCenter=rect.top+(rect.height*.5);
      const distance=Math.abs(rowCenter-targetLine);
      if(distance<closestDistance){
        closestDistance=distance;
        closestIndex=index;
      }
    });
    valuesScrubSection.style.setProperty('--values-progress',progress.toFixed(4));
    setActiveValue(closestIndex);
  }
  function requestValuesScrub(){
    if(valuesTicking)return;
    valuesTicking=true;
    requestAnimationFrame(updateValuesScrub);
  }
  addEventListener('scroll',requestValuesScrub,{passive:true});
  addEventListener('resize',requestValuesScrub);
  updateValuesScrub();
}


const teamCarousel=$('.team-section');
if(teamCarousel){
  const track=$('.team-card-grid',teamCarousel);
  const cards=$$('.team-card',teamCarousel);
  const prev=$('.team-prev',teamCarousel);
  const next=$('.team-next',teamCarousel);
  let activeTeamIndex=0;
  function maxTeamIndex(){
    if(!track||!cards.length)return 0;
    const visible=Math.max(1,Math.round(track.clientWidth/(cards[0].getBoundingClientRect().width||track.clientWidth)));
    return Math.max(0,cards.length-visible);
  }
  function setTeamIndex(index,behavior='smooth'){
    if(!track||!cards.length)return;
    activeTeamIndex=Math.min(Math.max(index,0),maxTeamIndex());
    const target=cards[activeTeamIndex];
    track.scrollTo({left:target.offsetLeft-track.offsetLeft,behavior});
    updateTeamButtons();
  }
  function updateTeamButtons(){
    const max=maxTeamIndex();
    prev.disabled=activeTeamIndex<=0;
    next.disabled=activeTeamIndex>=max;
    cards.forEach((card,index)=>card.classList.toggle('is-active',index===activeTeamIndex));
  }
  prev?.addEventListener('click',()=>setTeamIndex(activeTeamIndex-1));
  next?.addEventListener('click',()=>setTeamIndex(activeTeamIndex+1));
  track?.addEventListener('scroll',()=>{
    if(!cards.length)return;
    const current=[...cards].reduce((closest,card,index)=>{
      const distance=Math.abs((card.offsetLeft-track.offsetLeft)-track.scrollLeft);
      return distance<closest.distance?{index,distance}:closest;
    },{index:0,distance:Infinity});
    activeTeamIndex=Math.min(current.index,maxTeamIndex());
    updateTeamButtons();
  },{passive:true});
  addEventListener('resize',()=>setTeamIndex(activeTeamIndex,'auto'));
  setTeamIndex(0,'auto');
}

const guidesValuesCarousel=$('.guides-values');
if(guidesValuesCarousel){
  const track=$('.guides-values-grid',guidesValuesCarousel);
  const cards=$$('.guides-values-grid article',guidesValuesCarousel);
  const prefersReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let valuesAutoTimer=0;
  let valuesAutoPaused=false;
  let activeValuesIndex=0;
  function maxValuesIndex(){
    if(!track||!cards.length)return 0;
    const cardWidth=cards[0].getBoundingClientRect().width||track.clientWidth;
    const visible=Math.max(1,Math.floor(track.clientWidth/cardWidth));
    return Math.max(0,cards.length-visible);
  }
  function setValuesIndex(index,behavior='smooth'){
    if(!track||!cards.length)return;
    const max=maxValuesIndex();
    activeValuesIndex=index>max?0:Math.max(0,index);
    const target=cards[activeValuesIndex];
    track.scrollTo({left:target.offsetLeft-track.offsetLeft,behavior});
    cards.forEach((card,cardIndex)=>card.classList.toggle('is-active',cardIndex===activeValuesIndex));
  }
  function syncValuesIndex(){
    if(!track||!cards.length)return;
    const current=cards.reduce((closest,card,index)=>{
      const distance=Math.abs((card.offsetLeft-track.offsetLeft)-track.scrollLeft);
      return distance<closest.distance?{index,distance}:closest;
    },{index:0,distance:Infinity});
    activeValuesIndex=Math.min(current.index,maxValuesIndex());
    cards.forEach((card,cardIndex)=>card.classList.toggle('is-active',cardIndex===activeValuesIndex));
  }
  function startValuesAuto(){
    if(prefersReducedMotion||!track||cards.length<2||valuesAutoTimer)return;
    valuesAutoTimer=window.setInterval(()=>{
      if(valuesAutoPaused||document.hidden)return;
      setValuesIndex(activeValuesIndex+1);
    },3200);
  }
  function pauseValuesAuto(){valuesAutoPaused=true;}
  function resumeValuesAuto(){valuesAutoPaused=false;}
  track?.addEventListener('scroll',syncValuesIndex,{passive:true});
  guidesValuesCarousel.addEventListener('mouseenter',pauseValuesAuto);
  guidesValuesCarousel.addEventListener('mouseleave',resumeValuesAuto);
  guidesValuesCarousel.addEventListener('focusin',pauseValuesAuto);
  guidesValuesCarousel.addEventListener('focusout',resumeValuesAuto);
  guidesValuesCarousel.addEventListener('pointerdown',pauseValuesAuto);
  guidesValuesCarousel.addEventListener('pointerup',resumeValuesAuto);
  guidesValuesCarousel.addEventListener('pointercancel',resumeValuesAuto);
  addEventListener('resize',()=>setValuesIndex(activeValuesIndex,'auto'));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncValuesIndex();});
  setValuesIndex(0,'auto');
  startValuesAuto();
}
