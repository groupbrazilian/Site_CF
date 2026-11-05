(() => {
  'use strict';
  const key=n=>n.nodeType===1?n.getAttribute('data-sync-key'):null;
  function attributes(old,next,skip=new Set()){
    for(const attr of [...old.attributes])if(!skip.has(attr.name)&&!next.hasAttribute(attr.name))old.removeAttribute(attr.name);
    for(const attr of [...next.attributes])if(!skip.has(attr.name)&&old.getAttribute(attr.name)!==attr.value)old.setAttribute(attr.name,attr.value);
  }
  function patch(old,next,pool){
    if(old.nodeType===3||old.nodeType===8){if(old.nodeValue!==next.nodeValue)old.nodeValue=next.nodeValue;return;}
    if(old.tagName==='IMG'){
      const same=old.hasAttribute('data-image-urls')?old.getAttribute('data-image-urls')===next.getAttribute('data-image-urls'):old.getAttribute('src')===next.getAttribute('src');
      attributes(old,next,new Set(same?['src','data-image-index','loading']:[]));return;
    }
    attributes(old,next);children(old,next,pool);
  }
  function children(old,next,pool){
    let cursor=old.firstChild;
    for(const wanted of [...next.childNodes]){
      const id=key(wanted);
      let existing=id?pool.get(id):null;
      if(!id&&cursor&&!key(cursor)&&cursor.nodeType===wanted.nodeType&&(cursor.nodeType!==1||cursor.tagName===wanted.tagName))existing=cursor;
      if(existing){if(existing!==cursor)old.insertBefore(existing,cursor);patch(existing,wanted,pool);cursor=existing.nextSibling;}
      else{const added=wanted.cloneNode(false);if(wanted.nodeType===1)children(added,wanted,pool);old.insertBefore(added,cursor);}
    }
    while(cursor){const next=cursor.nextSibling;cursor.remove();cursor=next;}
  }
  function reconcile(root,markup){
    const template=document.createElement('template');template.innerHTML=markup;
    const pool=new Map([...root.querySelectorAll('[data-sync-key]')].map(n=>[key(n),n]));
    children(root,template.content,pool);
  }
  function capture(){
    const visible=[...document.querySelectorAll('#colecao [data-sync-key]')].find(e=>{const r=e.getBoundingClientRect();return r.bottom>100&&r.top<innerHeight;});
    return {key:visible&&key(visible),top:visible?.getBoundingClientRect().top,y:scrollY,dialog:document.querySelector('#detail')?.scrollTop||0};
  }
  function restore(state){
    const anchor=state.key?[...document.querySelectorAll('#colecao [data-sync-key]')].find(e=>key(e)===state.key):null;
    const top=anchor?state.y+anchor.getBoundingClientRect().top-state.top:state.y;
    window.scrollTo({top,behavior:'instant'});const detail=document.querySelector('#detail');if(detail?.open)detail.scrollTop=state.dialog;
  }
  window.CF_SYNC_DOM={reconcile,capture,restore};
})();
