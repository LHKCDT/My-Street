import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.querySelector('#streetCanvas');
const STEP=6.3, DEPTH=5, BUILDING_X=10.2, ROAD_HALF=5.75, SHOP_FACE=4.7;
let renderer,scene,camera,active=false,placedShops=Array(20).fill(null),shopGeneration=0;
let player={x:0,z:13,heading:0},targetHeading=0,velocityX=0,velocityZ=0,lastFrame=0;
const held=new Set(),dynamicMeshes=[],loader=new THREE.TextureLoader();
function material(color,roughness=.92){return new THREE.MeshStandardMaterial({color,roughness,metalness:.02})}
function box(parent,w,h,d,x,y,z,mat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
function plane(parent,w,h,x,y,z,mat,rotationX=0){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);mesh.position.set(x,y,z);mesh.rotation.x=rotationX;parent.add(mesh);return mesh}
function init(){
 if(renderer)return;
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();scene.background=new THREE.Color('#e8f6ff');scene.fog=new THREE.Fog('#e8f6ff',70,125);camera=new THREE.PerspectiveCamera(66,1,.1,180);camera.rotation.order='YXZ';
 scene.add(new THREE.HemisphereLight('#f8fcff','#80966b',2.05));const sun=new THREE.DirectionalLight('#fff4da',2);sun.position.set(-18,32,18);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=45;sun.shadow.camera.bottom=-45;scene.add(sun);
 buildStreet();window.addEventListener('resize',resize);renderer.setAnimationLoop(frame);resize();syncCamera();
}
function buildStreet(){
 const grass=material('#719a43'),road=material('#1b2231',.98),sidewalk=material('#aab3ba'),white=material('#f8f8f4'),yellow=material('#ffd019');
 const ground=plane(scene,170,170,0,-.12,-50,grass,-Math.PI/2);ground.receiveShadow=true;plane(scene,11.5,125,0,.005,-48,road,-Math.PI/2);
 for(const side of [-1,1]){plane(scene,2.8,125,side*7.15,.012,-48,sidewalk,-Math.PI/2);plane(scene,1.15,125,side*9.125,.008,-48,grass,-Math.PI/2)}
 for(let z=5;z>-73;z-=7.2){if(z>-25&&z<-12)continue;box(scene,.18,.025,2.35,0,.025,z,white)}
 // Five lengthwise crossing bands, distributed across the road at one shared position.
 for(let i=0;i<5;i++)box(scene,.52,.035,10.1,-4.08+i*2.04,.035,-18.5,yellow);
}
function cropSquare(image){const size=1024,side=Math.min(image.naturalWidth||image.width,image.naturalHeight||image.height),sx=((image.naturalWidth||image.width)-side)/2,sy=((image.naturalHeight||image.height)-side)/2,canvas=document.createElement('canvas');canvas.width=canvas.height=size;canvas.getContext('2d').drawImage(image,sx,sy,side,side,0,0,size,size);return canvas}
function addShopFacade(x,z,rotationY,shop,side,y){
 const generation=shopGeneration,size=SHOP_FACE,face=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({color:'#fff',side:THREE.DoubleSide}));face.position.set(x-side*.045,y,z);face.rotation.y=rotationY;scene.add(face);
 const source=loader.load(shop.image,tex=>{if(generation!==shopGeneration){tex.dispose();return}const square=cropSquare(tex.image),squareTexture=new THREE.CanvasTexture(square);squareTexture.colorSpace=THREE.SRGBColorSpace;squareTexture.anisotropy=renderer?.capabilities.getMaxAnisotropy?.()||1;face.material.map=squareTexture;face.material.needsUpdate=true;tex.dispose()},undefined,()=>{});source.colorSpace=THREE.SRGBColorSpace;registerDynamic(face);
}
function registerDynamic(...meshes){dynamicMeshes.push(...meshes)}
function disposeShops(){shopGeneration++;for(const mesh of dynamicMeshes){scene.remove(mesh);mesh.geometry?.dispose();const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];for(const mat of mats||[]){mat.map?.dispose();mat.dispose()}}dynamicMeshes.length=0}
function dynamicBox(w,h,d,x,y,z,color){const mesh=box(scene,w,h,d,x,y,z,material(color));registerDynamic(mesh);return mesh}
function setShops(items){
 placedShops=Array.isArray(items)?items.slice(0,20):Array(20).fill(null);while(placedShops.length<20)placedShops.push(null);if(!scene)return;disposeShops();
 for(const side of [-1,1])for(let i=0;i<5;i++){
  const z=-4-i*STEP,x=side*BUILDING_X,w=6.8,d=DEPTH,groundSlot=side===-1?5+i:10+i,upperSlot=side===-1?i:15+i,groundShop=placedShops[groundSlot],upperShop=placedShops[upperSlot];
  if(!groundShop&&!upperShop)continue;
  const twoFloors=Boolean(groundShop&&upperShop),h=twoFloors?SHOP_FACE*2:SHOP_FACE,inward=side===-1?1:-1,frontX=x+inward*(w/2+.035),rotationY=side===-1?Math.PI/2:-Math.PI/2;
  dynamicBox(w,h,d,x,h/2,z,'#b8bec1');dynamicBox(w+.38,.28,d+.34,x,h+.12,z,'#4e5e71');
  if(twoFloors){addShopFacade(frontX,z,rotationY,groundShop,side,SHOP_FACE/2);addShopFacade(frontX,z,rotationY,upperShop,side,SHOP_FACE*1.5);dynamicBox(.09,.075,SHOP_FACE,frontX-side*.045,SHOP_FACE,z,'#aeb6ba')}
  else addShopFacade(frontX,z,rotationY,groundShop||upperShop,side,SHOP_FACE/2);
 }
}
function resize(){if(!renderer||!canvas.clientWidth||!canvas.clientHeight)return;renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix()}
function wrap(a){return Math.atan2(Math.sin(a),Math.cos(a))}
function syncCamera(){camera.position.set(player.x,2.18,player.z);camera.rotation.set(0,-player.heading,0,'YXZ')}
function facing(){const q=Math.round((((player.heading%(Math.PI*2))+(Math.PI*2))%(Math.PI*2))/(Math.PI/2))%4;window.dispatchEvent(new CustomEvent('street3dheading',{detail:{heading:q,angle:player.heading,x:player.x,z:player.z}}))}
function frame(time){if(!active)return;const dt=Math.min(.05,lastFrame?Math.max(0,(time-lastFrame)/1000):0);lastFrame=time;const turn=wrap(targetHeading-player.heading);player.heading=wrap(player.heading+turn*(1-Math.exp(-7.5*dt)));
 let f=(held.has('forward')?1:0)-(held.has('backward')?1:0),s=(held.has('right')?1:0)-(held.has('left')?1:0),fx=Math.sin(player.heading),fz=-Math.cos(player.heading),rx=Math.cos(player.heading),rz=Math.sin(player.heading),dx=fx*f+rx*s,dz=fz*f+rz*s,len=Math.hypot(dx,dz)||1,speed=4.5;dx=dx/len*speed*(f||s?1:0);dz=dz/len*speed*(f||s?1:0);const rate=(f||s)?10:8;velocityX+=(dx-velocityX)*(1-Math.exp(-rate*dt));velocityZ+=(dz-velocityZ)*(1-Math.exp(-rate*dt));player.x=Math.max(-4.95,Math.min(4.95,player.x+velocityX*dt));player.z=Math.max(-37.5,Math.min(14.5,player.z+velocityZ*dt));syncCamera();if(Math.abs(turn)>.002||Math.abs(velocityX)>.01||Math.abs(velocityZ)>.01)facing();renderer.render(scene,camera)}
function setPlayer(next={}){if('heading'in next)targetHeading=Number(next.heading)*Math.PI/2;if('x'in next)player.x=Math.max(-4.95,Math.min(4.95,next.x));if('z'in next)player.z=Math.max(-37.5,Math.min(14.5,next.z));syncCamera()}
function movement(dir,on){if(on)held.add(dir);else held.delete(dir)}function nudge(dir){if(held.has(dir))return;held.add(dir);setTimeout(()=>held.delete(dir),STEP/4.5*1000)}
function enter(){init();active=true;lastFrame=0;player.x=0;velocityX=0;resize();setShops(placedShops);syncCamera();facing()}function leave(){active=false;held.clear()}function clearMovement(){held.clear()}
window.street3D={enter,leave,setShops,setPlayer,setMovement:movement,nudge,clearMovement};
